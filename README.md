# Portfolio Repository

A comprehensive portfolio ecosystem featuring AI-powered chatbot, sliding window chunking RAG system, and multiple frontend implementations for creating intelligent, personalized experiences.

## 🚀 What's New

### Latest Updates (October 2025)
- ✅ **Sliding Window Chunking**: Implemented advanced text chunking with overlapping windows for better context preservation
- ✅ **Google Gemini 2.5 Integration**: Upgraded to latest Gemini API for embeddings and content generation
- ✅ **Simplified Architecture**: Restructured Scripts folder with clean, modular organization
- ✅ **MongoDB Vector Database**: Enhanced vector search with chunked embeddings for precise retrieval
- ✅ **Vercel Deployment**: Added complete deployment configuration for serverless Backend

## Motivation

This portfolio ecosystem evolved from experimentation with cutting-edge technologies to create something truly unique:

**The Journey:**
1. **Simple React Portfolio** - Clean, minimalist portfolio exploring Three.js
2. **VS Code Themed Portfolio** - Immersive IDE-inspired developer experience
3. **AI-Powered Backend** - GenAI chatbot that knows everything about my professional life
4. **RAG Data Processing** - Advanced data extraction with sliding window chunking for intelligent responses

The result is a portfolio that provides visitors with an interactive, intelligent AI buddy that can answer questions about my background, projects, and expertise in real-time with precise, context-aware responses.

## Repository Structure

```
Portfolio/
├── Frontend/
│   ├── simple-react/          # Minimalist React portfolio
│   └── vscode-themed/         # VS Code themed portfolio
├── Backend/                   # Flask API with RAG chatbot
│   ├── app.py                # Main Flask application
│   ├── requirements.txt      # Python dependencies
│   ├── vercel.json          # Vercel deployment config
│   └── DEPLOYMENT.md        # Deployment guide
└── Scripts/                   # RAG data processing
    ├── main.py               # Data processing pipeline
    ├── linkedin/             # LinkedIn scraping
    ├── github/               # GitHub scraping
    ├── resume/               # Resume parsing
    └── chunking/             # Sliding window chunking
        ├── text_chunker.py
        └── chunking_config.py
```

## Components Overview

### 🎨 Frontend Applications

#### Simple React Portfolio (`Frontend/simple-react/`)

A clean, minimalist portfolio website built with React.js focusing on content and UX.

**Key Features:**
- Responsive design with dark/light theme toggle
- Smooth animations and transitions
- JSON-based configuration
- SEO-friendly structure
- Fast loading with optimized assets

**Technologies:**
- React 18+ with hooks
- CSS3 animations
- Context API for theme management

**Quick Start:**
```bash
cd Frontend/simple-react
npm install
npm start
# Open http://localhost:3000
```

#### VS Code Themed Portfolio (`Frontend/vscode-themed/`)

Unique portfolio mimicking VS Code interface for an immersive developer experience.

**Key Features:**
- VS Code-inspired UI (explorer, terminal, editor)
- Interactive file navigation
- Real-time chatbot integration
- Tailwind CSS styling
- Component-based architecture

**Quick Start:**
```bash
cd Frontend/vscode-themed
npm install
npm start
# Open http://localhost:3000
```

### 🤖 Backend - AI-Powered RAG Chatbot

A Flask-based API providing intelligent chatbot functionality using Retrieval-Augmented Generation (RAG) with sliding window chunking.

**Architecture:**
```
User Query → Embedding → Vector Search → Chunked Context → Gemini 2.5 → Response
```

**Key Features:**
- **Sliding Window Chunking**: 512-token chunks with 50-token overlap
- **Google Gemini 2.5 Flash**: Latest AI model for generation
- **MongoDB Atlas**: Vector search with 3072-dimension embeddings
- **Context-Aware**: Distinguishes casual vs. context-specific queries
- **Conversation Memory**: Maintains session-based conversation history
- **CORS Support**: Cross-origin requests for frontend integration

**API Endpoints:**

```bash
# Health Check
GET /health

# Configuration Info
GET /config

# Main Chat Endpoint
POST /chat
{
  "message": "What are your skills?",
  "conversation_history": "",
  "session_id": "user_123"
}

# Debug Vector Search
GET /debug-vector-search?query=python
```

**Technologies:**
- Flask 3.0.3 with Flask-CORS
- Google Gemini 2.5 Flash API
- MongoDB Atlas with vector search
- Python 3.9+

**Quick Start:**
```bash
cd Backend
pip install -r requirements.txt
python app.py
# API available at http://localhost:5000
```

**Environment Variables:**
```env
# Google Gemini API
GOOGLE_API_KEY=your_api_key

# MongoDB Atlas
MONGO_USERNAME=username
MONGO_PASSWORD=password
MONGO_APP_NAME=app_name
MONGO_DB_NAME=detail-extractor
MONGO_CL_NAME=detail-extractor-collection
MONGO_INDEX_NAME=vector_index_3
MONGO_EMBEDDING_FIELD_NAME=embedding

# Flask Config
FLASK_ENV=development
DEVELOPMENT_URL=http://localhost:3000
PRODUCTION_URL=https://your-domain.com
```

**Deployment to Vercel:**
```bash
cd Backend
vercel
# Set environment variables in Vercel dashboard
vercel --prod
```

See `Backend/DEPLOYMENT.md` for complete deployment guide.

### 📊 Scripts - RAG Data Processing

Simple, focused data processing pipeline that reads, chunks, and stores your data in MongoDB vector database.

**Single Purpose:**
1. **Read** latest data from GitHub, LinkedIn, Resume
2. **Chunk** with sliding window strategy (512 tokens, 50 overlap)
3. **Create** embeddings using Google Gemini
4. **Write** to MongoDB vector database

**Folder Structure:**
```
Scripts/
├── main.py                    # Main data processing script
├── linkedin/
│   └── linkedin_scraper.py   # LinkedIn profile scraping
├── github/
│   └── github_scraper.py     # GitHub repository data
├── resume/
│   └── resume_parser.py      # Resume PDF parsing
└── chunking/
    ├── text_chunker.py       # SlidingWindowChunker class
    └── chunking_config.py    # Configuration
```

**Sliding Window Chunking:**
```
Original Text (1500 tokens)
    ↓
Chunk 1: tokens 0-512 (512 tokens)
Chunk 2: tokens 462-974 (512 tokens, 50 overlap)
Chunk 3: tokens 924-1436 (512 tokens, 50 overlap)
    ↓
Generate embeddings (3072 dimensions each)
    ↓
Store in MongoDB with metadata
```

**Features:**
- **Context Preservation**: Overlapping chunks maintain context
- **Metadata Rich**: Each chunk includes source type, section, index
- **Token-Accurate**: Uses tiktoken for precise token counting
- **Sentence Boundary Aware**: Respects natural text boundaries
- **Section Identification**: Auto-identifies work_experience, skills, etc.

**Configuration:**
```python
# chunking/chunking_config.py
CHUNKING_CONFIG = {
    "chunk_size": 512,           # Tokens per chunk
    "overlap_size": 50,          # Overlap between chunks
    "max_chunks_per_query": 5,   # Retrieval limit
    "embedding_delay": 1,        # API rate limiting
}
```

**Environment Variables:**
```env
# Google Gemini API
GOOGLE_API_KEY=your_api_key

# MongoDB Atlas
MONGO_USERNAME=username
MONGO_PASSWORD=password
MONGO_DB_NAME=detail-extractor
MONGO_CL_NAME=detail-extractor-collection

# User Profile Data
USER_NAME=Your Name
USER_EMAIL=your@email.com
GITHUB_USERNAME=your_github
LINKEDIN_URL=https://linkedin.com/in/yourprofile

# Optional (for scraping)
LINKEDIN_EMAIL=email
LINKEDIN_PASSWORD=password
GITHUB_ACCESS_TOKEN=token
```

**Quick Start:**
```bash
cd Scripts

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Add your resume
cp /path/to/resume.pdf resources/Resume.pdf

# Create .env file with credentials

# Run the processing pipeline
python main.py
```

**What Happens:**
```
🚀 Portfolio RAG Data Processing Script
📖 Step 1: Reading latest data from sources...
   📂 Fetching GitHub repositories...
   🔗 Scraping LinkedIn profile...
   📄 Parsing resume...
🤖 Step 2: Formatting data with Gemini AI...
🔪 Step 4: Setting up chunking system...
✂️ Step 5: Chunking data with sliding window...
🔮 Step 6: Creating embeddings for chunks...
💾 Step 7: Writing chunks to MongoDB vector database...
🎉 Data processing completed successfully!
```

**Output:**
- MongoDB vector database with chunked embeddings
- `final_data.json` backup file
- Console logs with detailed progress

## 🔧 Technical Highlights

### Sliding Window Chunking Benefits

**Before (Monolithic):**
- Retrieved entire resume/LinkedIn/GitHub documents
- Large context windows with irrelevant information
- No overlap between sections
- 3 documents in database

**After (Chunked):**
- Retrieves specific relevant sections
- Focused chunks with only relevant content
- Overlapping chunks maintain context
- ~10-15 chunks in database with metadata

**Performance Gains:**
- 🎯 **Better Precision**: Specific sections vs. entire documents
- 📊 **Token Efficiency**: Smaller, focused chunks
- 🔗 **Context Preservation**: Overlapping maintains continuity
- 📈 **Scalability**: Grows efficiently with more data

### RAG Architecture

```
┌─────────────┐
│ User Query  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Gemini Embedding    │ (3072 dimensions)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ MongoDB Vector      │
│ Search              │ (Find top 5 chunks)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Chunk Assembly      │ (Combine with metadata)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Gemini 2.5 Flash    │ (Generate response)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Formatted Response  │
└─────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ (for Frontend)
- Python 3.9+ (for Backend/Scripts)
- MongoDB Atlas account
- Google Gemini API key

### Quick Setup

1. **Clone Repository:**
```bash
git clone https://github.com/yourusername/Portfolio.git
cd Portfolio
```

2. **Setup Frontend:**
```bash
cd Frontend/vscode-themed
npm install
npm start
```

3. **Setup Backend:**
```bash
cd Backend
pip install -r requirements.txt
# Create .env with credentials
python app.py
```

4. **Process Your Data:**
```bash
cd Scripts
pip install -r requirements.txt
# Create .env with credentials
# Add Resume.pdf to resources/
python main.py
```

## 📦 Deployment

### Frontend (Netlify)
```bash
cd Frontend/vscode-themed
npm run build
# Deploy dist/ folder to Netlify
```

### Backend (Vercel)
```bash
cd Backend
vercel
# Set environment variables in dashboard
vercel --prod
```

See `Backend/DEPLOYMENT.md` for detailed instructions.

## 🔐 Security

- ✅ Environment variables for sensitive data
- ✅ `.env` files excluded from git
- ✅ CORS properly configured
- ✅ MongoDB Atlas with authentication
- ✅ Rate limiting on API endpoints

## 📊 Project Stats

- **Frontend**: 2 implementations (React, React+Tailwind)
- **Backend**: Flask API with RAG capabilities
- **Data Sources**: LinkedIn, GitHub, Resume
- **Chunking**: Sliding window (512 tokens, 50 overlap)
- **Embeddings**: 3072 dimensions (Gemini)
- **Database**: MongoDB Atlas with vector search
- **AI Model**: Google Gemini 2.5 Flash

## 🤝 Contributing

This is a personal portfolio project, but feel free to:
- Open issues for bugs or suggestions
- Fork and adapt for your own portfolio
- Share improvements or optimizations

## 📝 License

MIT License - See LICENSE file for details

## 🔗 Links

- **Live Portfolio**: [Your Portfolio URL]
- **LinkedIn**: [Your LinkedIn]
- **GitHub**: [Your GitHub]

---

**Built with ❤️ using React, Flask, MongoDB, and Google Gemini AI**

*Last Updated: October 2025*
