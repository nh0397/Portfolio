from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os
from google import genai
import openai
import numpy as np
from urllib.parse import quote_plus
import json
import re
from datetime import datetime

# Load environment variables
load_dotenv()

# Determine the base URL based on the environment
FLASK_ENV = os.getenv('FLASK_ENV')
if FLASK_ENV == 'production':
    BASE_URL = os.getenv('PRODUCTION_URL')
else:
    BASE_URL = os.getenv('DEVELOPMENT_URL')

# Encode the MongoDB username and password
user_name = quote_plus(os.getenv('MONGO_USERNAME'))
password = quote_plus(os.getenv('MONGO_PASSWORD'))

# Construct the MongoDB URI
MONGO_URI = f"mongodb+srv://{user_name}:{password}@{os.getenv('MONGO_APP_NAME')}.5kfcs.mongodb.net/?retryWrites=true&w=majority&appName={os.getenv('MONGO_APP_NAME')}"

app = Flask(__name__)

# Secret key for session (use environment variable in production)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Get environment URLs with fallbacks
development_url = os.getenv('DEVELOPMENT_URL', 'http://localhost:3000')
production_url = os.getenv('PRODUCTION_URL', 'https://your-production-domain.com')

# Fixed CORS configuration with explicit origins and OPTIONS support
CORS(app, resources={
    r"/*": {
        "origins": [development_url, production_url, "http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Debug environment variables
def debug_env_variables():
    print("\n🔧 Current Environment Variables:")
    print(f"   MONGO_DB_NAME: '{os.getenv('MONGO_DB_NAME')}'")
    print(f"   MONGO_CL_NAME: '{os.getenv('MONGO_CL_NAME')}'")
    print(f"   MONGO_INDEX_NAME: '{os.getenv('MONGO_INDEX_NAME')}'")
    print(f"   MONGO_EMBEDDING_FIELD_NAME: '{os.getenv('MONGO_EMBEDDING_FIELD_NAME')}'")
    
    # Check if they match your Atlas setup
    expected = {
        'MONGO_DB_NAME': 'detail-extractor',
        'MONGO_CL_NAME': 'detail-extractor-collection', 
        'MONGO_INDEX_NAME': 'vector_index_3',
        'MONGO_EMBEDDING_FIELD_NAME': 'embedding'
    }
    
    print("\n✅ Expected values:")
    for key, value in expected.items():
        current = os.getenv(key)
        match = "✅" if current == value else "❌"
        print(f"   {key}: '{value}' {match}")

# MongoDB connection with testing
try:
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
    
    # Test MongoDB connection
    client.admin.command('ping')
    print("✅ Successfully connected to MongoDB!")
    
    # Get database and collection
    db = client[os.getenv('MONGO_DB_NAME')]
    collection = db[os.getenv('MONGO_CL_NAME')]
    
    # Test database and collection access
    print(f"📊 Database name: {db.name}")
    print(f"📁 Collection name: {collection.name}")
    
    # Count documents in collection
    doc_count = collection.count_documents({})
    print(f"📄 Total documents in collection: {doc_count}")
    
    # List all collections in database
    collections = db.list_collection_names()
    print(f"📋 Available collections: {collections}")
    
    # Show sample document structure (if any exist)
    if doc_count > 0:
        sample_doc = collection.find_one()
        print("📝 Sample document structure:")
        for key in sample_doc.keys():
            print(f"   - {key}: {type(sample_doc[key])}")
            
        # Check embedding field specifically
        if 'embedding' in sample_doc:
            embedding = sample_doc['embedding']
            print(f"   📊 Embedding details:")
            print(f"      - Type: {type(embedding)}")
            print(f"      - Length: {len(embedding) if isinstance(embedding, list) else 'Not a list'}")
            if isinstance(embedding, list) and len(embedding) == 768:
                print("      - ✅ Dimension matches Google embedding-001")
            else:
                print(f"      - ⚠️  Dimension mismatch (expected 768)")
    else:
        print("⚠️  No documents found in collection!")
        
    # Test vector search index
    try:
        indexes = collection.list_indexes()
        index_names = [index['name'] for index in indexes]
        print(f"🔍 Regular MongoDB indexes: {index_names}")
        print("⚠️  Note: Atlas Vector Search indexes are separate and not shown here")
        
    except Exception as e:
        print(f"❌ Error checking indexes: {e}")
    
    # Debug environment variables
    debug_env_variables()
        
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    client = None
    db = None
    collection = None

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GOOGLE_API_KEY')
if GEMINI_API_KEY:
    print("✅ Gemini API configured")
else:
    print("❌ Gemini API key not found")

class FireworksEmbeddings:
    def __init__(self) -> None:
        self.client = openai.OpenAI(
            api_key=os.getenv('FIREWORKS_API_KEY'),
            base_url="https://api.fireworks.ai/inference/v1"
        )

    def generate_embeddings(self, inp: str) -> list:
        """Generate embeddings for input text using Fireworks.ai."""
        if not os.getenv('FIREWORKS_API_KEY'):
            print("Please set correct Fireworks API key")
            return []

        try:
            response = self.client.embeddings.create(
                model="nomic-ai/nomic-embed-text-v1.5",
                input=inp
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Embeddings not found: {e}")
            return []

# Function to format the text based on symbols (*, **)
def format_text(text: str) -> str:
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)  # Bold
    text = re.sub(r'\*(.*?)\n', r'<ul><li>\1</li></ul>', text)  # Bullet Points
    return text

# Function to manage conversation context within the session
def get_conversation_context(session_id, max_tokens=1000):
    if 'messages' in session:
        context_text = session['messages']
        token_count = len(context_text.split())  # Simple token estimation
        if token_count > max_tokens:
            # Truncate context to fit within token limits
            context_text = " ".join(context_text.split()[-max_tokens:])
        return context_text
    return ""

# Function to save the conversation context within the session
def save_conversation_context(session_id, message, response):
    if 'messages' in session:
        session['messages'] += f"\nUser: {message}\nBot: {response}"
    else:
        session['messages'] = f"User: {message}\nBot: {response}"

# Function to find similar documents using vector search
def find_similar_documents(
    collection,
    inp_document_embedding: list,
    index_name: str,
    col_name: str,
    no_of_docs: int = 3,
    query: dict = {},
) -> list:
    try:
        print(f"🔍 Starting vector search...")
        print(f"   - Index: {index_name}")
        print(f"   - Field: {col_name}")
        print(f"   - Embedding length: {len(inp_document_embedding)}")
        
        pipeline = [
            {
                "$vectorSearch": {
                    "index": index_name,
                    "path": col_name,
                    "queryVector": inp_document_embedding,
                    "numCandidates": 49,
                    "limit": no_of_docs,
                }
            },
            {"$match": query},
            {
                "$project": {
                    "chunk_text": 1,
                    "source_type": 1,
                    "chunk_index": 1,
                    "metadata": 1,
                    "token_count": 1,
                    "score": {"$meta": "vectorSearchScore"},
                }
            },
        ]
        
        documents = collection.aggregate(pipeline)
        result = list(documents)[:no_of_docs]
        print(f"🔍 Vector search returned {len(result)} documents")
        
        if result:
            for i, doc in enumerate(result):
                score = doc.get('score', 'N/A')
                print(f"   - Document {i+1}: Score {score}")
        else:
            print("   - No documents found")
            
        return result
    except Exception as e:
        print(f"❌ Vector search failed: {e}")
        print(f"   Error type: {type(e).__name__}")
        return []

# Add MongoDB health check route
@app.route('/health', methods=['GET'])
def health_check():
    try:
        if client is None:
            return jsonify({'status': 'error', 'message': 'MongoDB not connected'}), 500
            
        # Test connection
        client.admin.command('ping')
        
        # Count documents
        doc_count = collection.count_documents({}) if collection else 0
        
        return jsonify({
            'status': 'healthy',
            'mongodb': 'connected',
            'database': db.name if db else 'N/A',
            'collection': collection.name if collection else 'N/A',
            'document_count': doc_count,
            'environment_variables': {
                'MONGO_DB_NAME': os.getenv('MONGO_DB_NAME'),
                'MONGO_CL_NAME': os.getenv('MONGO_CL_NAME'),
                'MONGO_INDEX_NAME': os.getenv('MONGO_INDEX_NAME'),
                'MONGO_EMBEDDING_FIELD_NAME': os.getenv('MONGO_EMBEDDING_FIELD_NAME')
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Debug vector search route
@app.route('/debug-vector-search', methods=['GET'])
def debug_vector_search():
    try:
        if not collection:
            return jsonify({'error': 'Collection not available'}), 500
            
        # Use your exact configuration
        test_query = "What are Naisarg's skills?"
        
        google_embeddings = GoogleEmbeddings()
        query_embedding = google_embeddings.generate_embeddings(test_query)
        
        if not query_embedding:
            return jsonify({'error': 'Failed to generate embeddings'}), 500
        
        print(f"🔍 Query embedding length: {len(query_embedding)}")
        
        # Use your exact index and field names
        pipeline = [
            {
                "$vectorSearch": {
                    "index": os.getenv('MONGO_INDEX_NAME', 'vector_index_3'),
                    "path": os.getenv('MONGO_EMBEDDING_FIELD_NAME', 'embedding'),
                    "queryVector": query_embedding,
                    "numCandidates": 10,
                    "limit": 3,
                }
            },
            {
                "$project": {
                    "chunk_text": 1,
                    "source_type": 1,
                    "chunk_index": 1,
                    "metadata": 1,
                    "token_count": 1,
                    "score": {"$meta": "vectorSearchScore"},
                    "_id": 1
                }
            }
        ]
        
        print(f"🔍 Using pipeline: {json.dumps(pipeline, indent=2)}")
        
        results = list(collection.aggregate(pipeline))
        
        return jsonify({
            'success': True,
            'query': test_query,
            'embedding_length': len(query_embedding),
            'results_count': len(results),
            'results': results,
            'database': db.name,
            'collection': collection.name,
            'index': os.getenv('MONGO_INDEX_NAME'),
            'field': os.getenv('MONGO_EMBEDDING_FIELD_NAME'),
            'pipeline': pipeline
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__
        })

# Route for chatbot queries - FIXED TO HANDLE OPTIONS
# Update the chat route in your app.py
@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # Check if MongoDB is connected
        if client is None or db is None or collection is None:
            return jsonify({'response': 'Sorry, database connection is not available. Please try again later.'}), 500
            
        # Get data from request - try JSON first, then parse manually
        try:
            data = request.get_json(force=True, silent=True)
            if not data or not isinstance(data, dict):
                raise ValueError("Not valid JSON")
        except:
            # Parse the weird format manually
            data = {}
            body_str = request.data.decode('utf-8')
            for line in body_str.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    data[key.strip()] = value.strip().strip('"')
        
        message = data.get('message', '')
        conversation_history = data.get('conversation_history', '')
        session_id = data.get('session_id', 'default_session')
        
        if not message:
            return jsonify({'response': 'Error: No message provided'}), 400
        
        print(f"💬 Received message: {message}")
        print(f"📝 Session ID: {session_id}")

        print(f"💬 Received message: {message}")

        # Better classification that considers casual conversation
        initial_prompt = f"""Classify this message:

Previous conversation:
{conversation_history}

Current message: {message}

Classify as:
- 'context-specific' if asking about Naisarg, his work, skills, projects, or using pronouns referring to him
- 'casual' if it's casual conversation (greetings, "what's up", small talk, reactions like "lol")
- 'generic' if it's unrelated questions about other topics

Answer: """
        
        try:
            gemini_client = genai.Client(api_key=GEMINI_API_KEY)
            classification_response = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=initial_prompt
            )
            classification = classification_response.text.strip().lower()
            print(f'🤖 Classification: {classification}')
        except Exception as e:
            print(f"❌ Classification failed: {e}")
            classification = 'casual'
        
        if 'context-specific' in classification:
            print("🔍 Performing vector search...")
            fireworks_embeddings = FireworksEmbeddings()
            message_embedding = fireworks_embeddings.generate_embeddings(message)

            if not message_embedding:
                print("❌ Failed to generate embeddings")
                return jsonify({'response': 'Sorry, I encountered an issue processing your request.'}), 500

            similar_docs = find_similar_documents(
                collection=collection,
                inp_document_embedding=message_embedding,
                index_name=os.getenv('MONGO_INDEX_NAME'),
                col_name=os.getenv('MONGO_EMBEDDING_FIELD_NAME'),
                no_of_docs=3
            )

            if not similar_docs:
                print("⚠️  No similar documents found")
                prompt = f"""Previous conversation:
{conversation_history}

Question: {message}

You are Naisarg's AI assistant. Answer the question about Naisarg directly and naturally. Be conversational but informative. Don't use repetitive greetings."""

            else:
                # Extract chunk content
                similar_texts = []
                chunk_metadata = []
                
                for chunk in similar_docs:
                    if "chunk_text" in chunk:
                        similar_texts.append(chunk["chunk_text"])
                        # Collect metadata for better context
                        metadata = {
                            "source_type": chunk.get("source_type", "unknown"),
                            "chunk_index": chunk.get("chunk_index", 0),
                            "section": chunk.get("metadata", {}).get("section", "general"),
                            "score": chunk.get("score", 0)
                        }
                        chunk_metadata.append(metadata)

                # Combine texts with source information
                combined_texts = ""
                for i, (text, meta) in enumerate(zip(similar_texts, chunk_metadata)):
                    source_info = f"[Source: {meta['source_type']} - {meta['section']} - Chunk {meta['chunk_index']}]"
                    combined_texts += f"{source_info}\n{text}\n\n"

                print(f"📄 Retrieved {len(similar_docs)} relevant chunks")
                print(f"📊 Chunk sources: {[meta['source_type'] for meta in chunk_metadata]}")

                prompt = f"""Information about Naisarg:
{combined_texts}

Previous conversation:
{conversation_history}

Question: {message}

You are Naisarg's AI assistant. Answer naturally about Naisarg using the information provided. Be conversational and helpful. Don't repeat greetings or summarize previous conversation unless asked."""

        elif 'casual' in classification:
            # Handle casual conversation naturally
            print('💭 Handling casual conversation')
            prompt = f"""Previous conversation:
{conversation_history}

User message: {message}

You are Naisarg's AI assistant. The user is making casual conversation. Respond naturally and friendly, then gently guide them to ask about Naisarg if appropriate. 

DO:
- Be warm and conversational
- Acknowledge their casual message naturally
- Suggest they can ask about Naisarg
- Match their energy level

DON'T:
- Be robotic or rude
- Just say "Only Naisarg-related questions"
- Ignore their casual message
- Be overly formal"""

        else:
            # Generic/unrelated questions
            print('💭 Handling generic question')
            prompt = f"""Previous conversation:
{conversation_history}

User message: {message}

You are Naisarg's AI assistant. The user asked about something unrelated to Naisarg. Respond politely that you specialize in questions about Naisarg, but do it in a friendly way.

DO:
- Be polite and understanding
- Acknowledge their question
- Explain your role nicely
- Invite them to ask about Naisarg

DON'T:
- Be rude or dismissive
- Just say "No" or "Only Naisarg-related questions"
- Ignore their question completely"""

        # Generate response
        try:
            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            response_text = format_text(response.text)
        except Exception as e:
            print(f"❌ Gemini API failed: {e}")
            return jsonify({'response': 'Sorry, I encountered an issue generating a response. Please try again.'}), 500

        print(f"✅ Response generated successfully")
        return jsonify({'response': response_text})
    
    except Exception as e:
        print(f"❌ Error in chat route: {e}")
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"\n🚀 Starting Flask app on port {port}")
    print(f"🔗 Health check: http://localhost:{port}/health")
    print(f"🔗 Vector search debug: http://localhost:{port}/debug-vector-search")
    app.run(host='0.0.0.0', port=port, debug=True)
