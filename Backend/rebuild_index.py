"""Create or reconcile the same vector index used by sync and retrieval."""
import os
from config import CHUNKS_COLLECTION, CHUNKS_INDEX
from ingest import ensure_vector_index, mongo_client


def rebuild_index():
    with mongo_client() as client:
        db = client[os.environ["MONGO_DB_NAME"]]
        if CHUNKS_COLLECTION not in db.list_collection_names():
            db.create_collection(CHUNKS_COLLECTION)
        ensure_vector_index(db[CHUNKS_COLLECTION])
    print(f"Vector index {CHUNKS_INDEX} is ready")


if __name__ == "__main__":
    rebuild_index()
