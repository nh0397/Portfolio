import os
import re
from datetime import date
from urllib.parse import quote_plus

import certifi
from openai import OpenAI as OpenAIClient
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.server_api import ServerApi

from config import (CHAT_MODEL, CHUNKS_COLLECTION, CHUNKS_INDEX, EMBEDDING_MODEL,
                    cors_origins)

load_dotenv()

app = Flask(__name__)

# Any localhost port is allowed so a dev server can move (CRA 3000, Vite 5173)
# without a backend edit; deployed origins stay an explicit list.
LOCALHOST_ORIGIN = re.compile(r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$")

# naisarghalvadiya.tech was the old domain and no longer resolves; the site is
# on .me now. Extra origins (Netlify previews, staging) come from the
# ALLOWED_ORIGINS env var — see config.cors_origins.
ALLOWED_ORIGINS = cors_origins([
    LOCALHOST_ORIGIN,
    os.getenv("PRODUCTION_URL", "https://naisarghalvadiya.me"),
    "https://naisarghalvadiya.me",
    "https://www.naisarghalvadiya.me",
])

CORS(app, resources={
    r"/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 3600,
    }
})

# ── MongoDB ────────────────────────────────────────────────────────────────
try:
    user = quote_plus(os.getenv("MONGO_USERNAME", ""))
    pwd = quote_plus(os.getenv("MONGO_PASSWORD", ""))
    host = os.getenv("MONGO_HOST") or f"{os.getenv('MONGO_APP_NAME')}.5kfcs.mongodb.net"
    mongo = MongoClient(
        f"mongodb+srv://{user}:{pwd}@{host}/?retryWrites=true&w=majority",
        server_api=ServerApi("1"),
        serverSelectionTimeoutMS=5000,
        tlsCAFile=certifi.where(),
    )
    db = mongo[os.getenv("MONGO_DB_NAME")]
    collection = db[CHUNKS_COLLECTION]
    print(f"✅ MongoDB configured (db={db.name}, collection={collection.name})")
except Exception as e:
    print(f"❌ MongoDB setup failed: {e}")
    mongo = db = collection = None

# ── Fireworks (embeddings) ────────────────────────────────────────────────
fw_embed = OpenAIClient(
    api_key=os.getenv("FIREWORKS_API_KEY"),
    base_url="https://api.fireworks.ai/inference/v1"
) if os.getenv("FIREWORKS_API_KEY") else None
if not fw_embed:
    print("❌ FIREWORKS_API_KEY not set")

# ── Groq (chat) ───────────────────────────────────────────────────────────
groq_client = OpenAIClient(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
) if os.getenv("GROQ_API_KEY") else None
if not groq_client:
    print("❌ GROQ_API_KEY not set")


def retrieve_chunks(query: str, k: int = 8, recent_n: int = 3) -> list[dict]:
    """Embed the query and return the k most relevant portfolio chunks, sorted by date (newest first).

    Vector similarity alone doesn't encode recency — embeddings for "his newest
    project" and a two-year-old repo description can score within a point of
    each other, so a brand-new item can miss the top-k entirely. To keep
    "what's he working on now" answers current, the most recently dated chunks
    are always pulled in alongside the semantic matches, then merged and
    re-sorted by date.
    """
    result = fw_embed.embeddings.create(
        model=EMBEDDING_MODEL,
        input=query
    )
    query_vector = result.data[0].embedding

    pipeline = [
        {
            "$vectorSearch": {
                "index": CHUNKS_INDEX,
                "path": "embedding",
                "queryVector": query_vector,
                "numCandidates": max(k * 15, 60),
                "limit": k,
            }
        },
        {"$project": {"_id": 0, "source": 1, "section": 1, "text": 1, "date": 1, "metadata": 1, "score": {"$meta": "vectorSearchScore"}}},
    ]
    semantic = list(collection.aggregate(pipeline))

    recent = list(
        collection.find(
            {"date": {"$ne": None}},
            {"_id": 0, "source": 1, "section": 1, "text": 1, "date": 1, "metadata": 1},
        ).sort("date", -1).limit(recent_n)
    )

    seen = {(c["source"], c["section"]) for c in semantic}
    merged = semantic + [c for c in recent if (c["source"], c["section"]) not in seen]
    return sorted(merged, key=lambda c: c.get("date") or "", reverse=True)


def format_text(text: str) -> str:
    """Convert the model's light markdown to the HTML the frontend renders."""
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    # Single asterisks around a word are emphasis, not a bullet — bullets are
    # matched later as "* " at line start, so require a non-space after the *.
    text = re.sub(r"(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)", r"<i>\1</i>", text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    # Group consecutive "* item" lines into a single <ul>
    lines, html, in_list = text.split("\n"), [], False
    for line in lines:
        m = re.match(r"^\s*[\*\-]\s+(.*)", line)
        if m:
            if not in_list:
                html.append("<ul>")
                in_list = True
            html.append(f"<li>{m.group(1)}</li>")
        else:
            if in_list:
                html.append("</ul>")
                in_list = False
            html.append(line)
    if in_list:
        html.append("</ul>")
    return "\n".join(html)


SYSTEM_PROMPT = """You are the AI assistant on Naisarg Halvadiya's portfolio website. \
Visitors chat with you to learn about Naisarg — his skills, experience, projects, and background.

Guidelines:
- Answer questions about Naisarg using ONLY the provided context. Stick strictly to the \
stated facts: don't assume industry types, role details, or anything not explicitly there. \
If the context doesn't cover something, say: "Unfortunately, I don't have information about \
this — you can reach out to Naisarg directly at naisarghalvadiya@gmail.com."
- The context is sorted newest-first by each item's own date. For "newest", "latest", \
"most recent", or "what's he working on now" questions, the date ordering IS the answer — \
the first item(s) in the context are the most recent by definition. Read that from the \
ordering and the dates given; don't say you lack information just because no single chunk \
contains the literal word "newest".
- Never guess Naisarg's current location or personal status if the data is missing.
- For casual messages (greetings, small talk), respond warmly and naturally. If the visitor \
asks an off-topic question, don't pivot to Naisarg's bio unless they ask.
- For questions unrelated to Naisarg, politely explain you specialize in questions about \
Naisarg and steer the conversation back.
- Be conversational and concise (roughly 100-150 words). Don't repeat greetings \
mid-conversation, and never mention "the context", "the documents", or internal sources — \
just answer.
- Use **bold** for emphasis and "* " bullets for lists when helpful."""


@app.route("/api/experience", methods=["GET"])
def get_experience():
    """Fetch experience data from vector DB, sorted by date (descending)."""
    try:
        if collection is None:
            return jsonify({"error": "Database not available"}), 500

        # Find all experience chunks
        experience_chunks = list(
            collection.find(
                {"source": "resume", "section": {"$regex": "experience"}},
                {"_id": 0, "text": 1, "date": 1, "metadata": 1}
            ).sort("date", -1)  # Descending order (most recent first)
        )

        return jsonify({
            "success": True,
            "count": len(experience_chunks),
            "experiences": experience_chunks
        })
    except Exception as e:
        print(f"❌ Error fetching experience: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/projects", methods=["GET"])
def get_projects():
    """Fetch project/portfolio data from vector DB."""
    try:
        if collection is None:
            return jsonify({"error": "Database not available"}), 500

        # Find all project chunks
        projects = list(
            collection.find(
                {"$or": [
                    {"source": "github"},
                    {"section": {"$regex": "project"}}
                ]},
                {"_id": 0, "text": 1, "date": 1, "metadata": 1, "source": 1}
            ).sort("date", -1)
        )

        return jsonify({
            "success": True,
            "count": len(projects),
            "projects": projects
        })
    except Exception as e:
        print(f"❌ Error fetching projects: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health_check():
    try:
        if mongo is None:
            return jsonify({"status": "error", "message": "MongoDB not configured"}), 500
        mongo.admin.command("ping")
        return jsonify({
            "status": "healthy",
            "chunks": collection.count_documents({}),
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return "", 200

    try:
        if groq_client is None or fw_embed is None:
            return jsonify({"response": "Sorry, the assistant is not available right now. Please try again later."}), 500

        data = request.get_json() or {}
        message = (data.get("message") or "").strip()
        conversation_history = data.get("conversation_history", "")
        if not message:
            return jsonify({"response": "Please send a message."}), 400

        print(f"💬 Message: {message}")

        try:
            chunks = retrieve_chunks(message) if collection is not None else []
            # Chunks merged in purely for recency (see retrieve_chunks) carry no
            # vectorSearchScore, so this can't assume chunks[0] has one.
            top_score = chunks[0].get("score") if chunks else None
            score_str = f"{top_score:.3f}" if top_score is not None else "n/a"
            print(f"🔍 Retrieved {len(chunks)} chunks, top score: {score_str}" if chunks else "🔍 No chunks retrieved")
        except Exception as e:
            print(f"⚠️  Retrieval failed, answering without context: {e}")
            chunks = []

        context_parts = []
        for c in chunks:
            date_str = f" ({c.get('date')})" if c.get("date") else ""
            context_parts.append(f"[{c['source']} — {c['section']}{date_str}]\n{c['text']}")
        context = "\n\n".join(context_parts) or "(no portfolio data retrieved)"

        messages = [
            {"role": "system", "content": f"Today's date is {date.today():%B %d, %Y}.\n\n{SYSTEM_PROMPT}"},
            {"role": "user", "content": f"""Context about Naisarg:
{context}

Previous conversation:
{conversation_history or "(none)"}

Visitor's message: {message}"""}
        ]

        response = groq_client.chat.completions.create(
            model=CHAT_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        return jsonify({"response": format_text(response.choices[0].message.content)})

    except Exception as e:
        print(f"❌ Error in chat route: {e}")
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Starting Flask app on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)
