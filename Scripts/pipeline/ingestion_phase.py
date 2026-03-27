import os
import json
import logging
import time
from pymongo import MongoClient
from chunking.structured_chunker import StructuredChunker
from graph.graph_ingestion import ingest_into_graph
from pipeline.embeddings import FireworksEmbeddings

logger = logging.getLogger(__name__)

def run_ingestion_phase(final_data):
    """
    Step-by-step ingestion into Vector DB (MongoDB) and Graph DB (Neo4j).
    """
    logger.info("Phase 2: Ingestion (Vector + Graph)...")
    
    # 1. Chunking for Vector DB
    chunker = StructuredChunker()
    resume_chunks = chunker.chunk_resume(final_data["resume"])
    linkedin_chunks = chunker.chunk_linkedin(final_data["linkedin"])
    github_chunks = chunker.chunk_github(final_data["github"])
    
    all_chunks = resume_chunks + linkedin_chunks + github_chunks
    logger.info(f"Created {len(all_chunks)} semantic chunks. Generating embeddings...")

    # 2. Embedding & Vector Storage (MongoDB)
    embedder = FireworksEmbeddings()
    for i, chunk in enumerate(all_chunks):
        if (i + 1) % 5 == 0:
            logger.info(f"Progress: {i+1}/{len(all_chunks)} chunks embedded...")
            time.sleep(1) # Subtle rate limiting
        
        embedding = embedder.generate_embeddings(chunk["chunk_text"])
        chunk["embedding"] = embedding
    
    mongo_uri = f"mongodb+srv://{os.getenv('MONGO_USERNAME')}:{os.getenv('MONGO_PASSWORD')}@{os.getenv('MONGO_APP_NAME')}.mongodb.net/?retryWrites=true&w=majority"
    try:
        client = MongoClient(mongo_uri)
        db = client[os.getenv('MONGO_DB_NAME')]
        collection = db[os.getenv('MONGO_CL_NAME')]
        
        # Clear existing and insert new
        collection.delete_many({})
        if all_chunks:
            collection.insert_many(all_chunks)
        logger.info(f"Successfully updated MongoDB Vector Store with {len(all_chunks)} chunks.")
    except Exception as e:
        logger.error(f"MongoDB ingestion failed: {e}")

    # 3. Graph Storage (Neo4j)
    ingest_into_graph(final_data)
    
    logger.info("Phase 2 completed.")
    return True
