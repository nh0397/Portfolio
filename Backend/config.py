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
# Safe to swap per environment; no stored state depends on it.
CHAT_MODEL = os.getenv("CHAT_MODEL", "llama-3.3-70b-versatile")

# ── Atlas ─────────────────────────────────────────────────────────────────
CHUNKS_COLLECTION = os.getenv("MONGO_CHUNKS_CL_NAME", "portfolio-chunks")
CHUNKS_INDEX = os.getenv("MONGO_CHUNKS_INDEX_NAME", "chunks_vector_index")
