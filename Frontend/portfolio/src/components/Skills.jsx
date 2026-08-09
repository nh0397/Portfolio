import { useMemo, useState } from "react";
import { computeSkillEvidence, totalEvidence } from "../lib/skillEvidence";
import "./Skills.css";

const KIND_LABEL = {
  role: "Role",
  project: "Project",
  repo: "Repo",
  profile: "Listed",
};

export default function Skills() {
  const domains = useMemo(() => computeSkillEvidence(), []);
  const [domainId, setDomainId] = useState(domains[0].id);

  const domain = domains.find((d) => d.id === domainId);
  const [selectedName, setSelectedName] = useState(domains[0].skills[0].name);

  // Selecting a domain may leave the previous skill out of scope.
  const selected =
    domain.skills.find((s) => s.name === selectedName) || domain.skills[0];

  const pickDomain = (id) => {
    setDomainId(id);
    const next = domains.find((d) => d.id === id);
    setSelectedName(next.skills[0].name);
  };

  return (
    <section id="skills" className="section">
      <div className="wrap">
        <header className="section-head reveal">
          <p className="section-num">03 — Capability</p>
          <h2 className="section-title">Skills, with the receipts attached</h2>
          <p className="section-sub">
            Anyone can list technologies. These bars are computed — each one
            counts the roles, projects and repositories in my actual record that
            use that skill. Pick any one to see exactly where.
          </p>
        </header>

        <div className="skills-grid reveal">
          {/* Domain selector */}
          <nav className="domain-rail" aria-label="Skill domains">
            {domains.map((d) => (
              <button
                key={d.id}
                className={`domain-btn ${d.id === domainId ? "active" : ""}`}
                onClick={() => pickDomain(d.id)}
                aria-pressed={d.id === domainId}
              >
                <span className="domain-name">{d.name}</span>
                <span className="domain-count mono">{d.skills.length}</span>
              </button>
            ))}

            <p className="rail-note">
              Computed across <strong className="mono">{totalEvidence}</strong>{" "}
              roles, projects &amp; repos.
            </p>
          </nav>

          {/* Skill bars */}
          <div className="skill-panel">
            <p className="panel-blurb">{domain.blurb}</p>

            <ul className="skill-bars">
              {domain.skills.map((skill) => {
                const active = skill.name === selected.name;

                return (
                  <li key={skill.name}>
                    <button
                      className={`skill-row ${active ? "active" : ""} ${skill.count ? "" : "empty"}`}
                      onClick={() => setSelectedName(skill.name)}
                      aria-pressed={active}
                    >
                      <span className="skill-name">{skill.name}</span>

                      <span className="skill-track">
                        <span
                          className="skill-fill"
                          style={{ width: `${skill.strength}%` }}
                        />
                      </span>

                      <span className="skill-count mono">
                        {skill.count || "—"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Evidence for the selected skill */}
          <aside className="evidence" aria-live="polite">
            <div className="evidence-head">
              <h3>{selected.name}</h3>
              <p>
                {selected.count
                  ? `Appears in ${selected.count} ${selected.count === 1 ? "place" : "places"}`
                  : "No direct evidence in the indexed record"}
              </p>
            </div>

            <div className="evidence-tally">
              <div>
                <span className="tally-n mono">{selected.roles.length}</span>
                <span className="tally-l">roles</span>
              </div>
              <div>
                <span className="tally-n mono">{selected.projects.length}</span>
                <span className="tally-l">projects</span>
              </div>
              <div>
                <span className="tally-n mono">{selected.repos.length}</span>
                <span className="tally-l">repos</span>
              </div>
            </div>

            <ul className="evidence-list">
              {selected.evidence.slice(0, 9).map((e, i) => (
                <li key={`${e.kind}-${e.label}-${i}`}>
                  <span className={`ev-kind ev-${e.kind}`}>
                    {KIND_LABEL[e.kind]}
                  </span>
                  <span className="ev-label">{e.label}</span>
                  {e.period && <span className="ev-period mono">{e.period}</span>}
                </li>
              ))}

              {selected.evidence.length > 9 && (
                <li className="ev-more">
                  + {selected.evidence.length - 9} more
                </li>
              )}

              {!selected.evidence.length && (
                <li className="ev-empty">
                  Listed for completeness — the indexed résumé, projects and
                  repos don&apos;t mention it directly.
                </li>
              )}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
