import React, { useState } from "react";
import "./About.css";
import { portfolioConfig, skills, ui } from "../../../config/portfolioConfig";

const categories = ["All", ...Object.keys(skills)];

function LinkedInPostCard({ post }) {
  return (
    <article className="post-card">
      <div className="post-head">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3v9zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.75 1.75 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.5-.03-3.45-2.1-3.45-2.1 0-2.42 1.64-2.42 3.34V19H6.5v-9h2.84v1.3h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.6V19z" />
        </svg>
        <span>LinkedIn</span>
      </div>
      <h4>{post.title}</h4>
      <p>{post.description}</p>
      <a href={post.url} target="_blank" rel="noopener noreferrer" className="post-link">
        Read post →
      </a>
    </article>
  );
}

function About() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { personal, certifications, awards, repos, syncedEducation } = portfolioConfig;

  const visibleSkills =
    activeCategory === "All"
      ? Object.values(skills).flat()
      : skills[activeCategory] || [];

  const languages = repos.reduce((acc, repo) => {
    if (repo.language) acc[repo.language] = (acc[repo.language] || 0) + 1;
    return acc;
  }, {});
  const topLanguages = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="about-page">
      <header className="about-hero">
        <p className="eyebrow">About</p>
        <h1>{ui.about.title.replace("👋 ", "")}</h1>
        <p className="lede">{personal.brief}</p>

        <div className="hero-facts">
          <span className="fact">📍 {personal.location}</span>
          <a className="fact link" href={`mailto:${personal.email}`}>✉ {personal.email}</a>
          <a className="fact link" href={personal.linkedin} target="_blank" rel="noreferrer">in LinkedIn</a>
          <a className="fact link" href={personal.github} target="_blank" rel="noreferrer">◆ GitHub</a>
        </div>
      </header>

      <section className="about-section">
        <h2>Skills</h2>
        <div className="skill-filters" role="tablist" aria-label="Skill categories">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`filter-chip ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="skill-grid">
          {visibleSkills.map((skill, i) => (
            <div key={`${skill.name}-${i}`} className="skill-pill">
              {skill.icon && <img src={skill.icon} alt="" className="skill-icon" />}
              <span>{skill.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2>Education</h2>
        <div className="card-grid">
          {syncedEducation.map((edu, i) => (
            <div key={i} className="info-card">
              <h4>{edu.degree}</h4>
              <p className="info-org">{edu.school}</p>
              <p className="info-meta">
                {edu.startDate} — {edu.endDate}
              </p>
              {edu.honors && <p className="info-badge">🏅 {edu.honors}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2>Recognition</h2>
        <div className="card-grid">
          {awards.map((award, i) => (
            <div key={i} className="info-card compact">
              <h4>🏆 {award.name}</h4>
              <p className="info-org">{award.issuer}</p>
              <p className="info-meta">{award.issued}</p>
            </div>
          ))}
          {certifications.map((cert, i) => (
            <div key={i} className="info-card compact">
              <h4>📜 {cert.name}</h4>
              <p className="info-org">{cert.issuer}</p>
              <p className="info-meta">{cert.issued}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2>What I build in</h2>
        <p className="section-note">
          Most-used languages across {repos.length} public repositories.
        </p>
        <div className="lang-bars">
          {topLanguages.map(([lang, count]) => (
            <div key={lang} className="lang-row">
              <span className="lang-name">{lang}</span>
              <div className="lang-track">
                <div
                  className="lang-fill"
                  style={{ width: `${(count / topLanguages[0][1]) * 100}%` }}
                />
              </div>
              <span className="lang-count">{count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2>{ui.about.featuredPostsTitle.replace("📢 ", "")}</h2>
        <div className="card-grid">
          {ui.about.linkedinPosts.map((post, i) => (
            <LinkedInPostCard key={i} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default About;
