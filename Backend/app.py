from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os
from urllib.parse import quote_plus
import json
import re

# Import modular utilities
from utils.llm import LLMProvider
from utils.graph import GraphRAG
from utils.embeddings import FireworksEmbeddings

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

# Secret key for session
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Get environment URLs with fallbacks
development_url = os.getenv('DEVELOPMENT_URL', 'http://localhost:3000')
production_url = os.getenv('PRODUCTION_URL', 'https://your-production-domain.com')

# CORS configuration
CORS(app, resources={
    r"/*": {
        "origins": [development_url, production_url, "http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# ── MongoDB Connection ──
try:
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
    client.admin.command('ping')
    print("✅ Successfully connected to MongoDB!")
    
    db = client[os.getenv('MONGO_DB_NAME')]
    collection = db[os.getenv('MONGO_CL_NAME')]
    
    print(f"📊 Database: {db.name}")
    print(f"📁 Collection: {collection.name}")
    
    doc_count = collection.count_documents({})
    print(f"📄 Documents: {doc_count}")
    
    if doc_count > 0:
        sample_doc = collection.find_one()
        if 'embedding' in sample_doc:
            embedding = sample_doc['embedding']
            print(f"📊 Embedding dimension: {len(embedding) if isinstance(embedding, list) else 'Unknown'}")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    client = None
    db = None
    collection = None

# ── Neo4j Connection ──
graph_rag = GraphRAG()
try:
    res = graph_rag.query("MATCH (n) RETURN count(n) as count")
    print(f"✅ Connected to Neo4j (Nodes: {res[0]['count'] if res else 0})")
except Exception as e:
    print(f"❌ Neo4j connection failed: {e}")

# ── LLM Provider ──
LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'groq')
llm_provider = None
if LLM_PROVIDER:
    try:
        llm_provider = LLMProvider(LLM_PROVIDER)
        print(f"✅ LLM Provider '{LLM_PROVIDER}' initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize LLM provider: {e}")
        llm_provider = None

# ── Helper Functions ──

def format_text(text: str) -> str:
    """Format markdown-style text for the UI."""
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*(.*?)\n', r'<ul><li>\1</li></ul>', text)
    return text

def find_similar_documents(
    collection,
    inp_document_embedding: list,
    index_name: str,
    col_name: str,
    no_of_docs: int = 3,
    query: dict = {},
) -> list:
    """Find similar documents using MongoDB Atlas Vector Search."""
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
                    "numCandidates": 100,
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

# ── Routes ──

@app.route('/health', methods=['GET'])
def health_check():
    try:
        if client is None:
            return jsonify({'status': 'error', 'message': 'MongoDB not connected'}), 500
            
        client.admin.command('ping')
        doc_count = collection.count_documents({}) if collection else 0
        
        return jsonify({
            'status': 'healthy',
            'mongodb': 'connected',
            'database': db.name if db else 'N/A',
            'collection': collection.name if collection else 'N/A',
            'document_count': doc_count,
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        if client is None or db is None or collection is None:
            return jsonify({'response': 'Sorry, database connection is not available. Please try again later.'}), 500
            
        data = request.get_json()
        
        message = data.get('message', '')
        conversation_history = data.get('conversation_history', '')
        session_id = data.get('session_id', 'default_session')
        
        if not message:
            return jsonify({'response': 'Error: No message provided'}), 400
        
        print(f"💬 Received message: {message}")
        print(f"📝 Session ID: {session_id}")
        print(f"📜 Conversation history length: {len(conversation_history)} chars")
        if conversation_history:
            print(f"📜 Conversation preview: {conversation_history[:200]}...")
        else:
            print(f"⚠️  No conversation history provided!")

        # ── 1. Classification ──
        initial_prompt = f"""Classify this message:

Previous conversation:
{conversation_history}

Current message: {message}

Classify as:
- 'context-specific' ONLY if the user is explicitly asking about Naisarg Halvadiya, his work, skills, projects, or education.
- 'casual' for greetings, personal small talk, or off-topic questions (like songs, movies, etc.) that ARE NOT about Naisarg.

Answer with just one word: """
        
        try:
            if not llm_provider:
                raise ValueError("LLM provider not initialized")
            classification_response = llm_provider.generate_content(initial_prompt, conversation_history)
            classification = classification_response.lower()
            print(f'🤖 Classification: {classification}')
        except Exception as e:
            print(f"❌ Classification failed: {e}")
            classification = 'casual'
        
        if 'context-specific' in classification:
            print("🔍 Performing hybrid search...")
            
            # ── 2. Query Rewriting with Conversation Context ──
            standalone_query = message
            if conversation_history and len(conversation_history) > 50:
                try:
                    summary_prompt = f"""Summarize this conversation in 1-2 sentences, focusing on what was discussed about Naisarg:

{conversation_history}

Summary:"""
                    
                    conversation_summary = llm_provider.generate_content(summary_prompt, "")
                    print(f"📋 Conversation summary: {conversation_summary}")
                    
                    rewrite_prompt = f"""Context: {conversation_summary}

User's question: "{message}"

Rewrite this as a standalone search query about Naisarg that includes necessary context. Be specific.

Standalone query:"""
                    
                    standalone_query = llm_provider.generate_content(rewrite_prompt, "")
                    print(f"🔄 Query rewritten: '{message}' → '{standalone_query}'")
                except Exception as e:
                    print(f"⚠️  Query rewrite failed, using original: {e}")
                    standalone_query = message
            
            # ── 3. Vector Retrieval ──
            fireworks_embeddings = FireworksEmbeddings()
            message_embedding = fireworks_embeddings.generate_embeddings(standalone_query)

            if not message_embedding:
                print("❌ Failed to generate embeddings")
                return jsonify({'response': 'Sorry, I encountered an issue processing your request.'}), 500

            similar_docs = find_similar_documents(
                collection=collection,
                inp_document_embedding=message_embedding,
                index_name=os.getenv('MONGO_INDEX_NAME'),
                col_name=os.getenv('MONGO_EMBEDDING_FIELD_NAME'),
                no_of_docs=5
            )

            # ── 4. Graph Retrieval ──
            print("🕸️ Querying Knowledge Graph...")
            graph = GraphRAG()
            cypher = graph.generate_cypher(standalone_query, llm_provider)
            graph_facts = []
            if cypher:
                print(f"🔮 Generated Cypher: {cypher}")
                graph_facts = graph.query(cypher)
            
            # ── 5. Prepare Context ──
            vector_context = "\n".join([doc["chunk_text"] for doc in similar_docs if "chunk_text" in doc])
            graph_context = json.dumps(graph_facts, indent=2) if graph_facts else ""

            if not vector_context and not graph_context:
                print("⚠️ No similar documents or graph facts found")
                prompt = f"""Previous conversation:
{conversation_history}

Question: {message}

Answer naturally and briefly. Don't mention sources. If you don't have the info, say: "Unfortunately, I don't have information about this - you can reach out to Naisarg directly at naisarghalvadiya@gmail.com." """
            else:
                if graph_facts: print(f"✅ Found {len(graph_facts)} facts in Graph")
                if similar_docs: print(f"📄 Retrieved {len(similar_docs)} relevant chunks from Vector")

                prompt = f"""You are Naisarg's personal AI Assistant (his 'AI Buddy'). 
Your goal is to answer questions about him based on the facts below.

FACTS:
{vector_context}
{graph_context}

STRICT RESPONSE RULES:
1. Aim for a response length of approximately 100-150 words.
2. STRICT ADHERENCE TO FACTS: Do not assume industry types or role details not explicitly stated. 
   - If the data says "Ex-Mu Sigma", simply state he worked there. Do NOT guess their business (e.g., "delivery company").
3. NO PRIVACY INVASION: Do not guess his current location or status if the data is missing.
4. NEVER mention "Based on the provided facts," or internal data sources.
5. Tone: Helpful and Professional Personal Assistant.
6. NO PIVOTING: If the question was casual/off-topic, DO NOT mention Naisarg's bio unless specifically asked.

Question: {message}
Answer:"""

        elif 'casual' in classification:
            print('💭 Handling casual conversation')
            prompt = f"""Previous conversation:
{conversation_history}

User message: {message}

Respond naturally as a helpful AI assistant. 
- If the user asks an off-topic question (like movie/song info), answer it directly but DO NOT pivot to talking about Naisarg. 
- Stay in the user's chosen context.
- Keep it brief and friendly. """

        else:
            print('💭 Handling generic question')
            prompt = f"""Previous conversation:
{conversation_history}

User message: {message}

Let them know politely you focus on questions about Naisarg. Be brief and natural."""

        # ── 6. Generate Response ──
        try:
            if not llm_provider:
                raise ValueError("LLM provider not initialized")
            response = llm_provider.generate_content(prompt, conversation_history)
            response_text = format_text(response)
        except Exception as e:
            print(f"❌ LLM API failed: {e}")
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
    app.run(host='0.0.0.0', port=port, debug=True)
