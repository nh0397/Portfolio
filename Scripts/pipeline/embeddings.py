import os
import openai
import logging

logger = logging.getLogger(__name__)

class FireworksEmbeddings:
    def __init__(self):
        api_key = os.getenv('FIREWORKS_API_KEY')
        if not api_key:
            logger.warning("FIREWORKS_API_KEY not found in environment.")
        
        self.client = openai.OpenAI(
            api_key=api_key,
            base_url="https://api.fireworks.ai/inference/v1"
        )

    def generate_embeddings(self, text):
        """Generate embeddings using nomic-ai/nomic-embed-text-v1.5."""
        if not text:
            return []
            
        try:
            response = self.client.embeddings.create(
                model="nomic-ai/nomic-embed-text-v1.5",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Fireworks embedding failed: {e}")
            return []
