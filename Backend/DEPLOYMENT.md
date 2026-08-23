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

Set these in the Vercel dashboard (Project Settings → Environment Variables),
or with the CLI — see "Setting variables from the CLI" below.

**Secrets — required. The app will not serve chat without them:**

```env
# Fireworks (embeddings) — https://fireworks.ai/
FIREWORKS_API_KEY=your_fireworks_api_key_here

# Groq (chat) — https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# MongoDB Atlas
MONGO_HOST=your-cluster.xxxxx.mongodb.net
MONGO_USERNAME=your_mongodb_username
MONGO_PASSWORD=your_mongodb_password
MONGO_DB_NAME=detail-extractor
```

**Optional — all default in `config.py` to the values below, so leaving them
unset is safe and keeps current behaviour:**

```env
CHAT_MODEL=openai/gpt-oss-120b
EMBEDDING_MODEL=nomic-ai/nomic-embed-text-v1.5
EMBEDDING_DIMS=768
MONGO_CHUNKS_CL_NAME=portfolio-chunks
MONGO_CHUNKS_INDEX_NAME=chunks_vector_index
```

**Frontend origins (used for CORS):**

```env
PRODUCTION_URL=https://your-frontend-domain.com
DEVELOPMENT_URL=http://localhost:3000
```

> ⚠️ `EMBEDDING_MODEL` and `EMBEDDING_DIMS` are not a free swap. They must
> match the vectors already stored in Atlas. Changing either means re-running
> `python ingest.py` and `python rebuild_index.py`; changing them on Vercel
> alone degrades retrieval silently rather than raising an error.

> ℹ️ Model names are deliberately *not* pinned in `vercel.json`. A value in
> `vercel.json`'s `env` block would shadow whatever you set in the dashboard,
> which makes dashboard edits look like they do nothing. Set them in the
> dashboard or via the CLI; `config.py` supplies the fallback.

### Setting variables from the CLI

```bash
vercel env add GROQ_API_KEY production
```

Repeat per variable and per environment (`production`, `preview`,
`development`). `vercel env ls` shows what is currently set.

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

