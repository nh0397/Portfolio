import os
import openai
from google import genai

class LLMProvider:
    """Abstraction layer for different LLM providers"""
    
    def __init__(self, provider: str):
        self.provider = provider
        if provider == 'groq':
            api_key = os.getenv('GROQ_API_KEY')
            if not api_key:
                raise ValueError("GROQ_API_KEY not set")
            self.client = openai.OpenAI(
                api_key=api_key,
                base_url="https://api.groq.com/openai/v1"
            )
            self.model = os.getenv('GROQ_MODEL', 'mixtral-8x7b-32768')
        elif provider == 'gemini':
            api_key = os.getenv('GOOGLE_API_KEY')
            if not api_key:
                raise ValueError("GOOGLE_API_KEY not set")
            self.client = genai.Client(api_key=api_key)
            self.model = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
        else:
            raise ValueError(f"Unsupported provider: {provider}")
    
    def parse_conversation_history(self, conversation_history: str) -> list:
        """Parse conversation history string into messages array for OpenAI-compatible APIs"""
        messages = []
        if not conversation_history:
            return messages
        
        lines = conversation_history.strip().split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('User: '):
                messages.append({
                    "role": "user",
                    "content": line[6:]
                })
            elif line.startswith('Assistant: '):
                messages.append({
                    "role": "assistant",
                    "content": line[11:]
                })
        
        return messages
    
    def generate_content(self, prompt: str, conversation_history: str = "") -> str:
        """Generate content using the configured provider"""
        try:
            if self.provider == 'groq':
                messages = []
                # Add system message for context
                messages.append({
                    "role": "system",
                    "content": """You are Naisarg's AI assistant. Answer questions naturally and concisely like you're having a conversation.
Key facts:
- GitHub: https://github.com/nh0397
- LinkedIn: https://www.linkedin.com/in/naisarg-h/
- Email: naisarghalvadiya@gmail.com
- Location: San Francisco, CA

Important:
- Answer directly without phrases like "Based on the information provided"
- Don't mention sources (LinkedIn, resume, etc.)
- Be brief and natural
"""
                })
                
                if conversation_history:
                    history_messages = self.parse_conversation_history(conversation_history)
                    messages.extend(history_messages[-10:])
                
                messages.append({
                    "role": "user",
                    "content": prompt
                })
                
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.5,
                    max_tokens=500
                )
                return response.choices[0].message.content.strip()
            
            elif self.provider == 'gemini':
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt
                )
                return response.text.strip()
        except Exception as e:
            print(f"❌ {self.provider.upper()} API error: {e}")
            raise
