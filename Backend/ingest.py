"""
Ingestion script: builds the chunked vector collection the chatbot searches.

Reads Naisarg's portfolio data (resume / GitHub / LinkedIn), splits it into
small semantic chunks (one per job, project, repo, section...), embeds each
chunk with Google's text-embedding-004, and writes them to a dedicated
MongoDB collection with an Atlas Vector Search index.

Data sources (both optional, at least one required):
  1. The legacy collection (MONGO_CL_NAME) whose documents hold
     resume_data / github_data / linkedin_data JSON strings.
  2. Local files: data/resume.json, data/github.json, data/linkedin.json
     (filename stem is used as the source label).

Usage:
    python ingest.py            # ingest from legacy collection + data/ files
    python ingest.py --dry-run  # show the chunks without writing anything
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from urllib.parse import quote_plus

import certifi
from openai import OpenAI as OpenAIClient
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.operations import SearchIndexModel

load_dotenv()

EMBEDDING_MODEL = "nomic-ai/nomic-embed-text-v1.5"
EMBEDDING_DIMS = 768
CHUNKS_COLLECTION = os.getenv("MONGO_CHUNKS_CL_NAME", "portfolio-chunks")
CHUNKS_INDEX = os.getenv("MONGO_CHUNKS_INDEX_NAME", "chunks_vector_index")
MAX_CHUNK_CHARS = 1800
MIN_CHUNK_CHARS = 80


def mongo_client() -> MongoClient:
    user = quote_plus(os.getenv("MONGO_USERNAME", ""))
    pwd = quote_plus(os.getenv("MONGO_PASSWORD", ""))
    host = os.getenv("MONGO_HOST") or f"{os.getenv('MONGO_APP_NAME')}.5kfcs.mongodb.net"
    uri = f"mongodb+srv://{user}:{pwd}@{host}/?retryWrites=true&w=majority"
    return MongoClient(uri, tlsCAFile=certifi.where())


# ---------------------------------------------------------------------------
# Chunking
# ---------------------------------------------------------------------------

def render_value(value, indent: int = 0) -> str:
    """Render arbitrary JSON as compact human-readable text."""
    pad = "  " * indent
    if isinstance(value, dict):
        lines = []
        for k, v in value.items():
            if v in (None, "", [], {}):
                continue
            if isinstance(v, (dict, list)):
                lines.append(f"{pad}{k}:")
                lines.append(render_value(v, indent + 1))
            else:
                lines.append(f"{pad}{k}: {v}")
        return "\n".join(lines)
    if isinstance(value, list):
        return "\n".join(render_value(v, indent) for v in value if v not in (None, "", [], {}))
    return f"{pad}{value}"


def chunk_json(source: str, data, path: str = "") -> list[dict]:
    """Split a JSON document into chunks along its natural structure.

    Lists of objects (jobs, projects, repos) become one chunk per item;
    everything else is grouped per top-level section. Oversized chunks are
    split further, undersized siblings are merged by the caller.
    """
    chunks = []

    if isinstance(data, str):
        try:
            data = json.loads(data)
        except (json.JSONDecodeError, TypeError):
            return [{"source": source, "section": path or source, "text": data}] if data.strip() else []

    if isinstance(data, dict):
        # Group all scalar fields (name, email, summary, ...) into ONE overview chunk
        # so contact-info fragments don't crowd out substantive chunks at retrieval.
        scalars = {k: v for k, v in data.items() if not isinstance(v, (dict, list)) and v not in (None, "")}
        if scalars:
            text = render_value(scalars)
            section = f"{path} > overview" if path else "overview"
            if text.strip():
                chunks.append({"source": source, "section": section, "text": text})
        for key, value in data.items():
            if key in scalars:
                continue
            section = f"{path} > {key}" if path else key
            if isinstance(value, list) and value and all(isinstance(i, dict) for i in value):
                for i, item in enumerate(value):
                    text = render_value(item)
                    if text.strip():
                        chunks.append({"source": source, "section": f"{section} [{i + 1}]", "text": text})
            elif isinstance(value, dict):
                text = render_value(value)
                if len(text) > MAX_CHUNK_CHARS:
                    chunks.extend(chunk_json(source, value, section))
                elif text.strip():
                    chunks.append({"source": source, "section": section, "text": text})
            else:
                text = render_value({key: value})
                if text.strip():
                    chunks.append({"source": source, "section": section, "text": text})
    elif isinstance(data, list):
        for i, item in enumerate(data):
            section = f"{path} [{i + 1}]" if path else f"item {i + 1}"
            if isinstance(item, dict):
                text = render_value(item)
                if len(text) > MAX_CHUNK_CHARS:
                    chunks.extend(chunk_json(source, item, section))
                elif text.strip():
                    chunks.append({"source": source, "section": section, "text": text})
            else:
                chunks.extend(chunk_json(source, item, section))
    else:
        text = str(data)
        if text.strip():
            chunks.append({"source": source, "section": path or source, "text": text})

    return chunks


def merge_small_chunks(chunks: list[dict]) -> list[dict]:
    """Merge consecutive tiny chunks from the same source so no chunk is a lone one-liner."""
    merged: list[dict] = []
    for chunk in chunks:
        if (
            merged
            and merged[-1]["source"] == chunk["source"]
            and len(merged[-1]["text"]) < MIN_CHUNK_CHARS
            and len(merged[-1]["text"]) + len(chunk["text"]) < MAX_CHUNK_CHARS
        ):
            merged[-1]["section"] += f"; {chunk['section']}"
            merged[-1]["text"] += "\n" + chunk["text"]
        else:
            merged.append(chunk)
    return merged


def split_oversized(chunks: list[dict]) -> list[dict]:
    result = []
    for chunk in chunks:
        text = chunk["text"]
        if len(text) <= MAX_CHUNK_CHARS:
            result.append(chunk)
            continue
        lines, buf = text.split("\n"), ""
        part = 1
        for line in lines:
            if len(buf) + len(line) > MAX_CHUNK_CHARS and buf:
                result.append({**chunk, "section": f"{chunk['section']} (part {part})", "text": buf})
                buf, part = "", part + 1
            buf += ("\n" if buf else "") + line
        if buf.strip():
            result.append({**chunk, "section": f"{chunk['section']} (part {part})", "text": buf})
    return result


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

def load_from_legacy_collection(db) -> list[dict]:
    name = os.getenv("MONGO_CL_NAME")
    if not name or name not in db.list_collection_names():
        print(f"⚠️  Legacy collection '{name}' not found, skipping")
        return []
    chunks = []
    for doc in db[name].find({}):
        for field, source in [("resume_data", "resume"), ("github_data", "github"), ("linkedin_data", "linkedin")]:
            if doc.get(field):
                chunks.extend(chunk_json(source, doc[field]))
    print(f"📄 Legacy collection produced {len(chunks)} raw chunks")
    return chunks


def load_from_local_files() -> list[dict]:
    chunks = []
    for f in sorted(Path("data").glob("*.json")):
        chunks.extend(chunk_json(f.stem, f.read_text()))
        print(f"📄 {f} loaded")
    return chunks


# ---------------------------------------------------------------------------
# Embedding + upload
# ---------------------------------------------------------------------------

def embed_chunks(chunks: list[dict]) -> list[dict]:
    client = OpenAIClient(
        api_key=os.getenv("FIREWORKS_API_KEY"),
        base_url="https://api.fireworks.ai/inference/v1"
    )
    batch_size = 100
    for start in range(0, len(chunks), batch_size):
        batch = chunks[start : start + batch_size]
        texts = [f"Naisarg's {c['source']} — {c['section']}\n{c['text']}" for c in batch]
        result = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=texts
        )
        for chunk, emb in zip(batch, result.data):
            chunk["embedding"] = emb.embedding
        print(f"🧮 Embedded {min(start + batch_size, len(chunks))}/{len(chunks)}")
    return chunks


def ensure_vector_index(collection):
    definition = {
        "fields": [
            {"type": "vector", "path": "embedding", "numDimensions": EMBEDDING_DIMS, "similarity": "cosine"},
            {"type": "filter", "path": "source"},
        ]
    }
    try:
        existing = [i["name"] for i in collection.list_search_indexes()]
        if CHUNKS_INDEX in existing:
            print(f"🔍 Vector index '{CHUNKS_INDEX}' already exists")
            return
        collection.create_search_index(SearchIndexModel(definition=definition, name=CHUNKS_INDEX, type="vectorSearch"))
        print(f"🔍 Created vector index '{CHUNKS_INDEX}' (takes ~1 min to become queryable)")
    except Exception as e:
        print(f"⚠️  Could not create the index via the driver ({e}).")
        print(f"   Create it manually in Atlas on '{collection.name}', name '{CHUNKS_INDEX}', with:")
        print(json.dumps(definition, indent=2))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="print chunks, don't embed or write")
    args = parser.parse_args()

    db = None
    try:
        client = mongo_client()
        client.admin.command("ping")
        db = client[os.getenv("MONGO_DB_NAME")]
    except Exception as e:
        print(f"⚠️  MongoDB unreachable ({e}); using local data/ files only")

    chunks = (load_from_legacy_collection(db) if db is not None else []) + load_from_local_files()
    chunks = split_oversized(merge_small_chunks(chunks))
    if not chunks:
        sys.exit("❌ No data found — need the legacy collection or files in data/*.json")

    print(f"\n✂️  {len(chunks)} chunks total")
    for c in chunks[:10]:
        print(f"   [{c['source']}] {c['section']} ({len(c['text'])} chars)")
    if len(chunks) > 10:
        print(f"   ... and {len(chunks) - 10} more")

    if args.dry_run:
        for c in chunks:
            print(f"\n===== [{c['source']}] {c['section']} =====\n{c['text']}")
        return

    if db is None:
        sys.exit("❌ Cannot write chunks: MongoDB is unreachable")

    chunks = embed_chunks(chunks)

    collection = db[CHUNKS_COLLECTION]
    collection.delete_many({})
    collection.insert_many(chunks)
    print(f"✅ Wrote {len(chunks)} chunks to '{CHUNKS_COLLECTION}'")

    ensure_vector_index(collection)


if __name__ == "__main__":
    main()
