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
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
BASE_URL = os.getenv('PRODUCTION_URL') if FLASK_ENV == 'production' else os.getenv('DEVELOPMENT_URL')

# MongoDB connection
user_name = quote_plus(os.getenv('MONGO_USERNAME', ''))
password = quote_plus(os.getenv('MONGO_PASSWORD', ''))
MONGO_URI = f"mongodb+srv://{user_name}:{password}@{os.getenv('MONGO_APP_NAME')}.5kfcs.mongodb.net/?retryWrites=true&w=majority&appName={os.getenv('MONGO_APP_NAME')}"

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# CORS setup
CORS(app, resources={
    r"/*": {
        "origins": ["*", os.getenv('DEVELOPMENT_URL'), os.getenv('PRODUCTION_URL')],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Initialize MongoDB
client = None
collection = None
try:
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
    db = client[os.getenv('MONGO_DB_NAME', 'detail-extractor')]
    collection = db[os.getenv('MONGO_CL_NAME', 'detail-extractor-collection')]
    print("✅ Connected to MongoDB")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")

# Helper: Format text for UI
def format_text(text: str) -> str:
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*(.*?)\n', r'<ul><li>\1</li></ul>', text)
    return text

# Helper: Vector Search
def find_similar_documents(query_embedding, no_of_docs=5):
    if collection is None: return []
    try:
        pipeline = [
            {
                "$vectorSearch": {
                    "index": os.getenv('MONGO_INDEX_NAME', 'vector_index_4'),
                    "path": os.getenv('MONGO_EMBEDDING_FIELD_NAME', 'embedding'),
                    "queryVector": query_embedding,
                    "numCandidates": 100,
                    "limit": no_of_docs,
                }
            },
            {
                "$project": {
                    "chunk_text": 1,
                    "source_type": 1,
                    "score": {"$meta": "vectorSearchScore"},
                }
            }
        ]
        return list(collection.aggregate(pipeline))
    except Exception as e:
        print(f"❌ Vector search failed: {e}")
        return []

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy' if client else 'error',
        'mongodb': 'connected' if client else 'disconnected'
    })

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS': return '', 200
    
    try:
        data = request.get_json()
        message = data.get('message', '')
        conversation_history = data.get('conversation_history', '')
        
        if not message: return jsonify({'response': 'No message provided'}), 400

        # Initialize Services
        llm = LLMProvider(os.getenv('LLM_PROVIDER', 'groq'))
        embeddings = FireworksEmbeddings() # UNIFIED to Fireworks to match ingestion
        graph = GraphRAG()

        # 1. Classification
        classify_prompt = f"Classify as 'context-specific' (about Naisarg) or 'casual'. Message: {message}. Answer with 1 word."
        classification = llm.generate_content(classify_prompt, conversation_history).lower()
        print(f"🤖 Classification: {classification}")

        if 'context-specific' in classification:
            # 2. Query Rewriting (Contextualization)
            rewrite_prompt = f"Rewrite this question about Naisarg as a standalone query: {message}. History: {conversation_history}. Standalone query:"
            standalone_query = llm.generate_content(rewrite_prompt, "")
            print(f"🔄 Standalone: {standalone_query}")

            # 3. Parallel Retrieval
            # Vector
            msg_embedding = embeddings.generate_embeddings(standalone_query)
            similar_docs = find_similar_documents(msg_embedding)
            vector_context = "\n".join([doc["chunk_text"] for doc in similar_docs])
            
            # Graph
            print("🕸️ Querying Knowledge Graph...")
            cypher = graph.generate_cypher(standalone_query, llm)
            graph_facts = graph.query(cypher) if cypher else []
            graph_context = json.dumps(graph_facts, indent=2) if graph_facts else ""
            
            if graph_facts: print(f"✅ Found {len(graph_facts)} facts in Graph")
            if similar_docs: print(f"📄 Found {len(similar_docs)} chunks in Vector")

            if not vector_context and not graph_context:
                prompt = f"Answer naturally: {message}. If unknown, say: 'I don't have this info, reach out to Naisarg directly.'"
            else:
                prompt = f"""Use the following facts to answer Naisarg's portfolio question:
VECTOR CONTEXT: {vector_context}
GRAPH FACTS: {graph_context}
Question: {message}
Rules: Be brief, naturally conversational, and prioritize Graph facts for specific data."""
        else:
            prompt = f"Respond naturally to this greeting/casual chat: {message}. Mention you are Naisarg's assistant."

        # 4. Generate & Format Response
        response = llm.generate_content(prompt, conversation_history)
        return jsonify({'response': format_text(response)})
    
    except Exception as e:
        print(f"❌ Chat Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
