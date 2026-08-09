# Portfolio — and the RAG system underneath it

A personal site with an AI assistant that answers from my actual record, plus a
tool that scores a pasted job description against it.

The site is the surface. The interesting part is what sits behind it: an
ingestion pipeline, a vector index, a retrieval strategy, and a grounding
scheme — the same set of problems any organisation hits when it tries to put an
assistant in front of its own knowledge. **Swap my résumé, GitHub and LinkedIn
for a company's docs, tickets and changelog, and this is a customer support
assistant.** Every hard part stays the same.

This README is about those problems and how they're solved here, because that
transfers and "I built a portfolio" doesn't.

---

## The problem, stated honestly

A portfolio is a static artifact. A visitor arrives with a specific question —
*has he shipped anything at scale? does he actually know Kafka or is it just
listed? is he a fit for the role I'm hiring for?* — and their only option is to
skim and guess.

Bolting a chatbot on doesn't fix it. It creates four new problems, and they're
the same four that break most internal AI assistants:

| Problem | How it shows up here | How it shows up in a company |
| --- | --- | --- |
| **Drift** | The site says one thing, the bot says another | The docs say X, the support bot says Y |
| **Recency** | Similarity search surfaces the most *semantically* similar work, not the most *recent* | The bot answers with last year's pricing |
| **Hallucination** | A model asked "is he a fit?" will happily say yes | The bot invents a feature that doesn't exist |
| **Provenance** | "Knows Kubernetes" — from a shipped project, or from a skills list? | Documented behaviour vs. a stale forum post |

What follows is how each one is handled.

---

## 1. Drift: one source, two consumers

The failure mode: the page and the assistant are maintained separately, so they
disagree. This site had exactly that bug — the page advertised a 2023 role while
the assistant, reading a different store, knew about the current one.

The fix is structural rather than procedural. One command writes **both**
consumers from the same source:

```
Backend/data/{resume,linkedin,github}.json      ← the only place facts are edited
                     │
          python ingest.py
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
  MongoDB Atlas             src/data/portfolioData.json
  (vector index —           (what the React app renders)
   what the bot searches)
```

There is no path where one updates and the other doesn't. Changing a fact means
editing a source file and re-running ingest; nothing else is authoritative.

> **Transfers as:** if your assistant and your product surface read from
> different stores, they *will* diverge. Make the divergence impossible instead
> of writing a runbook asking people not to cause it.

## 2. Recency: retrieval that knows what "latest" means

Cosine similarity has no opinion about time. Asked "what's he working on?", the
index cheerfully returned two-year-old projects — they were, semantically, an
excellent match.

Every chunk carries an extracted date, and retrieval sorts descending. Ongoing
work maps to today so it ranks first.

Getting the dates in turned out to be most of the work: GitHub keys on
`created`/`last_updated`, LinkedIn certifications on `issue_date`, résumé roles
on `start_date`/`end_date`, and `"Present"` isn't a date at all. An earlier pass
that only checked a couple of field names silently stored `date: null` on every
chunk — the sort ran correctly against nothing.

> **Transfers as:** in any evolving knowledge base, relevance is a function of
> *recency and* similarity. And "we added date sorting" is worth nothing until
> you check the dates actually parsed.

## 3. Hallucination: compute first, narrate second

The Role Fit tool is the clearest case. A recruiter pastes a job description and
asks the highest-stakes question on the site — *is this person a fit?*

Handing that to a model is how you get a confident yes. So the model never
decides it:

```
job description
      │
      ▼
local, deterministic matcher        ← no model, no network, no cost
  · which requirements appear
  · which have evidence, of what kind
  · score
      │
      ▼
settled numbers ──► LLM ──► prose
                    (narrates the result; cannot change it)
```

The scoring is client-side and reproducible. The model is handed the finished
analysis and asked to write it up, with explicit instruction not to claim
anything the analysis lists as a gap. It narrates; it never adjudicates.

> **Transfers as:** put the model where language is the hard part, not where
> correctness is. Anything a deterministic function can decide, it should — the
> model then can't be wrong about it.

## 4. Provenance: not all evidence is equal

"Knows Docker" pulled from a shipped project is a different claim from "Docker"
sitting in a LinkedIn skills list. Treating them the same is how a portfolio —
or a support bot — quietly becomes untrustworthy.

Evidence is tagged by source and weighted:

| Tier | Source | Weight |
| --- | --- | --- |
| Demonstrated | role bullet, project, repository | full |
| Listed | résumé summary, skills list | half |
| Absent | — | zero |

This is load-bearing. The first version folded the tiers together and scored
**100% on every job description tried** — which reads as marketing, not
analysis. Tiered, well-matched roles land at 89–95% and a deliberately
mismatched iOS/Rust posting lands at **20%**, with the years shortfall flagged.
A tool that can't say no is worthless when it says yes.

The same evidence drives the Skills section: every bar is a count of where that
skill actually appears, and clicking one lists the roles, projects and repos
behind the number. Nothing on that section is self-asserted.

> **Transfers as:** surface confidence *and* its basis. "Documented" and
> "someone mentioned it once" should not render identically.

## 5. Cost: decide where the money goes

Deliberate placement, not accident:

| Work | Runs | Cost |
| --- | --- | --- |
| Speech recognition + synthesis | on-device (Web Speech API) | none |
| Job-description scoring | in the browser | none |
| Skill evidence | in the browser, at build data | none |
| Retrieval + generation | Flask → MongoDB Atlas → Groq | the only paid path |

Voice is genuinely free — all 180 available voices report `localService: true`,
so nothing about it touches the host. Whether the site runs on a free tier is
decided almost entirely by the one remaining call.

> **Transfers as:** most "we can't afford an AI feature" conclusions come from
> routing everything through the model. Push what's deterministic to the client
> and the bill collapses to the part that genuinely needs a model.

## 6. Grounding the interface, not just the answer

The assistant answers from retrieval — but so does the page. Experience,
education, awards, repositories and language mix all render from the generated
dataset. The Skills bars are computed. The proof numbers trace to specific
roles.

A visitor who never opens the assistant still gets a page that can't drift from
the record, because it's rendered from the same file the assistant searches.

---

## What broke on the way

Kept because the failures are more instructive than the features:

- **Date sorting sorted nothing.** Field names didn't match the sources, so
  every chunk stored `date: null`. The code was right; the data never arrived.
- **`"gin"` matched "En-gin-eer".** Naive substring matching made Go/Gin look
  evidenced by every role with "Engineer" in the title — including an iOS job it
  had nothing to do with. `"rag"` matched "sto-rag-e". Matching now compares
  whole tokens, with explicit `*` for real prefixes.
- **A sentence-ending period broke matching.** The normaliser preserved `.` to
  keep `node.js` intact, so `"Kubernetes."` welded the period on and stopped
  matching. Dots now survive only between two characters.
- **React silently deleted the reveal animation's class.** An IntersectionObserver
  added `in` straight to the DOM; React owns `className` on those nodes and
  rebuilt it on every render, so opening a project card wiped it and the card
  stayed invisible forever. Reveal state moved to a `data-` attribute, which
  React doesn't manage.
- **Smooth scrolling was silently ignored.** The fallback inherited
  `scroll-behavior: smooth` from the stylesheet and was dropped for exactly the
  same reason as the thing it was meant to rescue.

---

## Repository layout

```
Portfolio/
├── Frontend/
│   ├── portfolio/            ← the site (React 19 + Vite)
│   └── archive/              ← previous builds, kept for reference
│       ├── vscode-themed/       VS Code-themed portfolio (CRA)
│       └── simple-react/        first minimalist version (CRA)
├── Backend/
│   ├── app.py                Flask API — retrieval + generation
│   ├── ingest.py             chunk → embed → index, and export site data
│   ├── data/*.json           the only place facts are edited (gitignored)
│   └── vercel.json
└── Scripts/                  data extraction helpers
```

## Running it

```bash
# Backend — needs FIREWORKS_API_KEY, GROQ_API_KEY and MONGO_* in Backend/.env
cd Backend
pip install -r requirements.txt
python ingest.py          # writes the vector index AND the site's data file
python app.py             # http://localhost:5001
```

```bash
# Site
cd Frontend/portfolio
npm install
npm run dev               # http://localhost:5173
```

`python ingest.py --export-only` refreshes the site data without touching
MongoDB. `--dry-run` prints the chunks and their extracted dates without
writing anything.

## Deploying

The backend deploys from `Backend/` via its own `vercel.json`.

The site is a static Vite build. **The frontend project's root directory moved**
— it is now `Frontend/portfolio`, not `Frontend/vscode-themed`:

| Setting | Value |
| --- | --- |
| Root directory | `Frontend/portfolio` |
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

`VITE_CHAT_API_URL` overrides the chat endpoint; without it the build falls back
to localhost in dev and the deployed backend in production.

## Stack

React 19 · Vite · Flask · MongoDB Atlas Vector Search · Fireworks embeddings
(`nomic-embed-text-v1.5`) · Groq (`llama-3.3-70b-versatile`) · Web Speech API
