#!/usr/bin/env python3
"""
Test script to generate embeddings and store to MongoDB
Using the exact format you provided
"""

import os
from dotenv import load_dotenv
from google import genai
from pymongo import MongoClient
from urllib.parse import quote_plus

# Load environment variables
load_dotenv()

# Set up Gemini API key
GEMINI_API_KEY = os.getenv('GOOGLE_API_KEY')

def test_embeddings():
    """Test embedding generation and MongoDB storage"""
    
    print("🧪 Testing Embedding Generation and MongoDB Storage")
    print("=" * 60)
    
    # Initialize Google AI client
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    # Test text
    test_text = "What is the meaning of life?"
    
    print(f"📝 Test text: '{test_text}'")
    
    # Generate embedding using your exact format
    print("\n🔮 Generating embedding...")
    try:
        result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=test_text
        )
        
        print(f"✅ Embedding generated successfully!")
        print(f"📊 Result type: {type(result.embeddings)}")
        print(f"📊 Embedding type: {type(result.embeddings)}")
        
        # Try different ways to extract the embedding
        print("\n🔍 Trying different extraction methods...")
        
        # Method 1: Direct access
        try:
            emb1 = result.embeddings
            print(f"Method 1 - Direct: {type(emb1)}, length: {len(emb1) if hasattr(emb1, '__len__') else 'N/A'}")
        except Exception as e:
            print(f"Method 1 failed: {e}")
        
        # Method 2: .values attribute (on first embedding)
        try:
            emb2 = result.embeddings[0].values
            print(f"Method 2 - [0].values: {type(emb2)}, length: {len(emb2)}")
        except Exception as e:
            print(f"Method 2 failed: {e}")
        
        # Method 3: Convert to list
        try:
            emb3 = list(result.embeddings)
            print(f"Method 3 - list(): {type(emb3)}, length: {len(emb3)}")
        except Exception as e:
            print(f"Method 3 failed: {e}")
            
        # Method 4: Access first element
        try:
            emb4 = result.embeddings[0] if hasattr(result.embeddings, '__getitem__') else None
            print(f"Method 4 - [0]: {type(emb4)}")
        except Exception as e:
            print(f"Method 4 failed: {e}")
        
        # Choose the working method and store to MongoDB
        print("\n💾 Testing MongoDB storage...")
        
        # Connect to MongoDB
        user_name = quote_plus(os.getenv('MONGO_USERNAME'))
        password = quote_plus(os.getenv('MONGO_PASSWORD'))
        MONGO_URI = f"mongodb+srv://{user_name}:{password}@personal-data-extractor.5kfcs.mongodb.net/?retryWrites=true&w=majority&appName=personal-data-extractor"
        
        mongo_client = MongoClient(MONGO_URI)
        test_db = mongo_client[os.getenv('MONGO_DB_NAME')]['test_embeddings']
        
        # Try storing with different embedding formats
        test_doc = {
            "text": test_text,
            "source": "test",
            "chunk_index": 0
        }
        
        # Try Method 2 first (most likely to work)
        try:
            embedding_data = list(result.embeddings[0].values)
            test_doc["embedding"] = embedding_data
            test_db.insert_one(test_doc)
            print(f"✅ Successfully stored with [0].values method!")
            print(f"📊 Embedding dimensions: {len(embedding_data)}")
            test_db.drop()  # Clean up
        except Exception as e:
            print(f"❌ [0].values method failed: {e}")
            
            # Try Method 3
            try:
                embedding_data = list(result.embeddings)
                test_doc["embedding"] = embedding_data
                test_db.insert_one(test_doc)
                print(f"✅ Successfully stored with list() method!")
                print(f"📊 Embedding dimensions: {len(embedding_data)}")
                test_db.drop()  # Clean up
            except Exception as e2:
                print(f"❌ list() method failed: {e2}")
        
    except Exception as e:
        print(f"❌ Failed to generate embedding: {e}")

if __name__ == "__main__":
    test_embeddings()
