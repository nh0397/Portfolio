import os
import json
import logging
from dotenv import load_dotenv
from graph.graph_ingestion import ingest_into_graph

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def test_ingestion():
    """
    Test script to verify Zero Data Loss ingestion using existing final_data.json
    """
    logger.info("Starting Zero Data Loss Test Pipeline...")
    
    # 1. Load Data
    try:
        with open('final_data.json', 'r') as f:
            final_data = json.load(f)
        logger.info("Loaded final_data.json successfully")
    except FileNotFoundError:
        logger.error("final_data.json not found. Run main.py first to gather data.")
        return

    # 2. Trigger Ingestion
    ingest_into_graph(final_data)
    
    logger.info("Zero Data Loss Test Pipeline completed.")

if __name__ == "__main__":
    test_ingestion()
