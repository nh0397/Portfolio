import { useState } from "react";
import { analyseRole, fitPrompt } from "../lib/roleFit";
import { SparkIcon, ArrowIcon } from "./Icons";
import "./FitCheck.css";

const SAMPLES = {
  "AI Engineer": `We're hiring an AI Engineer to build production LLM systems.
You'll design RAG pipelines over internal knowledge, build multi-agent
workflows, and own LLM evaluation. Requirements: 4+ years software
engineering, strong Python, experience with LangChain or LangGraph, vector
search (Pinecone or similar), and deploying on AWS with Docker. Nice to have:
fine-tuning, prompt engineering, observability for model outputs.`,

  "Senior Backend": `Senior Backend Engineer. You'll own high-throughput services
in Go and Node.js backed by PostgreSQL and Redis, with Kafka for eventing.
5+ years experience required. You should be comfortable with performance
profiling, query optimization, caching strategy, CI/CD, and Kubernetes.
Experience with observability and distributed systems strongly preferred.`,

  "Full-Stack": `Full-Stack Engineer. React and TypeScript on the front end,
Node.js and PostgreSQL behind it. 3+ years experience. You'll build data-dense
interfaces that stay fast, write tests with Jest and Cypress, and ship through
GitHub Actions. Bonus: Next.js, accessibility work, and AWS.`,
};

function ScoreRing({ score }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const tone = score >= 70 ? "high" : score >= 45 ? "mid" : "low";

  return (
    <div className={`ring ring-${tone}`}>
      <svg viewBox="0 0 80 80" width="82" height="82" aria-hidden="true">
        <circle cx="40" cy="40" r={r} className="ring-track" />
        <circle
          cx="40"
          cy="40"
          r={r}
          className="ring-fill"
          strokeDasharray={c}
          strokeDashoffset={c - (c * score) / 100}
        />
      </svg>
      <div className="ring-label">
        <span className="ring-num mono">{score}</span>
        <span className="ring-pct">%</span>
      </div>
    </div>
  );
}

export default function FitCheck({ onAskForWriteup, busy }) {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [tooShort, setTooShort] = useState(false);

  const run = (text) => {
    const analysis = analyseRole(text);
    if (!analysis) {
      setTooShort(true);
      setResult(null);
      return;
    }
    setTooShort(false);
    setResult(analysis);
  };

  const loadSample = (key) => {
    setJd(SAMPLES[key]);
    run(SAMPLES[key]);
  };

  return (
    <div className="fit">
      <div className="fit-intro">
        <h3>Does he fit your role?</h3>
        <p>
          Paste a job description. The match is computed on this page against
          his verified record — no model involved, so it can&apos;t invent a
          skill he doesn&apos;t have. Gaps are shown as plainly as matches.
        </p>
      </div>

      <div className="fit-samples">
        <span className="fit-samples-label">Try:</span>
        {Object.keys(SAMPLES).map((k) => (
          <button key={k} onClick={() => loadSample(k)}>
            {k}
          </button>
        ))}
      </div>

      <textarea
        className="fit-input"
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste the job description here…"
        rows={5}
      />

      {tooShort && (
        <p className="fit-warn">
          That&apos;s too short to read as a job description — paste a bit more.
        </p>
      )}

      <button className="fit-run" onClick={() => run(jd)} disabled={!jd.trim()}>
        Analyse fit
        <ArrowIcon size={15} />
      </button>

      {result && (
        <div className="fit-result">
          <div className="fit-headline">
            <ScoreRing score={result.score} />
            <div className="fit-headline-copy">
              <strong>
                {result.demonstrated.length} of {result.totalRequirements}{" "}
                requirements demonstrated in shipped work
              </strong>
              {result.years && (
                <span className={result.years.meets ? "yr ok" : "yr under"}>
                  {result.years.meets ? "✓" : "!"} Asks ~{result.years.asked}y ·
                  has ~{result.years.have}y
                </span>
              )}
            </div>
          </div>

          {result.demonstrated.length > 0 && (
            <section className="fit-group">
              <h4 className="fit-h ok">Demonstrated in shipped work</h4>
              <ul className="fit-list">
                {result.demonstrated.map((m) => (
                  <li key={m.name}>
                    <span className="fit-skill">{m.name}</span>
                    <span className="fit-where mono">
                      {m.count} {m.count === 1 ? "place" : "places"}
                    </span>
                    {m.evidence[0] && (
                      <span className="fit-eg">e.g. {m.evidence[0].label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.claimed.length > 0 && (
            <section className="fit-group">
              <h4 className="fit-h mid">Listed, but not shown in a project</h4>
              <ul className="fit-list gaps">
                {result.claimed.map((c) => (
                  <li key={c.name}>
                    <span className="fit-skill">{c.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.gaps.length > 0 && (
            <section className="fit-group">
              <h4 className="fit-h gap">Not in the record</h4>
              <ul className="fit-list gaps">
                {result.gaps.map((g) => (
                  <li key={g.name}>
                    <span className="fit-skill">{g.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <button
            className="fit-writeup"
            onClick={() => onAskForWriteup(fitPrompt(result, jd))}
            disabled={busy}
          >
            <SparkIcon size={15} />
            {busy ? "Writing…" : "Get his written take on this role"}
          </button>
        </div>
      )}
    </div>
  );
}
