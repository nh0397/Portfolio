# Portfolio RAG System - Data Processing Script

A simple data processing script that reads latest data from GitHub, LinkedIn, and Resume, chunks it, creates embeddings, and writes to MongoDB vector database.

## 🎯 **Single Purpose**

This Scripts folder has **ONE JOB**:
1. **Read** latest data from GitHub, LinkedIn, and Resume
2. **Chunk** the data with sliding window strategy  
3. **Create** embeddings using Google Gemini
4. **Write** everything to MongoDB vector database

That's it. No server, no API, just data processing.

## 🏗️ **Simple Structure**

```
Scripts/
├── main.py                    # THE ONLY SCRIPT YOU NEED
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables (create this)
├── final_data.json           # Generated final data (backup)
├── resources/                 # Static resources
│   └── Resume.pdf            # Your resume file
├── linkedin/                  # LinkedIn scraping
│   └── linkedin_scraper.py
├── github/                    # GitHub scraping
│   └── github_scraper.py
├── resume/                    # Resume parsing
│   └── resume_parser.py
└── chunking/                  # Text chunking
    ├── text_chunker.py
    └── chunking_config.py
```

## 🚀 **How to Use**

### 1. **Setup Environment**

```bash
# Navigate to Scripts directory
cd Scripts

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. **Create .env File**

Create `.env` file in the Scripts directory:

```env
# Google Gemini API
GOOGLE_API_KEY=your_gemini_api_key_here

# MongoDB Atlas Configuration
MONGO_USERNAME=your_mongodb_username
MONGO_PASSWORD=your_mongodb_password
MONGO_APP_NAME=your_app_name
MONGO_DB_NAME=detail-extractor
MONGO_CL_NAME=detail-extractor-collection
MONGO_INDEX_NAME=vector_index_3
MONGO_EMBEDDING_FIELD_NAME=embedding

# User Profile Data
USER_NAME=your_full_name
USER_EMAIL=your_email@example.com
GITHUB_USERNAME=your_github_username
LINKEDIN_URL=https://www.linkedin.com/in/your-profile-url/

# Optional (for scraping)
LINKEDIN_EMAIL=your_linkedin_email@example.com
LINKEDIN_PASSWORD=your_linkedin_password
GITHUB_ACCESS_TOKEN=your_github_access_token
```

### 3. **Add Your Resume**

```bash
# Place your resume in the resources directory
cp /path/to/your/resume.pdf resources/Resume.pdf
```

### 4. **Run the Script**

```bash
# That's it! Just run main.py
python main.py
```

## 📊 **What main.py Does**

```
🚀 Portfolio RAG Data Processing Script
==================================================
Job: Read data → Chunk → Embed → Store in vector DB
==================================================

📖 Step 1: Reading latest data from sources...
   📂 Fetching latest GitHub repositories...
   🔗 Scraping latest LinkedIn profile...
   📄 Parsing resume...

🤖 Step 2: Formatting data with Gemini AI...
   📝 Formatting resume data...
   🔗 Formatting LinkedIn data...
   📂 Formatting GitHub data...

🔪 Step 4: Setting up chunking system...
   📏 Chunk size: 512 tokens
   🔄 Overlap size: 50 tokens

✂️ Step 5: Chunking data with sliding window...
   📄 Created X resume chunks
   🔗 Created Y LinkedIn chunks
   📂 Created Z GitHub chunks

🔮 Step 6: Creating embeddings for chunks...
   📝 Creating embedding for resume chunk 1/X...
   🔗 Creating embedding for LinkedIn chunk 1/Y...
   📂 Creating embedding for GitHub chunk 1/Z...

💾 Step 7: Writing chunks to MongoDB vector database...
   ✅ Written N chunks to MongoDB vector database
   📊 Database: detail-extractor
   📁 Collection: detail-extractor-collection

🎉 Data processing completed successfully!
✅ Script completed - Vector database is ready for your chatbot!
```

## 📦 **Folder Structure**

### **🔗 linkedin/**
- **File**: `linkedin_scraper.py`
- **Purpose**: Scrape latest LinkedIn profile data

### **📂 github/**
- **File**: `github_scraper.py`
- **Purpose**: Fetch latest GitHub repository data

### **📄 resume/**
- **File**: `resume_parser.py`
- **Purpose**: Parse resume PDF and extract text

### **🔪 chunking/**
- **Files**: 
  - `text_chunker.py` - SlidingWindowChunker class
  - `chunking_config.py` - Configuration settings
- **Purpose**: Chunk text with overlapping windows and metadata

## 🔧 **Configuration**

### **Chunking Parameters**
```python
# In chunking/chunking_config.py
CHUNKING_CONFIG = {
    "chunk_size": 512,           # Maximum tokens per chunk
    "overlap_size": 50,          # Tokens to overlap between chunks
    "max_chunks_per_query": 5,   # Maximum chunks to retrieve per query
    "embedding_delay": 1,        # API rate limiting (seconds)
}
```

## 🎯 **When to Run**

Run this script whenever you want to update your vector database with:

- **New GitHub repositories** or updated descriptions
- **Updated LinkedIn profile** information
- **Updated resume** with new experiences/skills
- **After making changes** to any of your data sources

## 📈 **Performance Features**

### **Sliding Window Chunking**
- **Context Preservation**: Overlapping chunks maintain context
- **Precise Retrieval**: Specific sections instead of entire documents
- **Token Efficiency**: Optimized chunk sizes for LLM processing
- **Metadata Enhancement**: Section-aware retrieval

### **Vector Search Ready**
- **Semantic Similarity**: Google Gemini embeddings
- **MongoDB Atlas**: Vector search index
- **Multi-source**: Resume, LinkedIn, GitHub data
- **Real-time Ready**: Fast retrieval for chatbot responses

## 🔒 **Security**

- **Environment Variables**: Sensitive data in `.env` file
- **API Key Management**: Secure Google API key handling
- **Rate Limiting**: API call throttling to avoid limits

## 🛠️ **Development**

### **Adding New Data Sources**
1. Create new folder (e.g., `twitter/`, `medium/`)
2. Add scraper file
3. Import and use in `main.py`

### **Modifying Chunking**
1. Edit `chunking/chunking_config.py`
2. Adjust parameters as needed

## 📊 **Output**

The script creates:
- **MongoDB Vector Database**: All chunks with embeddings stored
- **final_data.json**: Backup of processed data
- **Console Output**: Detailed progress and summary

## 🚀 **Integration**

Once you run this script, your MongoDB vector database is ready to be used by:
- Your portfolio website chatbot
- Any RAG application
- Vector search queries
- AI-powered resume matching

---

**🎉 Simple, focused, and effective - exactly what you need!**