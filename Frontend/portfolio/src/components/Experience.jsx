import { useState } from "react";
import data from "../data/portfolioData.json";
import "./Experience.css";

export default function Experience() {
  const [open, setOpen] = useState(new Set([0]));

  const toggle = (i) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <section id="experience" className="section">
      <div className="wrap">
        <header className="section-head reveal">
          <p className="section-num">02 — Experience</p>
          <h2 className="section-title">Where I&apos;ve done it</h2>
          <p className="section-sub">
            Four years shipping backend and data systems, now applied to AI.
            Every bullet here is scoped to something that shipped.
          </p>
        </header>

        <div className="xp-list">
          {data.experience.map((role, i) => {
            const isOpen = open.has(i);

            return (
              <article
                key={`${role.company}-${role.title}`}
                className={`xp reveal ${isOpen ? "open" : ""} ${role.current ? "current" : ""}`}
              >
                <div className="xp-rail" aria-hidden="true">
                  <span className="xp-node" />
                </div>

                <div className="xp-content">
                  <button
                    className="xp-head"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                  >
                    <div className="xp-head-main">
                      <h3 className="xp-title">
                        {role.title}
                        {role.current && <span className="xp-now">Now</span>}
                      </h3>
                      <p className="xp-company">{role.company}</p>
                    </div>

                    <div className="xp-head-meta">
                      <span className="xp-period mono">
                        {role.startDate} — {role.endDate}
                      </span>
                      {role.location && (
                        <span className="xp-location">{role.location}</span>
                      )}
                    </div>

                    <span className="xp-toggle" aria-hidden="true">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="xp-detail">
                      <ul className="xp-bullets">
                        {role.highlights.map((h, k) => (
                          <li key={k}>{h}</li>
                        ))}
                      </ul>

                      {role.technologies.length > 0 && (
                        <div className="xp-tech">
                          {role.technologies.map((t) => (
                            <span key={t} className="chip chip-gold">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
