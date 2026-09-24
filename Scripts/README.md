# Portfolio data sync

Run `python Scripts/sync_portfolio.py` from the repository root. `Scripts/main.py`
and `Backend/ingest.py` delegate to this same entrypoint. The older scraping,
chunking, and graph modules are historical; this workflow does not use Neo4j.

## Data flow

1. Read the resume and curated project details from `Scripts/resources/`.
2. Fetch every public GitHub repository, including paginated results and READMEs.
3. Use the checked-in LinkedIn snapshot, or explicitly enable live refresh.
4. Validate a single normalized source bundle.
5. Generate chatbot chunks and the frontend JSON from that same bundle.
6. Embed all chunks, ensure the configured Atlas vector index is ready, then
   replace the collection in a transaction. Failures roll back the replacement.
7. Write `Frontend/portfolio/src/data/portfolioData.json` only after DB success.
8. GitHub Actions builds the site, commits the JSON, and optionally calls a
   Netlify build hook. Netlify must finish deploying before the live site changes.

MongoDB and Git/Netlify are separate systems, so this is not an atomic deployment
across both. Atlas search indexing is also eventually consistent. If a commit,
build, or deployment fails after the DB update, fix that failure and rerun the
workflow. The JSON `sourceHash` and each chunk's `source_hash` identify the bundle;
chunks also store `ingested_at` and `embedding_model` for auditing.

## Source files

- `Scripts/resources/Resume.pdf`: optional text-based resume. When present, it
  takes precedence over resume.json and is extracted using Gemini. Requires
  `GOOGLE_API_KEY`. Scanned/image-only PDFs fail instead of silently erasing data.
- `Scripts/resources/resume.json`: editable structured resume; used when no PDF
  is present. Includes `Name`, contact fields, `work_experience` (company, title,
  dates, highlights, technologies), education, projects, and a skills object.
- `Scripts/resources/linkedin.json`: checked-in fallback for skills,
  certifications, awards, and optional additional roles/education.
- `Scripts/resources/featured-work.json`: curated case studies and video metadata.
  New GitHub repositories appear automatically in the repository grid. Add an
  entry here only when a project also needs a featured narrative or demo video.
  YouTube media uses `{ "type": "youtube", "id": "VIDEO_ID", "alt": "Demo title" }`.

The initial resume and LinkedIn JSON were reconstructed from the existing
August 9, 2026 frontend export, not freshly downloaded profiles. Resume roles
include the existing merged experience to preserve the site. Replace these
snapshots with your authoritative source files when available. Files in this
public repo and generated UI JSON are public; use a publishable resume.

## Setup

Install Python 3.12 and run:

```sh
pip install -r Scripts/requirements-sync.txt
python -m unittest discover -s Scripts/tests -v
python Scripts/sync_portfolio.py --dry-run
python Scripts/sync_portfolio.py --frontend-only
python Scripts/sync_portfolio.py
```

`--dry-run` fetches and validates without writing. `--frontend-only` (also
`--export-only`) writes site JSON without MongoDB/embeddings, useful for branch
previews. PDF parsing/live LinkedIn extraction can still call Gemini in these
modes. Full sync needs the secrets below. Local credentials can live in ignored
`Scripts/.env` or `Backend/.env`.

## GitHub Actions

`.github/workflows/sync-portfolio.yml` runs Mondays at 09:23 UTC, manually, and
when source files change. Production sync runs only on the default branch;
pushing this feature branch cannot update the live database. Merge the workflow
to activate scheduled runs. Allow Actions to write repository contents; branch
protection must allow the bot's generated-data commit, or the push step fails.

Repository secrets:

| Secret | Purpose |
| --- | --- |
| `MONGO_USERNAME`, `MONGO_PASSWORD` | Atlas credentials |
| `MONGO_HOST` | Full cluster hostname, without scheme or credentials |
| `MONGO_DB_NAME` | Same database as the deployed backend |
| `FIREWORKS_API_KEY` | Generate embeddings |
| `GOOGLE_API_KEY` | Required for PDF parsing and live LinkedIn extraction |
| `LINKEDIN_EMAIL`, `LINKEDIN_PASSWORD` | Only for optional live LinkedIn refresh |
| `NETLIFY_BUILD_HOOK` | Optional POST hook to explicitly request a site rebuild |

GitHub access uses the workflow's built-in token (public repositories only).
The Atlas database user needs write and search-index management permissions.
Atlas networking must allow the chosen Actions runner to connect; a runner with
controlled egress is useful when configuring a narrow Atlas access list.

Repository variables (defaults shown):

| Variable | Default |
| --- | --- |
| `GITHUB_USERNAME` | `nh0397` |
| `MONGO_CHUNKS_CL_NAME` | `portfolio-chunks` |
| `MONGO_CHUNKS_INDEX_NAME` | `chunks_vector_index` |
| `EMBEDDING_MODEL` | `nomic-ai/nomic-embed-text-v1.5` |
| `EMBEDDING_DIMS` | `768` |
| `EXTRACTION_MODEL` | `gemini-2.5-flash` |
| `LINKEDIN_REFRESH` | `false` |
| `LINKEDIN_URL` | `https://www.linkedin.com/in/naisarg-h/` |

Collection, index, embedding model and dimensions must match the backend's
hosting environment. Both code paths import `Backend/config.py`, but different
environment overrides can still diverge. The index is created or updated in
place under that configured name; no new index name is generated per run.

LinkedIn's existing Selenium login approach remains optional because login
challenges and site changes can block unattended access. Enable it with
`LINKEDIN_REFRESH=true` only after testing the credentials. A failed live scrape
fails the run before database publication; it does not silently use stale data.
No credentials are needed when using the snapshot.

The frontend imports the generated JSON at build time; it does not query MongoDB.
Configure Netlify's Git integration to build generated-data commits, or set the
build hook above. The workflow also uploads the built site as an Actions artifact.
A successful build-hook request means a deployment was requested, not completed.
