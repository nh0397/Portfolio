#!/usr/bin/env python3
"""
Test script for the Flask RAG Chatbot API
Run this script to test your API endpoints
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:5000"  # Change this to your server URL

def test_health_endpoint():
    """Test the health check endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed!")
            print(f"   MongoDB: {data['mongodb']['status']}")
            print(f"   Gemini API: {data['gemini_api']['status']}")
            print(f"   Documents: {data['mongodb']['document_count']}")
        else:
            print("❌ Health check failed!")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing health endpoint: {e}")

def test_config_endpoint():
    """Test the configuration endpoint"""
    print("\n🔍 Testing config endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/config")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Config endpoint working!")
            print(f"   Environment: {data['environment']}")
            print(f"   Chat Model: {data['chat_model']}")
        else:
            print("❌ Config endpoint failed!")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing config endpoint: {e}")

def test_debug_vector_search():
    """Test the vector search debug endpoint"""
    print("\n🔍 Testing vector search debug endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/debug-vector-search")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Vector search working!")
                print(f"   Query: {data['query']}")
                print(f"   Results: {data['results_count']}")
                print(f"   Embedding length: {data['embedding_length']}")
            else:
                print("❌ Vector search failed!")
                print(f"Error: {data.get('error')}")
        else:
            print("❌ Vector search endpoint failed!")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing vector search: {e}")

def test_chat_endpoint():
    """Test the chat endpoint"""
    print("\n🔍 Testing chat endpoint...")
    
    test_messages = [
        "What are Naisarg's skills?",
        "Tell me about Naisarg's projects",
        "Hello! How are you?",
        "What's the weather like?"
    ]
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n   Test {i}: {message}")
        try:
            payload = {
                "message": message,
                "conversation_history": "",
                "session_id": f"test_session_{i}"
            }
            
            response = requests.post(
                f"{BASE_URL}/chat",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"   Status Code: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Response: {data['response'][:100]}...")
            else:
                print(f"   ❌ Error: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # Small delay between requests
        time.sleep(1)

def main():
    """Run all tests"""
    print("🚀 Starting API Tests...")
    print("=" * 50)
    
    test_health_endpoint()
    test_config_endpoint()
    test_debug_vector_search()
    test_chat_endpoint()
    
    print("\n" + "=" * 50)
    print("🏁 Tests completed!")

if __name__ == "__main__":
    main() 