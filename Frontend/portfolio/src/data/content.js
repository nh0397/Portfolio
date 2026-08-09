/**
 * Curated presentation layer.
 *
 * Facts (roles, dates, education, repos) live in portfolioData.json, which the
 * backend regenerates with `cd Backend && python ingest.py`. This file holds
 * only what a résumé can't carry: narrative, media and the skill taxonomy.
 */

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
export const featuredWork = [
  {
    id: "vulnerability-dashboard",
    title: "High-Performance Vulnerability Dashboard",
    tagline: "236,000 records from a 371MB file, interactive in under a second",
    year: "2026",
    problem:
      "A 371MB vulnerability export froze the browser for 90 seconds on load. The data existed but nobody could actually use it.",
    approach:
      "Moved JSON parsing off the main thread into Web Workers, virtualized the DOM with react-window, and used Zustand as an in-memory query store. Entirely client-side — no backend, no pagination API.",
    metrics: [
      { k: "< 1s", v: "to first interactive render" },
      { k: "0s", v: "main-thread blocking (was 90s)" },
      { k: "236K", v: "rows filterable live" },
    ],
    stack: ["React", "TypeScript", "Web Workers", "react-window", "Zustand"],
    github: "https://github.com/nh0397/Vulnerability-Dashboard",
    demo: null,
    media: { type: "none" },
  },
  {
    id: "multi-agent-analyst",
    title: "Multi-Agent Financial Analyst",
    tagline: "A planner–supervisor system that asks before it answers",
    year: "2026",
    problem:
      "Single-shot LLM calls answer ambiguous financial questions confidently and wrongly. There's no point in the loop where the model can say 'which quarter did you mean?'",
    approach:
      "Built a planner–supervisor architecture that detects ambiguity before any tool is invoked, then dispatches specialist agents. An LLM routing layer falls back across Mixtral 8x7B and Llama 3 70B on Groq so a degraded model never takes the system down.",
    metrics: [
      { k: "Sub-second", v: "agentic responses via Groq" },
      { k: "Pre-tool", v: "ambiguity detection" },
      { k: "2-model", v: "automatic fallback" },
    ],
    stack: ["LangGraph", "Groq", "Chainlit", "Python", "Multi-agent orchestration"],
    github: "https://github.com/nh0397/Multi-Agent-Task-Solver",
    demo: null,
    media: { type: "none" },
  },
  {
    id: "compliance-guardrail",
    title: "AI Compliance Guardrail",
    tagline: "Winner — Best Emerging AI Hack, SF Hacks 2025",
    year: "2025",
    award: "🏆 SF Hacks 2025",
    problem:
      "People paste customer data into ChatGPT without registering that it leaves the building. Blocking the tools outright just pushes usage underground.",
    approach:
      "A Chrome extension intercepts prompts in real time. A Flask router sends cheap checks to Mistral, but anything possibly sensitive is classified by a local model via Ollama — so the PII never crosses the network boundary. Shipped in a 24-hour sprint with an admin dashboard for policy and violation tracking.",
    metrics: [
      { k: "0", v: "PII egress — local classification" },
      { k: "24h", v: "concept to working demo" },
      { k: "1st", v: "place, emerging AI track" },
    ],
    stack: ["React", "Flask", "Ollama", "Mistral", "Chrome Extension", "Edge AI"],
    github: "https://github.com/nh0397/SF-Hacks",
    demo: null,
    media: { type: "gif", src: secureSenseGif, alt: "Guardrail intercepting sensitive data in a prompt" },
  },
  {
    id: "rag-assistant",
    title: "This Site's AI Assistant",
    tagline: "RAG over my own résumé, repos and LinkedIn — answering in the corner right now",
    year: "2025",
    problem:
      "A portfolio is a static artifact. Recruiters have specific questions and no fast way to ask them.",
    approach:
      "Chunked my résumé, GitHub and LinkedIn into a MongoDB Atlas vector index with Fireworks embeddings, retrieving date-sorted context so it always answers with current work. Groq handles generation. The same generated dataset renders this page, so the assistant and the site can never contradict each other.",
    metrics: [
      { k: "1 source", v: "for site + assistant" },
      { k: "Date-ranked", v: "retrieval, newest first" },
      { k: "Voice", v: "hands-free Q&A + navigation" },
    ],
    stack: ["MongoDB Atlas", "Fireworks", "Groq", "Flask", "React", "Web Speech API"],
    github: "https://github.com/nh0397/Portfolio",
    demo: null,
    media: { type: "youtube", id: "ZTqdEmM5NJg", alt: "RAG assistant walkthrough" },
  },
  {
    id: "flaregraph",
    title: "FlareGraph",
    tagline: "Five years of San Francisco fire incidents, mapped",
    year: "2024",
    problem:
      "SF Fire Department incident reports are public but effectively unreadable for planning — thousands of rows with no spatial view.",
    approach:
      "A Dash + Plotly application that geospatially clusters five years of incidents and surfaces hotspots against response times.",
    metrics: [
      { k: "5 yrs", v: "of incident data" },
      { k: "Geospatial", v: "hotspot clustering" },
    ],
    stack: ["Dash", "Plotly", "Python", "Geospatial clustering"],
    github: "https://github.com/nh0397/Data-Viz-SFFD",
    demo: null,
    media: { type: "youtube", id: "f08CN-qMKCI", alt: "FlareGraph interactive map" },
  },
];

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
      { name: "RAG pipelines", match: ["rag", "retrieval-augmented", "retrieval"] },
      { name: "Local LLMs (Ollama)", match: ["ollama", "local llm", "mistral"] },
      { name: "Vector search", match: ["vector", "pinecone", "embedding", "faiss"] },
      { name: "PyTorch", match: ["pytorch"] },
      { name: "NLP", match: ["nlp", "sentiment", "natural language"] },
      { name: "Predictive modeling", match: ["regression", "churn", "predictive", "classif"] },
    ],
  },
  {
    id: "backend",
    name: "Backend & Systems",
    blurb: "APIs and data paths that hold up when traffic and datasets grow.",
    skills: [
      { name: "Python", match: ["python", "flask", "fastapi"] },
      { name: "Go / Gin", match: ["go/gin", "go ", "gin"] },
      { name: "Node.js", match: ["node.js", "node"] },
      { name: "FastAPI", match: ["fastapi"] },
      { name: "Flask", match: ["flask"] },
      { name: "REST / WebSockets", match: ["rest", "websocket", "api"] },
      { name: "Distributed systems", match: ["kafka", "flink", "distributed", "simulation"] },
      { name: "Performance tuning", match: ["latency", "optimiz", "performance", "cache", "index"] },
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
      { name: "Web Workers", match: ["web worker", "worker"] },
      { name: "Accessibility", match: ["accessib", "wcag", "aria"] },
    ],
  },
  {
    id: "data",
    name: "Data & Infrastructure",
    blurb: "Storage, pipelines and the CI that keeps them honest.",
    skills: [
      { name: "PostgreSQL", match: ["postgres", "postgresql", "sql"] },
      { name: "MongoDB", match: ["mongo", "mongodb"] },
      { name: "Redis", match: ["redis", "cach"] },
      { name: "Kafka", match: ["kafka"] },
      { name: "AWS", match: ["aws", "ec2"] },
      { name: "Docker / Kubernetes", match: ["docker", "kubernetes", "k8s"] },
      { name: "CI/CD", match: ["ci/cd", "gitlab", "github actions", "pipeline"] },
      { name: "Testing (Cypress / Jest)", match: ["cypress", "jest", "test"] },
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
