# Backend Deployment Guide - Vercel

## 🚀 Quick Deploy to Vercel

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- Vercel CLI installed: `npm i -g vercel`

### Step 1: Install Vercel CLI (if not installed)
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy from Backend Directory
```bash
cd Backend
vercel
```

### Step 4: Configure Environment Variables on Vercel

Go to your Vercel dashboard → Project Settings → Environment Variables and add:

```env
# LLM Provider Configuration (Choose one)
LLM_PROVIDER=groq  # Options: 'groq' (recommended - free & fast), 'gemini'

# Groq API (Recommended - 1,000 free requests/day, ultra-fast)
# Get your API key at: https://console.groq.com/
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

# Flask Configuration
FLASK_ENV=production
DEVELOPMENT_URL=http://localhost:3000
PRODUCTION_URL=https://your-frontend-domain.com
```

### Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

## 📋 Files Created for Deployment

### `vercel.json`
- Configures Python runtime
- Routes all requests to `app.py`
- Sets up serverless function

### `requirements.txt`
- Contains all Python dependencies
- Automatically installed by Vercel during build
- Includes:
  - Flask & Flask-CORS
  - Google AI SDK
  - PyMongo for MongoDB
  - python-dotenv for environment variables

### `.vercelignore`
- Excludes unnecessary files from deployment
- Keeps deployment size small
- Prevents uploading .env and cache files

## 🔧 API Endpoints

Once deployed, your API will be available at:
```
https://your-project.vercel.app/health
https://your-project.vercel.app/chat
https://your-project.vercel.app/config
https://your-project.vercel.app/debug-vector-search
```

## 🧪 Testing Your Deployment

### Health Check
```bash
curl https://your-project.vercel.app/health
```

### Test Chat Endpoint
```bash
curl -X POST https://your-project.vercel.app/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are your skills?",
    "conversation_history": "",
    "session_id": "test_session"
  }'
```

## 🔒 Security Notes

1. **Never commit .env file** - Already in .vercelignore
2. **Use environment variables** - Set them in Vercel dashboard
3. **CORS Configuration** - Update allowed origins in app.py for production
4. **MongoDB Access** - Whitelist Vercel IPs in MongoDB Atlas

## 🐛 Troubleshooting

### Build Fails
- Check requirements.txt for conflicting versions
- Verify Python version compatibility (3.9+)

### API Returns 500
- Check Vercel logs: `vercel logs`
- Verify all environment variables are set
- Check MongoDB connection string

### CORS Errors
- Update CORS origins in app.py
- Add your frontend domain to allowed origins

## 📊 Monitoring

View logs in real-time:
```bash
vercel logs --follow
```

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:
1. Connect your GitHub repository to Vercel
2. Every push to `main` triggers a deployment
3. Preview deployments for pull requests

---

**🎉 Your Backend is now deployed on Vercel!**

