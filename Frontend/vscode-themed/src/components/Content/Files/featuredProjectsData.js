export const featuredProjects = [
  {
    title: "Secure Sense",
    subtitle: "GenAI-Aware Data Loss Prevention Tool",
    problem: "Accidental sensitive data sharing via ChatGPT/Gemini was becoming risky in workplaces.",
    solution: "Built a real-time DLP browser tool with LLM integration to mask/block sensitive content using org-defined rules.",
    impact: [
      "Intercepts risky data before it leaves",
      "Generalized to work across the browser (not just chat)",
    ],
    future: "Deploying admin dashboard & policy manager for IT teams.",
    tech: ["React", "Flask", "Ollama", "Python", "JavaScript", "Edge-AI", "Native LLM"],
    link: null,
    github: "https://github.com/nh0397/SF-Hacks",
    media: {
      type: "gif",
      url: null,
      alt: "Secure Sense DLP Tool Demo"
    }
  },
  {
    title: "RAG Chatbot Buddy",
    subtitle: "Personalized Chatbot Trained on Your Profile",
    problem: "LLMs don't know *you* — resumes, repos, LinkedIn aren't part of their context.",
    solution: "Vectorized resume + GitHub + LinkedIn to create a RAG-powered chatbot that answers as 'you'.",
    impact: [
      "Helped with résumé gap detection",
      "Used by recruiters to explore candidate relevance",
    ],
    future: "Add 'explain my repo' and 'interview prep mode'.",
    tech: ["LangChain", "Pinecone", "Gemini API", "MongoDB", "React", "Node"],
    link: null,
    github: null,
    backend: {
      title: "Personal Data Extractor",
      description: "Python agent that extracts and processes personal data from resumes, GitHub, and LinkedIn to populate the RAG database.",
      github: "https://github.com/nh0397/personal-data-extractor"
    },
    media: {
      type: "youtube",
      url: "ZTqdEmM5NJg", // YouTube video ID from https://youtu.be/ZTqdEmM5NJg
      alt: "RAG Chatbot Demo"
    }
  },
  {
    title: "FlareGraph",
    subtitle: "Fire Incident Visualizer for SF",
    problem: "Fire reports were not easily interpretable for planning.",
    solution: "Built a Dash + Plotly app to map 5 years of SF fire data and visualize hotspots.",
    impact: ["Used for resource allocation testing by emergency teams"],
    future: "Add predictive overlays for seasonal risks.",
    tech: ["Dash", "Plotly", "Python", "Geospatial Clustering"],
    link: "https://github.com/nh0397/Data-Viz-SFFD",
    github: "https://github.com/nh0397/Data-Viz-SFFD",
    media: {
      type: "youtube",
      url: "f08CN-qMKCI", // YouTube video ID from https://www.youtube.com/watch?v=f08CN-qMKCI
      alt: "FlareGraph Interactive Map"
    }
  },
  {
    title: "StockBot AI",
    subtitle: "Inventory Anomaly Detection Engine",
    problem: "Inventory fluctuations were unpredictable and lacked early alerts.",
    solution: "Trained a Vertex AI model on real-time pipeline data to classify and detect anomalies.",
    impact: [
      "Detected 25% more stock issues vs baseline",
      "Enabled clean reporting for business units",
    ],
    future: "Adding multivariate forecasting with confidence bands.",
    tech: ["Vertex AI", "MongoDB", "Python", "FastAPI", "CI/CD"],
    link: "https://github.com/nh0397/StockBot-AI",
    github: "https://github.com/nh0397/StockBot-AI",
    media: {
      type: "youtube",
      url: "wc1KEIz7oRg", // YouTube video ID from https://www.youtube.com/watch?v=wc1KEIz7oRg
      alt: "StockBot AI Dashboard"
    }
  },
  {
    title: "EduBridge",
    subtitle: "Emotion-Aware Learning Management System",
    problem: "Instructors had no way to detect disengaged students in real time.",
    solution: "Built a custom LMS with instructor dashboards and emotion cues to flag struggling learners.",
    impact: [
      "Improved early intervention rates by surfacing silent students",
      "Fully tested, deployed with CI/CD on AWS",
    ],
    future: "Integrating real-time feedback prompts into lecture modules.",
    tech: ["React.js", "Node.js", "AWS", "MySQL", "Directus CMS", "Jest", "GitHub Actions"],
    link: "https://github.com/nh0397/EduBridge",
    github: "https://github.com/nh0397/EduBridge",
    media: {
      type: "image",
      url: null,
      alt: "EduBridge LMS Dashboard"
    }
  },
]; 