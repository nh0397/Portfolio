"""Shared chunking, embedding, index and frontend-export helpers.

The CLI delegates to Scripts/sync_portfolio.py so every normal ingestion also
produces the UI JSON. See Scripts/README.md for sources and configuration.
"""

import json
import os
import re
import sys
import time
from datetime import date, datetime
from pathlib import Path
from urllib.parse import quote_plus

import certifi
from openai import OpenAI as OpenAIClient
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.operations import SearchIndexModel

from config import CHUNKS_COLLECTION, CHUNKS_INDEX, EMBEDDING_DIMS, EMBEDDING_MODEL

load_dotenv()

MAX_CHUNK_CHARS = 1800
MIN_CHUNK_CHARS = 80


def mongo_client() -> MongoClient:
    user = quote_plus(os.getenv("MONGO_USERNAME", ""))
    pwd = quote_plus(os.getenv("MONGO_PASSWORD", ""))
    host = os.getenv("MONGO_HOST") or f"{os.getenv('MONGO_APP_NAME')}.5kfcs.mongodb.net"
    uri = f"mongodb+srv://{user}:{pwd}@{host}/?retryWrites=true&w=majority"
    return MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=15000, connectTimeoutMS=15000)


# ---------------------------------------------------------------------------
# Utility functions for metadata extraction
# ---------------------------------------------------------------------------

# An ongoing role ("Present") must sort ahead of every dated entry, so it maps
# to today rather than to None.
ONGOING = {"present", "current", "ongoing", "now"}

DATE_FORMATS = ("%Y-%m-%d", "%Y/%m/%d", "%B %Y", "%b %Y", "%B %d, %Y", "%b %d, %Y", "%m/%Y", "%Y")

# Checked in order; the first field that parses wins. End dates before start
# dates so a finished role sorts by when it ended.
END_FIELDS = ("end_date", "endDate", "last_updated", "updated_at", "pushed_at",
              "date", "issue_date", "createdDate")
START_FIELDS = ("start_date", "startDate", "created", "created_at", "createdAt")


def parse_date(date_str) -> str:
    """Parse a date in any format we see in the source data → ISO 8601, or None."""
    if not date_str:
        return None

    date_str = str(date_str).strip()
    if not date_str:
        return None

    if date_str.lower() in ONGOING:
        return date.today().strftime("%Y-%m-%d")

    try:
        return datetime.fromisoformat(date_str.replace("Z", "+00:00")).date().isoformat()
    except ValueError:
        pass

    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue

    # Last resort: a bare 4-digit year anywhere in the string ("Spring 2024").
    match = re.search(r"\b(19|20)\d{2}\b", date_str)
    if match:
        return f"{match.group(0)}-01-01"

    return None


def extract_date_from_dict(item: dict) -> str:
    """Extract the sortable date from an experience / project / repo dict."""
    for field in END_FIELDS + START_FIELDS:
        if item.get(field):
            parsed = parse_date(item[field])
            if parsed:
                return parsed
    return None


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

    Extracts metadata (dates, location, URLs, etc.) and stores them
    as separate fields for sorting and filtering.
    """
    chunks = []

    if isinstance(data, str):
        try:
            data = json.loads(data)
        except (json.JSONDecodeError, TypeError):
            return [{"source": source, "section": path or source, "text": data, "date": None, "metadata": {}}] if data.strip() else []

    if isinstance(data, dict):
        # Group all scalar fields (name, email, summary, ...) into ONE overview chunk
        # so contact-info fragments don't crowd out substantive chunks at retrieval.
        scalars = {k: v for k, v in data.items() if not isinstance(v, (dict, list)) and v not in (None, "")}
        if scalars:
            text = render_value(scalars)
            section = f"{path} > overview" if path else "overview"
            if text.strip():
                # Extract metadata from scalars
                metadata = {}
                for key in ["email", "phone", "location", "linkedin", "github", "url", "website"]:
                    if key in scalars:
                        metadata[key] = scalars[key]

                chunks.append({
                    "source": source,
                    "section": section,
                    "text": text,
                    "date": None,
                    "metadata": metadata
                })

        for key, value in data.items():
            if key in scalars:
                continue
            section = f"{path} > {key}" if path else key
            if isinstance(value, list) and value and all(isinstance(i, dict) for i in value):
                for i, item in enumerate(value):
                    text = render_value(item)
                    if text.strip():
                        # Extract date from this item
                        item_date = extract_date_from_dict(item)

                        # Extract metadata
                        metadata = {}
                        for meta_key in ["location", "company", "title", "position", "url", "link", "repository"]:
                            if meta_key in item:
                                metadata[meta_key] = item[meta_key]

                        chunks.append({
                            "source": source,
                            "section": f"{section} [{i + 1}]",
                            "text": text,
                            "date": item_date,
                            "metadata": metadata
                        })
            elif isinstance(value, dict):
                text = render_value(value)
                if len(text) > MAX_CHUNK_CHARS:
                    chunks.extend(chunk_json(source, value, section))
                elif text.strip():
                    item_date = extract_date_from_dict(value)
                    metadata = {}
                    for meta_key in ["location", "company", "title", "position", "url", "link"]:
                        if meta_key in value:
                            metadata[meta_key] = value[meta_key]

                    chunks.append({
                        "source": source,
                        "section": section,
                        "text": text,
                        "date": item_date,
                        "metadata": metadata
                    })
            else:
                text = render_value({key: value})
                if text.strip():
                    chunks.append({
                        "source": source,
                        "section": section,
                        "text": text,
                        "date": None,
                        "metadata": {}
                    })
    elif isinstance(data, list):
        for i, item in enumerate(data):
            section = f"{path} [{i + 1}]" if path else f"item {i + 1}"
            if isinstance(item, dict):
                text = render_value(item)
                if len(text) > MAX_CHUNK_CHARS:
                    # Keep the repository/item date when splitting long README content.
                    chunks.append({"source": source, "section": section, "text": text,
                                   "date": extract_date_from_dict(item),
                                   "metadata": {k: item[k] for k in ("name", "url") if item.get(k)}})
                elif text.strip():
                    item_date = extract_date_from_dict(item)
                    chunks.append({
                        "source": source,
                        "section": section,
                        "text": text,
                        "date": item_date,
                        "metadata": {}
                    })
            else:
                chunks.extend(chunk_json(source, item, section))
    else:
        text = str(data)
        if text.strip():
            chunks.append({
                "source": source,
                "section": path or source,
                "text": text,
                "date": None,
                "metadata": {}
            })

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
            # Keep the date if the merged chunk doesn't have one, or use the newer date
            if chunk.get("date") and not merged[-1].get("date"):
                merged[-1]["date"] = chunk["date"]
            elif chunk.get("date") and merged[-1].get("date"):
                merged[-1]["date"] = max(merged[-1]["date"], chunk["date"])
        else:
            merged.append(chunk)
    return merged


def split_oversized(chunks: list[dict]) -> list[dict]:
    """Split chunks that exceed MAX_CHUNK_CHARS while preserving metadata."""
    result = []
    for chunk in chunks:
        text = chunk["text"]
        if len(text) <= MAX_CHUNK_CHARS:
            result.append(chunk)
            continue
        lines = [piece for line in text.split("\n")
                 for piece in ([line[i:i + MAX_CHUNK_CHARS] for i in range(0, len(line), MAX_CHUNK_CHARS)] or [""])]
        buf = ""
        part = 1
        for line in lines:
            if len(buf) + 1 + len(line) > MAX_CHUNK_CHARS and buf:
                result.append({
                    **chunk,
                    "section": f"{chunk['section']} (part {part})",
                    "text": buf,
                    "date": chunk.get("date"),
                    "metadata": chunk.get("metadata", {})
                })
                buf, part = "", part + 1
            buf += ("\n" if buf else "") + line
        if buf.strip():
            result.append({
                **chunk,
                "section": f"{chunk['section']} (part {part})",
                "text": buf,
                "date": chunk.get("date"),
                "metadata": chunk.get("metadata", {})
            })
    return result


# ---------------------------------------------------------------------------
# Frontend export
#
# The sync passes one normalized source bundle to both this exporter and the
# chunker. The static site must rebuild after the resulting JSON is committed.
# ---------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "Backend" / "data"
FRONTEND_DATA_FILE = ROOT / "Frontend/portfolio/src/data/portfolioData.json"


def read_source(name: str):
    path = DATA_DIR / f"{name}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text())


def sort_key(item: dict) -> str:
    """Newest-first sort key; undated entries sink to the bottom."""
    return item.get("date") or "0000-00-00"


# Dropped when comparing employers so "Mu Sigma Inc." and "Mu Sigma Innovation
# & Development Labs" resolve to the same company.
COMPANY_NOISE = {"inc", "inc.", "llc", "ltd", "corp", "corporation", "co", "company",
                 "labs", "lab", "innovation", "development", "&", "and", "the", "group"}


def normalize_company(name: str) -> str:
    cleaned = re.sub(r"[^\w\s]", " ", (name or "").lower())
    words = [w for w in cleaned.split() if w not in COMPANY_NOISE]
    return " ".join(words)


def build_experience(resume, linkedin) -> list[dict]:
    """Merge resume + LinkedIn roles, newest first.

    The resume is the curated source. A LinkedIn role is only added when the
    resume has nothing at that employer for the same period — LinkedIn lists
    several overlapping titles per stint that would otherwise show as duplicates.
    """
    roles: list[dict] = []

    for job in (resume or {}).get("work_experience", []):
        end = job.get("end_date", "")
        roles.append({
            "title": job["title"],
            "company": job["company"],
            "location": job.get("location", ""),
            "startDate": job.get("start_date", ""),
            "endDate": end,
            "current": str(end).lower() in ONGOING,
            "technologies": job.get("technologies", []),
            "highlights": job.get("highlights", []),
            "date": extract_date_from_dict(job),
            "source": "resume",
        })

    claimed = {(normalize_company(r["company"]), r["date"]) for r in roles}

    for job in (linkedin or {}).get("work_experience", []):
        company, title = job.get("company_name", ""), job.get("designation", "")
        job_date = extract_date_from_dict(job)
        if not company or (normalize_company(company), job_date) in claimed:
            continue
        end = job.get("end_date", "")
        # LinkedIn stores the whole role as one blob; split it back into bullets.
        highlights = [
            line.strip().lstrip("•").strip()
            for line in job.get("description", "").split("\n")
            if line.strip()
        ]
        roles.append({
            "title": title,
            "company": company,
            "location": job.get("location", ""),
            "startDate": job.get("start_date", ""),
            "endDate": end,
            "current": str(end).lower() in ONGOING,
            "technologies": [],
            "highlights": highlights,
            "date": job_date,
            "source": "linkedin",
        })
        claimed.add((normalize_company(company), job_date))

    return sorted(roles, key=sort_key, reverse=True)


def build_education(resume, linkedin) -> list[dict]:
    schools: dict[str, dict] = {}

    for edu in (resume or {}).get("education", []):
        school = edu.get("school", "")
        schools[school.split(",")[0].lower().strip()] = {
            "degree": edu.get("degree", ""),
            "school": school,
            "field": "",
            "startDate": edu.get("start_date", ""),
            "endDate": edu.get("end_date", ""),
            "honors": edu.get("honors", ""),
            "coursework": edu.get("coursework", []),
            "date": extract_date_from_dict(edu),
        }

    for edu in (linkedin or {}).get("education", []):
        school = edu.get("institution_name", "")
        if not school or school.lower().strip() in schools:
            continue
        schools[school.lower().strip()] = {
            "degree": edu.get("degree", ""),
            "school": school,
            "field": edu.get("field_of_study", ""),
            "startDate": edu.get("start_date", ""),
            "endDate": edu.get("end_date", ""),
            "honors": "",
            "coursework": [],
            "date": extract_date_from_dict(edu),
        }

    return sorted(schools.values(), key=sort_key, reverse=True)


def export_frontend_data(sources=None, write=True) -> dict:
    """Build the normalized payload the React app renders from."""
    resume = sources["resume"] if sources is not None else read_source("resume") or {}
    linkedin = sources["linkedin"] if sources is not None else read_source("linkedin") or {}
    repos = sources["github"] if sources is not None else read_source("github") or []

    payload = {
        "generatedAt": date.today().isoformat(),
        "personal": {
            "name": resume.get("Name", ""),
            "title": "Applied AI Engineer",
            "email": resume.get("email", ""),
            "phone": resume.get("phone", ""),
            "location": resume.get("location", ""),
            "linkedin": resume.get("linkedin_url", ""),
            "github": resume.get("github_url", ""),
            "portfolio": resume.get("portfolio_url", ""),
            "summary": resume.get("summary", ""),
        },
        "experience": build_experience(resume, linkedin),
        "education": build_education(resume, linkedin),
        "projects": sorted(
            [
                {
                    "name": p.get("name", ""),
                    "description": p.get("description", ""),
                    "technologies": p.get("technologies", []),
                    "award": p.get("award", ""),
                    "displayDate": p.get("date", ""),
                    "date": extract_date_from_dict(p),
                }
                for p in resume.get("projects", [])
            ],
            key=sort_key,
            reverse=True,
        ),
        "repos": sorted(
            [
                {
                    "name": r.get("name", ""),
                    "description": r.get("description") or "",
                    "language": r.get("language") or "",
                    "topics": r.get("topics", []),
                    "stars": r.get("stars", 0),
                    "url": r.get("url", ""),
                    "homepage": r.get("homepage") or "",
                    "created": r.get("created", ""),
                    "lastUpdated": r.get("last_updated", ""),
                    "date": extract_date_from_dict(r),
                }
                for r in repos
            ],
            key=sort_key,
            reverse=True,
        ),
        "certifications": sorted(
            [
                {
                    "name": c.get("certification_name", ""),
                    "issuer": c.get("issuing_organization", ""),
                    "issued": c.get("issue_date", ""),
                    "date": extract_date_from_dict(c),
                }
                for c in linkedin.get("certifications", [])
            ],
            key=sort_key,
            reverse=True,
        ),
        "awards": sorted(
            [
                {
                    "name": a.get("award_name", ""),
                    "issuer": a.get("issuing_organization", ""),
                    "issued": a.get("issue_date", ""),
                    "date": extract_date_from_dict(a),
                }
                for a in linkedin.get("honors_and_awards", [])
            ],
            key=sort_key,
            reverse=True,
        ),
        "skills": resume.get("skills", {}),
        "allSkills": linkedin.get("skills", []),
    }

    if sources is not None:
        payload["featuredWork"] = sources.get("featured_work", [])
    else:
        featured_path = ROOT / "Scripts/resources/featured-work.json"
        payload["featuredWork"] = json.loads(featured_path.read_text(encoding="utf-8")) if featured_path.exists() else []

    if write:
        FRONTEND_DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        FRONTEND_DATA_FILE.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    print(f"\n📦 {'Exported' if write else 'Prepared'} frontend data → {FRONTEND_DATA_FILE}")
    print(f"   {len(payload['experience'])} roles, {len(payload['education'])} schools, "
          f"{len(payload['projects'])} projects, {len(payload['repos'])} repos, "
          f"{len(payload['certifications'])} certs, {len(payload['awards'])} awards")
    return payload


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
    for f in sorted(DATA_DIR.glob("*.json")):
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
        embeddings = {emb.index: emb.embedding for emb in result.data}
        if set(embeddings) != set(range(len(batch))):
            raise ValueError("Embedding service returned an incomplete batch")
        for i, chunk in enumerate(batch):
            if len(embeddings[i]) != EMBEDDING_DIMS:
                raise ValueError("Embedding dimensions do not match config.py")
            chunk["embedding"] = embeddings[i]
        print(f"🧮 Embedded {min(start + batch_size, len(chunks))}/{len(chunks)}")
    return chunks


def ensure_vector_index(collection, timeout=300):
    definition = {
        "fields": [
            {"type": "vector", "path": "embedding", "numDimensions": EMBEDDING_DIMS, "similarity": "cosine"},
            {"type": "filter", "path": "source"},
            {"type": "filter", "path": "date"},
        ]
    }
    existing = next((i for i in collection.list_search_indexes() if i["name"] == CHUNKS_INDEX), None)
    if existing is None:
        collection.create_search_index(SearchIndexModel(definition=definition, name=CHUNKS_INDEX, type="vectorSearch"))
    elif existing.get("latestDefinition") != definition:
        collection.update_search_index(CHUNKS_INDEX, definition)
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        index = next((i for i in collection.list_search_indexes() if i["name"] == CHUNKS_INDEX), {})
        if index.get("status") == "FAILED":
            raise RuntimeError(f"Vector index {CHUNKS_INDEX} failed to build")
        if (index.get("queryable") and index.get("status") == "READY"
                and index.get("latestDefinition") == definition):
            return
        time.sleep(5)
    raise TimeoutError(f"Vector index {CHUNKS_INDEX} did not become ready")


def main():
    # Preserve the historical entrypoint while using the shared publication path.
    sys.path.insert(0, str(ROOT / "Scripts"))
    from sync_portfolio import main as sync_main
    sync_main()


if __name__ == "__main__":
    main()
