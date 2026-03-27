import os
import openai
from google import genai

class FireworksEmbeddings:
    def __init__(self) -> None:
        self.client = openai.OpenAI(
            api_key=os.getenv('FIREWORKS_API_KEY'),
            base_url="https://api.fireworks.ai/inference/v1"
        )
        self.model = "nomic-ai/nomic-embed-text-v1.5"

    def generate_embeddings(self, inp: str) -> list:
        """Generate embeddings for input text using Fireworks.ai."""
        if not os.getenv('FIREWORKS_API_KEY'):
            print("⚠️ FIREWORKS_API_KEY not set")
            return []

        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=inp
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"❌ Fireworks Embeddings failed: {e}")
            return []

class GoogleEmbeddings:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))
        self.model = "text-embedding-004"

    def generate_embeddings(self, text):
        try:
            response = self.client.models.embed_content(
                model=self.model,
                contents=text
            )
            return response.embeddings[0].values
        except Exception as e:
            print(f"❌ Google Embeddings failed: {e}")
            return []
