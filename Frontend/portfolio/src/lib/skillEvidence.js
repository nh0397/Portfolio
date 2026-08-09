import data from "../data/portfolioData.json";
import { featuredWork, proofPoints, skillDomains } from "../data/content";

/**
 * Normalise text so terms can be matched on word boundaries.
 *
 * Naive substring matching produced false positives that quietly inflated
 * everything — "gin" matched "En-gin-eer", so Go/Gin appeared to be evidenced
 * by every role with "Engineer" in the title. Punctuation becomes whitespace
 * and the result is space-padded, so a term only matches a whole token.
 * `+ # .` survive so c++, c# and node.js stay intact.
 */
export function normalise(text) {
  return ` ${String(text || "")
    .toLowerCase()
    // A dot only stays when it joins two characters, as in node.js — otherwise
    // a sentence-ending period welds itself to the token and "kubernetes."
    // stops matching "kubernetes".
    .replace(/\.(?![a-z0-9])/g, " ")
    .replace(/[^a-z0-9+#.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

/**
 * True when `term` appears as a whole token run in `haystack`.
 *
 * A trailing `*` makes it a prefix match, so "optimiz*" still catches
 * optimize / optimized / optimization without "rag" matching "sto-rag-e".
 */
export function hasTerm(haystack, term) {
  const raw = String(term || "").trim();
  const isPrefix = raw.endsWith("*");
  const needle = normalise(isPrefix ? raw.slice(0, -1) : raw).trim();

  if (!needle) return false;
  return isPrefix
    ? haystack.includes(` ${needle}`)
    : haystack.includes(` ${needle} `);
}

/**
 * Build the searchable corpus once: every role, project and repo reduced to a
 * label plus the lowercased text we scan for skill mentions.
 */
function buildCorpus() {
  const entries = [];

  data.experience.forEach((role) => {
    entries.push({
      kind: "role",
      label: `${role.title} · ${role.company}`,
      period: `${role.startDate} — ${role.endDate}`,
      text: normalise(
        [role.title, role.company, ...role.technologies, ...role.highlights].join(" ")
      ),
    });
  });

  featuredWork.forEach((project) => {
    entries.push({
      kind: "project",
      label: project.title,
      period: project.year,
      text: normalise(
        [
          project.title,
          project.tagline,
          project.problem,
          project.approach,
          ...project.metrics.map((m) => `${m.k} ${m.v}`),
          ...project.stack,
        ].join(" ")
      ),
    });
  });

  // The headline metrics name concrete work (Kafka message flow on Flink, for
  // one) that the résumé bullets summarise away. They're displayed on the page
  // as claims about real projects, so they belong in the evidence corpus.
  proofPoints.forEach((point) => {
    entries.push({
      kind: "role",
      label: point.label,
      period: "",
      text: normalise(`${point.label} ${point.detail}`),
    });
  });

  data.repos.forEach((repo) => {
    entries.push({
      kind: "repo",
      label: repo.name,
      period: (repo.lastUpdated || "").slice(0, 4),
      text: normalise(
        [repo.name, repo.description, repo.language, ...(repo.topics || [])].join(" ")
      ),
    });
  });

  // Stated-but-not-narrated skills. Kept as their own `profile` kind rather
  // than folded into roles: they're weaker evidence than a shipped project, and
  // the UI labels them so, but leaving them out entirely reported false gaps
  // (the résumé summary names LLM evaluation; LinkedIn lists prompt
  // engineering).
  if (data.personal?.summary) {
    entries.push({
      kind: "profile",
      label: "Résumé summary",
      period: "",
      text: normalise(data.personal.summary),
    });
  }

  const declared = [
    ...Object.values(data.skills || {}).flat(),
    ...(data.allSkills || []),
  ];
  if (declared.length) {
    entries.push({
      kind: "profile",
      label: "Listed skills (résumé + LinkedIn)",
      period: "",
      text: normalise(declared.join(" ")),
    });
  }

  return entries;
}

const CORPUS = buildCorpus();

/**
 * For each skill, find everywhere it actually shows up. Strength is the share
 * of evidence relative to the most-evidenced skill on the page, floored at 12%
 * so a real-but-rare skill still reads as present rather than absent.
 */
export function computeSkillEvidence() {
  const domains = skillDomains.map((domain) => ({
    ...domain,
    skills: domain.skills.map((skill) => {
      const hits = CORPUS.filter((entry) =>
        skill.match.some((term) => hasTerm(entry.text, term))
      );

      // Shipped work sorts above self-reported listings.
      const rank = { role: 0, project: 1, repo: 2, profile: 3 };

      return {
        name: skill.name,
        count: hits.length,
        roles: hits.filter((h) => h.kind === "role"),
        projects: hits.filter((h) => h.kind === "project"),
        repos: hits.filter((h) => h.kind === "repo"),
        evidence: [...hits].sort((a, b) => rank[a.kind] - rank[b.kind]),
      };
    }),
  }));

  const peak = Math.max(
    1,
    ...domains.flatMap((d) => d.skills.map((s) => s.count))
  );

  domains.forEach((domain) => {
    domain.skills.forEach((skill) => {
      skill.strength = skill.count
        ? Math.max(12, Math.round((skill.count / peak) * 100))
        : 0;
    });
    domain.skills.sort((a, b) => b.count - a.count);
    domain.total = domain.skills.reduce((sum, s) => sum + s.count, 0);
  });

  return domains;
}

export const totalEvidence = CORPUS.length;

/**
 * Evidence for an arbitrary set of match terms.
 *
 * Needed by the role matcher, which asks about terms that aren't in the on-page
 * skill taxonomy (Terraform, fine-tuning, …). Looking those up in the taxonomy
 * map would miss every time and report them as gaps no matter what the record
 * says, so they have to hit the corpus directly.
 */
export function evidenceForTerms(terms) {
  const rank = { role: 0, project: 1, repo: 2, profile: 3 };
  const hits = CORPUS.filter((entry) =>
    terms.some((t) => hasTerm(entry.text, t))
  );
  return [...hits].sort((a, b) => rank[a.kind] - rank[b.kind]);
}
