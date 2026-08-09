import data from "../data/portfolioData.json";
import { proofPoints } from "../data/content";
import portrait from "../assets/portrait.jpeg";
import { scrollToSection } from "../lib/scrollToSection";
import { ArrowIcon, SparkIcon, GitHubIcon, LinkedInIcon } from "./Icons";
import "./Hero.css";

export default function Hero({ onOpenAssistant }) {
  const { personal } = data;
  const current = data.experience.find((r) => r.current) || data.experience[0];

  return (
    <section id="top" className="hero">
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <p className="hero-status rise rise-1">
            <span className="status-dot" aria-hidden="true" />
            {current.title} at {current.company}
          </p>

          <h1 className="hero-name rise rise-2">
            Naisarg
            <br />
            Halvadiya
          </h1>

          <p className="hero-pitch rise rise-3">
            I build <em>applied</em> AI systems — multi-agent orchestration, RAG
            pipelines and LLM evaluation — on four years of backend engineering
            that taught me what actually survives production.
          </p>

          <div className="hero-actions rise rise-4">
            <button className="btn btn-primary" onClick={onOpenAssistant}>
              <SparkIcon size={16} />
              Ask my AI anything
            </button>
            <a
              className="btn btn-ghost"
              href="#work"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("work");
              }}
            >
              See the work
              <ArrowIcon />
            </a>
          </div>

          <div className="hero-meta rise rise-5">
            <span className="mono">{personal.location}</span>
            <span className="dot-sep" aria-hidden="true">·</span>
            <a href={personal.github} target="_blank" rel="noreferrer" className="meta-link">
              <GitHubIcon size={15} /> GitHub
            </a>
            <a href={personal.linkedin} target="_blank" rel="noreferrer" className="meta-link">
              <LinkedInIcon size={15} /> LinkedIn
            </a>
          </div>
        </div>

        <div className="hero-visual rise rise-3">
          <div className="portrait-frame">
            <img src={portrait} alt="Naisarg Halvadiya" className="portrait" />
          </div>
          <div className="portrait-tag">
            <span className="tag-k mono">M.S.</span>
            <span className="tag-v">Data Science &amp; AI · SFSU</span>
          </div>
        </div>
      </div>

      <div className="wrap">
        <ul className="proof-strip rise rise-6">
          {proofPoints.map((p) => (
            <li key={p.label} className="proof">
              <div className="proof-value mono">
                {p.value}
                <span className="proof-unit">{p.unit}</span>
              </div>
              <div className="proof-label">{p.label}</div>
              <p className="proof-detail">{p.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
