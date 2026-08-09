import data from "../data/portfolioData.json";
import { skillDomains } from "../data/content";
import {
  computeSkillEvidence,
  evidenceForTerms,
  hasTerm,
  normalise,
} from "./skillEvidence";

/**
 * Local job-description matcher.
 *
 * Deliberately deterministic and client-side: the scoring never calls an LLM,
 * so it is instant, free, reproducible, and can't hallucinate a skill Naisarg
 * doesn't have. The assistant is only asked for prose *after* the numbers are
 * settled, and is handed the computed result so it can't contradict it.
 */

// Terms that appear in job posts but aren't in the on-page skill taxonomy.
// Anything already covered there (Kubernetes and Kafka both are) must NOT be
// repeated, or one concept is counted twice and skews the score.
const EXTRA_TERMS = [
  { name: "Terraform", match: ["terraform"] },
  { name: "GraphQL", match: ["graphql"] },
  { name: "Spark", match: ["spark"] },
  { name: "Airflow", match: ["airflow"] },
  { name: "Rust", match: ["rust"] },
  { name: "Java", match: ["java"] },
  { name: "C++", match: ["c++"] },
  { name: "LLM evaluation", match: ["evaluation", "eval harness", "benchmark"] },
  { name: "Prompt engineering", match: ["prompt engineering", "prompting"] },
  { name: "Fine-tuning", match: ["fine tun*", "finetun*", "lora", "peft"] },
  { name: "MLOps", match: ["mlops", "model deployment", "model serving"] },
  { name: "Observability", match: ["observability", "monitoring", "tracing"] },
];

const YEARS_RE = /(\d+)\s*\+?\s*(?:-\s*\d+\s*)?years?/gi;

function flatSkills() {
  const evidence = computeSkillEvidence();
  const byName = new Map();

  evidence.forEach((domain) =>
    domain.skills.forEach((s) =>
      byName.set(s.name, { ...s, domain: domain.name })
    )
  );

  const taxonomy = skillDomains.flatMap((d) =>
    d.skills.map((s) => ({ ...s, domain: d.name }))
  );

  return { byName, taxonomy };
}

/** Highest years-of-experience figure mentioned in the posting. */
function requiredYears(text) {
  const hits = [...text.matchAll(YEARS_RE)].map((m) => Number(m[1]));
  const plausible = hits.filter((n) => n > 0 && n <= 20);
  return plausible.length ? Math.max(...plausible) : null;
}

/** Years of professional experience, from the earliest dated role to today. */
export function yearsOfExperience() {
  const dated = data.experience.map((r) => r.date).filter(Boolean).sort();
  if (!dated.length) return 0;
  const start = new Date(dated[0]);
  // Roles are stored by end date, so the earliest end date understates the
  // start. Subtract the span of that first role conservatively.
  return Math.max(1, new Date().getFullYear() - start.getFullYear() + 3);
}

export function analyseRole(jobText) {
  const text = normalise(jobText);
  if (text.trim().length < 40) return null;

  const { byName, taxonomy } = flatSkills();

  const mentioned = [];
  const seen = new Set();

  const consider = (name, matchTerms, domain) => {
    if (seen.has(name)) return;
    if (!matchTerms.some((t) => hasTerm(text, t))) return;
    seen.add(name);

    // Taxonomy skills already carry computed evidence; anything else has to be
    // matched against the corpus directly or it would always look like a gap.
    const record = byName.get(name);
    const evidence = record?.evidence ?? evidenceForTerms(matchTerms);

    mentioned.push({
      name,
      domain: domain || record?.domain || "Other",
      count: evidence.length,
      evidence,
    });
  };

  taxonomy.forEach((s) => consider(s.name, s.match, s.domain));
  EXTRA_TERMS.forEach((s) => consider(s.name, s.match, "Also requested"));

  // Three tiers, because "it's on my LinkedIn" is not the same claim as "I
  // shipped it". Folding them together scored ~100% on every posting, which
  // reads as marketing rather than analysis.
  const isDemonstrated = (s) =>
    s.evidence.some((e) => e.kind !== "profile");

  const demonstrated = mentioned
    .filter((s) => s.count > 0 && isDemonstrated(s))
    .sort((a, b) => b.count - a.count);

  const claimed = mentioned.filter((s) => s.count > 0 && !isDemonstrated(s));
  const gaps = mentioned.filter((s) => s.count === 0);

  // Demonstrated counts full, merely-listed counts half.
  const score = mentioned.length
    ? Math.round(
        ((demonstrated.length + claimed.length * 0.5) / mentioned.length) * 100
      )
    : 0;

  const askedYears = requiredYears(text);
  const haveYears = yearsOfExperience();

  return {
    score,
    totalRequirements: mentioned.length,
    demonstrated,
    claimed,
    gaps,
    years: askedYears
      ? { asked: askedYears, have: haveYears, meets: haveYears >= askedYears }
      : null,
  };
}

/** Compact, factual brief the assistant can turn into prose without inventing. */
export function fitPrompt(analysis, jobText) {
  const lines = [
    "A recruiter pasted this job description on my portfolio.",
    "My site already computed the match locally against my verified record.",
    "Write a short, honest reply (100-140 words) in first person as Naisarg.",
    "Use ONLY the computed result below. Do not claim any skill listed as a gap.",
    "Lead with the strongest genuine overlap, then name the gaps plainly without apologising.",
    "",
    `Computed match: ${analysis.score}% across ${analysis.totalRequirements} requirements`,
    `Demonstrated in shipped work: ${analysis.demonstrated.map((m) => `${m.name} (${m.count} places)`).join(", ") || "none"}`,
    `Listed but not demonstrated: ${analysis.claimed.map((c) => c.name).join(", ") || "none"}`,
    `Not in the record at all: ${analysis.gaps.map((g) => g.name).join(", ") || "none"}`,
  ];

  if (analysis.years) {
    lines.push(
      `Experience: posting asks ~${analysis.years.asked}y, I have ~${analysis.years.have}y`
    );
  }

  lines.push("", "Job description:", jobText.slice(0, 1400));
  return lines.join("\n");
}
