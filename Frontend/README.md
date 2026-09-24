# Frontend

`portfolio/` is the active React/Vite site. `archive/` contains historical builds.

```sh
cd Frontend/portfolio
npm ci
npm run dev
```

Use Node 22.12 or newer. The Flask backend supplies chat responses.

## Where the UI gets its data

The UI imports `portfolio/src/data/portfolioData.json` at build time. It does not
read MongoDB. `python Scripts/sync_portfolio.py` produces both MongoDB chunks and
this JSON from the same resume, LinkedIn, GitHub, and featured-project sources.
After a successful scheduled sync, GitHub Actions commits the JSON and the site
must rebuild/deploy for visitors to see it.

- Resume, experience, education, skills, awards and repositories are generated.
- Featured project descriptions, metrics and video metadata are maintained in
  `Scripts/resources/featured-work.json` and included in the generated JSON.
- The GitHub repository grid automatically includes newly fetched projects.
- `content.js` retains curated headline proof points and the skill taxonomy;
  layout and other editorial copy remain in React components.
- `--frontend-only` refreshes JSON for a branch preview without touching MongoDB.

See `Scripts/README.md` for source files, scheduling, credentials, index settings,
and deployment setup. Do not hand-edit the generated JSON.
