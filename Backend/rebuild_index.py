"""
Rebuild the vector search index with updated schema (includes date, metadata fields).
"""
import os
from urllib.parse import quote_plus
import certifi
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.operations import SearchIndexModel

load_dotenv()

EMBEDDING_DIMS = 768
CHUNKS_COLLECTION = os.getenv("MONGO_CHUNKS_CL_NAME", "portfolio-chunks")
CHUNKS_INDEX = os.getenv("MONGO_CHUNKS_INDEX_NAME", "chunks_vector_index")


def mongo_client() -> MongoClient:
    user = quote_plus(os.getenv("MONGO_USERNAME", ""))
    pwd = quote_plus(os.getenv("MONGO_PASSWORD", ""))
    host = os.getenv("MONGO_HOST") or f"{os.getenv('MONGO_APP_NAME')}.5kfcs.mongodb.net"
    uri = f"mongodb+srv://{user}:{pwd}@{host}/?retryWrites=true&w=majority"
    return MongoClient(uri, tlsCAFile=certifi.where())


def rebuild_index():
    client = mongo_client()
    db = client[os.getenv("MONGO_DB_NAME")]
    collection = db[CHUNKS_COLLECTION]

    # Delete existing index
    try:
        existing = [i["name"] for i in collection.list_search_indexes()]
        if CHUNKS_INDEX in existing:
            print(f"🗑️  Deleting old index '{CHUNKS_INDEX}'...")
            collection.drop_search_index(CHUNKS_INDEX)
            print(f"✅ Deleted")
    except Exception as e:
        print(f"⚠️  Could not delete index: {e}")

    # Wait a moment for deletion to propagate
    import time
    time.sleep(2)

    # Create new index with date + metadata fields
    definition = {
        "fields": [
            {"type": "vector", "path": "embedding", "numDimensions": EMBEDDING_DIMS, "similarity": "cosine"},
            {"type": "filter", "path": "source"},
            {"type": "filter", "path": "date"},
            {"type": "filter", "path": "metadata"},
        ]
    }

    try:
        collection.create_search_index(SearchIndexModel(definition=definition, name=CHUNKS_INDEX, type="vectorSearch"))
        print(f"🔍 Created new vector index '{CHUNKS_INDEX}'")
        print(f"⏳ This takes ~1-2 minutes to become queryable in Atlas...")
    except Exception as e:
        print(f"❌ Error creating index: {e}")


if __name__ == "__main__":
    rebuild_index()
