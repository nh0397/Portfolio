import data from "../data/portfolioData.json";
import { GitHubIcon, ExternalIcon } from "./Icons";
import "./About.css";

export default function About() {
  const { personal, education, awards, certifications, repos } = data;

  // Language mix straight from the repo list — no hand-maintained percentages.
  const languages = repos.reduce((acc, r) => {
    if (r.language) acc[r.language] = (acc[r.language] || 0) + 1;
    return acc;
  }, {});
  const ranked = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  const topLang = ranked[0]?.[1] || 1;

  const recentRepos = repos.slice(0, 4);

  return (
    <section id="about" className="section">
      <div className="wrap">
        <header className="section-head reveal">
          <p className="section-num">04 — Background</p>
          <h2 className="section-title">The rest of it</h2>
        </header>

        <div className="about-grid">
          <div className="about-main reveal">
            <p className="about-bio">{personal.summary}</p>

            <div className="about-block">
              <h3 className="block-title">Education</h3>
              {education.map((edu) => (
                <div key={edu.school} className="edu">
                  <div className="edu-top">
                    <h4>{edu.degree}</h4>
                    <span className="edu-years mono">
                      {edu.startDate} — {edu.endDate}
                    </span>
                  </div>
                  <p className="edu-school">{edu.school}</p>
                  {edu.honors && <p className="edu-honor">🏅 {edu.honors}</p>}
                  {edu.coursework?.length > 0 && (
                    <div className="edu-courses">
                      {edu.coursework.map((c) => (
                        <span key={c} className="chip">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="about-block">
              <h3 className="block-title">Recognition</h3>
              <ul className="award-list">
                {awards.map((a, i) => (
                  <li key={`${a.name}-${i}`}>
                    <span className="award-name">{a.name}</span>
                    <span className="award-org">{a.issuer}</span>
                    <span className="award-date mono">{a.issued}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="about-block">
              <h3 className="block-title">Certifications</h3>
              <ul className="award-list">
                {certifications.map((c, i) => (
                  <li key={`${c.name}-${i}`}>
                    <span className="award-name">{c.name}</span>
                    <span className="award-org">{c.issuer}</span>
                    <span className="award-date mono">{c.issued}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* GitHub panel */}
          <aside className="about-side reveal">
            <div className="gh-card">
              <div className="gh-head">
                <GitHubIcon size={26} brand />
                <div>
                  <h3>GitHub</h3>
                  <a
                    href={personal.github}
                    target="_blank"
                    rel="noreferrer"
                    className="gh-handle"
                  >
                    @nh0397 <ExternalIcon size={13} />
                  </a>
                </div>
              </div>

              <div className="gh-stat">
                <span className="gh-stat-n mono">{repos.length}</span>
                <span className="gh-stat-l">public repositories</span>
              </div>

              <div className="gh-langs">
                <h4>Language mix</h4>
                {ranked.slice(0, 5).map(([lang, count]) => (
                  <div key={lang} className="gh-lang">
                    <span className="gh-lang-name">{lang}</span>
                    <span className="gh-lang-track">
                      <span
                        className="gh-lang-fill"
                        style={{ width: `${(count / topLang) * 100}%` }}
                      />
                    </span>
                    <span className="gh-lang-n mono">{count}</span>
                  </div>
                ))}
              </div>

              <div className="gh-recent">
                <h4>Recently pushed</h4>
                <ul>
                  {recentRepos.map((r) => (
                    <li key={r.name}>
                      <a href={r.url} target="_blank" rel="noreferrer">
                        <span className="repo-name">{r.name}</span>
                        <span className="repo-date mono">{r.lastUpdated}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
