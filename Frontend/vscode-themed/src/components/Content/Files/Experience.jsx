import React, { useState } from "react";
import "./Experience.css";
import { portfolioConfig } from "../../../config/portfolioConfig";

const FILTERS = [
  { id: "all", label: "Everything" },
  { id: "work", label: "Work" },
  { id: "education", label: "Education" },
  { id: "award", label: "Awards" },
  { id: "certification", label: "Certifications" },
];

const ICONS = {
  work: "💼",
  education: "🎓",
  award: "🏆",
  certification: "📜",
};

/** Flatten every dated record into one timeline, newest first. */
function buildTimeline() {
  const items = [];

  portfolioConfig.syncedExperience.forEach((job, i) => {
    items.push({
      id: `work-${i}`,
      kind: "work",
      date: job.date,
      title: job.title,
      org: job.company,
      period: `${job.startDate} — ${job.endDate}`,
      location: job.location,
      current: job.current,
      bullets: job.highlights,
      tech: job.technologies,
    });
  });

  portfolioConfig.syncedEducation.forEach((edu, i) => {
    items.push({
      id: `edu-${i}`,
      kind: "education",
      date: edu.date,
      title: edu.degree,
      org: edu.school,
      period: `${edu.startDate} — ${edu.endDate}`,
      location: "",
      bullets: [edu.honors, edu.field].filter(Boolean),
      tech: edu.coursework,
    });
  });

  portfolioConfig.awards.forEach((award, i) => {
    items.push({
      id: `award-${i}`,
      kind: "award",
      date: award.date,
      title: award.name,
      org: award.issuer,
      period: award.issued,
      bullets: [],
      tech: [],
    });
  });

  portfolioConfig.certifications.forEach((cert, i) => {
    items.push({
      id: `cert-${i}`,
      kind: "certification",
      date: cert.date,
      title: cert.name,
      org: cert.issuer,
      period: cert.issued,
      bullets: [],
      tech: [],
    });
  });

  return items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

function Experience() {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(() => new Set(["work-0"]));

  const timeline = buildTimeline();
  const visible =
    filter === "all" ? timeline : timeline.filter((item) => item.kind === filter);

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const years = portfolioConfig.syncedExperience.length
    ? new Date().getFullYear() -
      new Date(
        portfolioConfig.syncedExperience[
          portfolioConfig.syncedExperience.length - 1
        ].date
      ).getFullYear()
    : 0;

  return (
    <div className="experience-page">
      <header className="experience-header">
        <p className="eyebrow">Career</p>
        <h1>Experience &amp; Journey</h1>
        <p className="subtitle">
          Every role, degree and award — sorted newest first, straight from the
          same data my chatbot reads.
        </p>

        <div className="experience-stats">
          <div className="stat">
            <span className="stat-value">{years}+</span>
            <span className="stat-label">Years building</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {portfolioConfig.syncedExperience.length}
            </span>
            <span className="stat-label">Roles</span>
          </div>
          <div className="stat">
            <span className="stat-value">{portfolioConfig.awards.length}</span>
            <span className="stat-label">Awards</span>
          </div>
          <div className="stat">
            <span className="stat-value">{portfolioConfig.repos.length}</span>
            <span className="stat-label">Repos</span>
          </div>
        </div>
      </header>

      <div className="timeline-filters" role="tablist" aria-label="Timeline filter">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={`filter-chip ${filter === f.id ? "active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="timeline">
        {visible.map((item) => {
          const isOpen = expanded.has(item.id);
          const hasDetail = item.bullets.length > 0 || item.tech.length > 0;

          return (
            <article
              key={item.id}
              className={`timeline-entry ${item.current ? "current" : ""}`}
            >
              <div className="timeline-marker" aria-hidden="true">
                <span className="marker-icon">{ICONS[item.kind]}</span>
                {item.current && <span className="marker-ping" />}
              </div>

              <div className={`entry-card ${isOpen ? "open" : ""}`}>
                <div className="entry-top">
                  <div>
                    <h3 className="entry-title">
                      {item.title}
                      {item.current && (
                        <span className="current-badge">Current</span>
                      )}
                    </h3>
                    <p className="entry-org">{item.org}</p>
                  </div>
                  {hasDetail && (
                    <button
                      className="expand-btn"
                      onClick={() => toggle(item.id)}
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.title}`}
                    >
                      {isOpen ? "−" : "+"}
                    </button>
                  )}
                </div>

                <div className="entry-meta">
                  <span className="meta-item">📅 {item.period}</span>
                  {item.location && (
                    <span className="meta-item">📍 {item.location}</span>
                  )}
                </div>

                {hasDetail && isOpen && (
                  <div className="entry-detail">
                    {item.bullets.length > 0 && (
                      <ul className="entry-bullets">
                        {item.bullets.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                    {item.tech.length > 0 && (
                      <div className="entry-tech">
                        {item.tech.map((tech, i) => (
                          <span key={i} className="tech-chip">
                            {tech}
                          </span>
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

      <footer className="data-note">
        Synced from resume, LinkedIn and GitHub on{" "}
        {portfolioConfig.dataGeneratedAt}
      </footer>
    </div>
  );
}

export default Experience;
