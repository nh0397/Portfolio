# Portfolio RAG System - Data Processing Script

A simple data processing script that reads latest data from GitHub, LinkedIn, and Resume, chunks it intelligently, creates embeddings, and writes to MongoDB vector database.

## 🎯 **Single Purpose**

This Scripts folder has **ONE JOB**:
1. **Read** latest data from GitHub, LinkedIn, and Resume
2. **Chunk** the data by semantic units (one chunk per item)
3. **Create** embeddings using Fireworks AI
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
└── chunking/                  # Structured chunking
    ├── structured_chunker.py
    ├── text_chunker.py        # (legacy)
    └── chunking_config.py     # (legacy)
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

🔪 Step 4: Setting up structured chunking system...
   ✅ Using structured JSON chunking (one chunk per item)

✂️ Step 5: Chunking data by semantic units...
   📄 Created 6 resume chunks (1 basic info + 2 work exp + 2 projects + 1 skills)
   🔗 Created 16 LinkedIn chunks (1 basic info + 3 work exp + 2 education + 1 skills + 4 certs + 5 awards)
   📂 Created 15 GitHub chunks (1 per repository)

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
  - `structured_chunker.py` - StructuredChunker class (one chunk per semantic unit)
  - `text_chunker.py` - Legacy sliding window chunker (deprecated)
  - `chunking_config.py` - Legacy configuration (deprecated)
- **Purpose**: Create focused, structured JSON chunks preserving data hierarchy

## 🔧 **Structured Chunking Strategy**

### **Why Structured Chunks?**
Instead of arbitrary text splitting, we create **one chunk per semantic unit**:

- **Resume**: One chunk for each work experience, project, skills group
- **LinkedIn**: One chunk for each job, education entry, certification, award
- **GitHub**: One chunk per repository

**Benefits**:
- ✅ **Precise Retrieval**: Get exactly the relevant item, not mixed content
- ✅ **Preserved Structure**: JSON structure maintained for better querying
- ✅ **Better Context**: Each chunk is a complete, meaningful unit
- ✅ **More Granular**: 37 focused chunks instead of 6 mixed ones

## 🎯 **When to Run**

Run this script whenever you want to update your vector database with:

- **New GitHub repositories** or updated descriptions
- **Updated LinkedIn profile** information
- **Updated resume** with new experiences/skills
- **After making changes** to any of your data sources

## 📈 **Performance Features**

### **Structured JSON Chunking**
- **Semantic Coherence**: Each chunk is a complete logical unit
- **Precise Retrieval**: Query for specific work experience, project, or repo
- **Structure Preservation**: JSON format maintained for rich queries
- **Metadata Enhancement**: Typed chunks with section awareness

### **Vector Search Ready**
- **Semantic Similarity**: Fireworks AI embeddings (nomic-embed-text-v1.5)
- **MongoDB Atlas**: Vector search index
- **Multi-source**: Resume, LinkedIn, GitHub data
- **Real-time Ready**: Fast, granular retrieval for chatbot responses

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
1. Edit `chunking/structured_chunker.py`
2. Customize formatting methods for your needs
3. Add new chunk types for additional data sources

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