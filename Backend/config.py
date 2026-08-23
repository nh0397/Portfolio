"""
Single source of truth for model and collection configuration.

Imported by app.py (serving), ingest.py (writing vectors), and
rebuild_index.py (building the Atlas index). These three have to agree —
they write, index, and query the same vector space — so the values live
here rather than as literals in each file.

load_dotenv() runs on import so the module is safe to import from anywhere
in the import block, before the caller has loaded its own environment.
On Vercel there is no .env file and the real environment is used instead.
"""
import os
import re

from dotenv import load_dotenv

load_dotenv()

# ── Embeddings (Fireworks) ────────────────────────────────────────────────
# Changing EMBEDDING_MODEL invalidates every vector already stored in Atlas:
# a query embedded by a different model no longer shares a space with the
# indexed ones, which degrades retrieval silently rather than erroring. A
# change here means re-running ingest.py and rebuild_index.py, with
# EMBEDDING_DIMS updated to the new model's output size.
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nomic-ai/nomic-embed-text-v1.5")
EMBEDDING_DIMS = int(os.getenv("EMBEDDING_DIMS", "768"))

# ── Chat (Groq) ───────────────────────────────────────────────────────────
# Safe to swap per environment; no stored state depends on it. Verify the id
# is still served by the account first — Groq retires models, and a retired
# id fails per-request with a 404 rather than at startup:
#   curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"
# llama-3.3-70b-versatile was the previous default; it is no longer served.
CHAT_MODEL = os.getenv("CHAT_MODEL", "openai/gpt-oss-120b")

# ── Atlas ─────────────────────────────────────────────────────────────────
CHUNKS_COLLECTION = os.getenv("MONGO_CHUNKS_CL_NAME", "portfolio-chunks")
CHUNKS_INDEX = os.getenv("MONGO_CHUNKS_INDEX_NAME", "chunks_vector_index")


# ── CORS ──────────────────────────────────────────────────────────────────
# Browser origins allowed to call the API, on top of the built-in defaults in
# app.py (the custom domain and any localhost port). Comma-separated:
#   ALLOWED_ORIGINS=https://my-site.netlify.app,https://staging.example.com
# A blocked origin is easy to misread: the preflight still returns 200, just
# without an Access-Control-Allow-Origin header, so the browser reports a CORS
# failure on the actual request while the OPTIONS row looks healthy.
EXTRA_ALLOWED_ORIGINS = [
    o.strip().rstrip("/")
    for o in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if o.strip()
]

_NETLIFY_SITE = re.compile(r"^https://([a-z0-9-]+)\.netlify\.app$")


def cors_origins(defaults: list) -> list:
    """Built-in defaults plus ALLOWED_ORIGINS.

    For each *.netlify.app entry, the site's deploy-preview subdomains
    (https://<deploy-id>--<site>.netlify.app) are allowed as well. Scoped to
    that one site deliberately: with supports_credentials enabled, a blanket
    *.netlify.app would let any Netlify site call the API with cookies.
    """
    origins = list(defaults)
    for origin in EXTRA_ALLOWED_ORIGINS:
        origins.append(origin)
        match = _NETLIFY_SITE.match(origin)
        if match:
            site = re.escape(match.group(1))
            origins.append(re.compile(rf"^https://[a-z0-9-]+--{site}\.netlify\.app$"))
    return origins
