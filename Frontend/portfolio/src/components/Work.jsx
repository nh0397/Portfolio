import { useState } from "react";
import { featuredWork } from "../data/content";
import data from "../data/portfolioData.json";
import { GitHubIcon, ExternalIcon, ArrowIcon } from "./Icons";
import "./Work.css";

function Media({ media, title }) {
  const [play, setPlay] = useState(false);

  if (!media || media.type === "none") return null;

  if (media.type === "gif") {
    return (
      <div className="work-media">
        <img src={media.src} alt={media.alt || title} loading="lazy" />
      </div>
    );
  }

  if (media.type === "youtube") {
    // Hold the iframe until asked — five autoplaying embeds would cost more
    // than the whole rest of the page.
    return (
      <div className="work-media">
        {play ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${media.id}?autoplay=1&modestbranding=1&rel=0`}
            title={media.alt || title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            className="media-poster"
            onClick={() => setPlay(true)}
            aria-label={`Play demo video for ${title}`}
          >
            <img
              src={`https://i.ytimg.com/vi/${media.id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
            />
            <span className="play-btn" aria-hidden="true">▶</span>
            <span className="play-label">Watch demo</span>
          </button>
        )}
      </div>
    );
  }

  return null;
}

export default function Work() {
  const [openId, setOpenId] = useState(featuredWork[0].id);

  return (
    <section id="work" className="section">
      <div className="wrap">
        <header className="section-head reveal">
          <p className="section-num">01 — Selected work</p>
          <h2 className="section-title">Things I built that had to actually work</h2>
          <p className="section-sub">
            Each of these started as a concrete failure — a frozen browser, a
            confidently wrong answer, data walking out the door. The outcome
            column is what changed.
          </p>
        </header>

        <div className="work-list">
          {featuredWork.map((project, i) => {
            const open = openId === project.id;

            return (
              <article
                key={project.id}
                className={`work-item reveal ${open ? "open" : ""}`}
              >
                <button
                  className="work-head"
                  onClick={() => setOpenId(open ? null : project.id)}
                  aria-expanded={open}
                >
                  <span className="work-index mono">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="work-heading">
                    <span className="work-title">
                      {project.title}
                      {project.award && (
                        <span className="work-award">{project.award}</span>
                      )}
                    </span>
                    <span className="work-tagline">{project.tagline}</span>
                  </span>

                  <span className="work-year mono">{project.year}</span>
                  <span className="work-toggle" aria-hidden="true">
                    {open ? "−" : "+"}
                  </span>
                </button>

                {open && (
                  <div className="work-body">
                    <Media media={project.media} title={project.title} />

                    <div className="work-narrative">
                      <div className="narrative-block">
                        <h4>The problem</h4>
                        <p>{project.problem}</p>
                      </div>
                      <div className="narrative-block">
                        <h4>What I did</h4>
                        <p>{project.approach}</p>
                      </div>
                    </div>

                    <ul className="work-metrics">
                      {project.metrics.map((m) => (
                        <li key={m.k}>
                          <span className="metric-k mono">{m.k}</span>
                          <span className="metric-v">{m.v}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="work-foot">
                      <div className="work-stack">
                        {project.stack.map((s) => (
                          <span key={s} className="chip">{s}</span>
                        ))}
                      </div>

                      <div className="work-links">
                        {project.github && (
                          <a
                            className="work-link"
                            href={project.github}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <GitHubIcon size={16} /> Source
                          </a>
                        )}
                        {project.demo && (
                          <a
                            className="work-link"
                            href={project.demo}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalIcon /> Live
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <a
          className="work-all reveal"
          href={data.personal.github}
          target="_blank"
          rel="noreferrer"
        >
          All {data.repos.length} public repositories on GitHub
          <ArrowIcon />
        </a>
      </div>
    </section>
  );
}
