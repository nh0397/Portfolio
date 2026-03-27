import os
import logging
from dotenv import load_dotenv
from pipeline.scraping_phase import run_scraping_phase
from pipeline.ingestion_phase import run_ingestion_phase

# Setup professional logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

def main():
    logger.info("🚀 Portfolio RAG Pipeline Starting...")
    
    # Phase 1: Scraping & Formatting
    try:
        final_data = run_scraping_phase()
    except Exception as e:
        logger.error(f"Scraping stage failed: {e}")
        return

    # Phase 2: Ingestion (Vector + Graph)
    try:
        run_ingestion_phase(final_data)
    except Exception as e:
        logger.error(f"Ingestion stage failed: {e}")
        return

    logger.info("🎉 Pipeline completed successfully!")

if __name__ == "__main__":
    main()