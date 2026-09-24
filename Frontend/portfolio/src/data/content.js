/**
 * Curated presentation layer.
 *
 * Facts (roles, dates, education, repos) live in portfolioData.json, which the
 * sync job regenerates with `python Scripts/sync_portfolio.py`.
 * Featured work comes from the same JSON. Proof points and skill taxonomy
 * remain curated presentation settings below.
 */

import data from "./portfolioData.json";
import secureSenseGif from "../assets/secure-sense.gif";

/** Headline numbers. Each one traces to a specific role or project. */
export const proofPoints = [
  {
    value: "$1M",
    unit: "ARR",
    label: "Contract renewal unblocked",
    detail: "Diagnosed event-loop blocking and pool exhaustion in a Node.js SaaS serving 5,000+ daily enterprise users; cut retrieval latency 30%.",
  },
  {
    value: "90",
    unit: "%",
    label: "Fewer production defects",
    detail: "Built a GitLab CI/CD pipeline with 70+ automated Cypress integration tests and quality gates across a 10-engineer team.",
  },
  {
    value: "236K",
    unit: "rows",
    label: "Rendered in under a second",
    detail: "Replaced a 90-second browser freeze on a 371MB dataset with Web Workers, DOM virtualization and an in-memory query store.",
  },
  {
    value: "36→8",
    unit: "hrs",
    label: "Simulation runtime",
    detail: "Restructured state handling and Kafka message flow for 100K+ agent simulations on Apache Flink.",
  },
];

/**
 * Flagship work. `metrics` are the outcomes; `stack` feeds skill evidence.
 * media.type: "gif" | "youtube" | "none"
 */
export const featuredWork = (data.featuredWork || []).map((project) => ({
  ...project,
  media: project.media?.src === "secure-sense"
    ? { ...project.media, src: secureSenseGif }
    : project.media,
}));

/**
 * Skill taxonomy. `match` terms are lowercase substrings checked against role
 * highlights, project stacks and repo metadata to compute real usage evidence —
 * so the strength bars reflect the record rather than self-assessment.
 */
export const skillDomains = [
  {
    id: "ai",
    name: "AI & Machine Learning",
    blurb: "Agentic systems, retrieval and evaluation — in production, not notebooks.",
    skills: [
      { name: "LangGraph / LangChain", match: ["langgraph", "langchain"] },
      { name: "Multi-agent orchestration", match: ["multi-agent", "agentic", "supervisor"] },
      { name: "RAG pipelines", match: ["rag", "retrieval augmented", "retrieval"] },
      { name: "Local LLMs (Ollama)", match: ["ollama", "local llm", "mistral"] },
      { name: "Vector search", match: ["vector", "pinecone", "embedding*", "faiss"] },
      { name: "PyTorch", match: ["pytorch"] },
      { name: "NLP", match: ["nlp", "sentiment", "natural language"] },
      { name: "Predictive modeling", match: ["regression", "churn", "predictive", "classif*"] },
    ],
  },
  {
    id: "backend",
    name: "Backend & Systems",
    blurb: "APIs and data paths that hold up when traffic and datasets grow.",
    skills: [
      { name: "Python", match: ["python", "flask", "fastapi"] },
      { name: "Go / Gin", match: ["go", "gin", "golang"] },
      { name: "Node.js", match: ["node.js", "node"] },
      { name: "FastAPI", match: ["fastapi"] },
      { name: "Flask", match: ["flask"] },
      { name: "REST / WebSockets", match: ["rest", "websocket", "api"] },
      { name: "Distributed systems", match: ["kafka", "flink", "distributed", "simulation"] },
      { name: "Performance tuning", match: ["latency", "optimiz*", "performance", "cach*", "index*"] },
    ],
  },
  {
    id: "frontend",
    name: "Frontend",
    blurb: "Interfaces that stay responsive under real data volume.",
    skills: [
      { name: "React", match: ["react"] },
      { name: "TypeScript", match: ["typescript"] },
      { name: "Next.js", match: ["next.js", "nextjs"] },
      { name: "Vue 3", match: ["vue"] },
      { name: "Angular", match: ["angular"] },
      { name: "Web Workers", match: ["web worker*", "worker*"] },
      { name: "Accessibility", match: ["accessib*", "wcag", "aria"] },
    ],
  },
  {
    id: "data",
    name: "Data & Infrastructure",
    blurb: "Storage, pipelines and the CI that keeps them honest.",
    skills: [
      { name: "PostgreSQL", match: ["postgres", "postgresql", "sql"] },
      { name: "MongoDB", match: ["mongo", "mongodb"] },
      { name: "Redis", match: ["redis", "cach*"] },
      { name: "Kafka", match: ["kafka"] },
      { name: "AWS", match: ["aws", "ec2"] },
      { name: "Docker / Kubernetes", match: ["docker", "kubernetes", "k8s"] },
      { name: "CI/CD", match: ["ci cd", "gitlab", "github actions", "pipeline*"] },
      { name: "Testing (Cypress / Jest)", match: ["cypress", "jest", "test*"] },
    ],
  },
];

/** Where the assistant can jump. Ids match the section elements. */
export const sections = [
  { id: "top", label: "Top" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];
