# Portfolio RAG Chatbot Backend

A Flask backend that powers a RAG (Retrieval-Augmented Generation) chatbot for my portfolio websites. The chatbot can answer questions about my skills, projects, and experience using data from LinkedIn, GitHub, and resume.

## 🚀 Quick Setup

### 1. Environment Variables

Create a `.env` file in your project root:

```env
# LLM Provider Configuration (Choose one)
LLM_PROVIDER=groq  # Options: 'groq' (recommended - free & fast), 'gemini'

# Groq API (Recommended - 1,000 free requests/day, ultra-fast)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=mixtral-8x7b-32768  # Options: mixtral-8x7b-32768, llama3-70b-8192, llama3-8b-8192

# Google Gemini API (Alternative)
GOOGLE_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash  # Options: gemini-1.5-flash, gemini-1.5-pro

# MongoDB Atlas Configuration
MONGO_USERNAME=your_mongodb_username
MONGO_PASSWORD=your_mongodb_password
MONGO_APP_NAME=your_app_name
MONGO_DB_NAME=detail-extractor
MONGO_CL_NAME=detail-extractor-collection
MONGO_INDEX_NAME=vector_index_3
MONGO_EMBEDDING_FIELD_NAME=embedding

# Environment Configuration
FLASK_ENV=development
DEVELOPMENT_URL=http://localhost:3000
PRODUCTION_URL=https://your-production-domain.com
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## 🔧 API Endpoints

- **`GET /health`** - Server health check and MongoDB status
- **`GET /config`** - Configuration information
- **`POST /chat`** - Main chatbot endpoint
- **`GET /debug-vector-search`** - Test vector search functionality

### Chat Endpoint

```bash
POST /chat
Content-Type: application/json

{
  "message": "What are Naisarg's skills?",
  "conversation_history": "",
  "session_id": "user_session_123"
}
```

## 🧪 Testing

```bash
python test_api.py
```

## 🌐 Deployment

Deploy to Vercel:

```bash
npm i -g vercel
vercel
```

Set the same environment variables in Vercel dashboard.

## 🔗 Related Repositories

- **Frontend Portfolio**: [VSCode-Themed Portfolio](https://github.com/nh0397/VSCode-Themed-Portfolio)
- **React Portfolio**: [My Portfolio](https://github.com/nh0397/my-portfolio)
- **Data Extraction**: [Extract-your-Data-to-Create-A-RAG-Chatbot](https://github.com/nh0397/Extract-your-Data-to-Create-A-RAG-Chatbot)

## 🛠️ Technologies

- **Backend**: Flask
- **Database**: MongoDB Atlas with Vector Search
- **AI Model**: Google Gemini
- **Vector Embeddings**: Google's models/embedding-001

## 📝 License

[MIT License](https://opensource.org/licenses/MIT)
