// ========================================
// PORTFOLIO CONFIGURATION FILE
// ========================================
// This is the main configuration file for your VSCode-themed portfolio.
// Update this file to customize your portfolio with your own information.

export const portfolioConfig = {
  // ========================================
  // PERSONAL INFORMATION
  // ========================================
  personal: {
    name: "NAISARG HALVADIYA",
    title: "AI Engineer | Software + Data",
    bio: "Transforming Insights into Impact: A Data-Savvy Solution Engineer that loves solving real-world problems using AI",
    brief: "As a software engineer adept at harnessing data, I specialize in transforming intricate data insights into impactful, real-world solutions. My expertise spans full-stack development and data science, allowing me to innovate and drive forward-thinking projects. With a proven track record in leveraging data to enhance user experiences and streamline processes, I am dedicated to pushing the boundaries of technology to solve real-world problems efficiently and effectively.",
    photo: "../assets/images/Photo.jpeg",
    location: "San Francisco, CA",
    email: "naisarg.halvadiya@gmail.com",
    linkedin: "https://linkedin.com/in/naisarg-h",
    github: "https://github.com/nh0397",
    portfolio: "https://naisarg.dev"
  },

  // ========================================
  // SKILLS & TECHNOLOGIES
  // ========================================
  skills: {
    frontend: [
      { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
      { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
      { name: "Angular", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg" },
      { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
      { name: "HTML", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
      { name: "CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" }
    ],
    backend: [
      { name: "Node", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
      { name: "PHP", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
      { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
      { name: "Flask", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" },
      { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
      { name: "Ruby", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg" }
    ],
    devops: [
      { name: "Docker", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
      { name: "AWS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
      { name: "CI/CD", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg" },
      { name: "Kubernetes", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
      { name: "Terraform", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg" }
    ],
    database: [
      { name: "SQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original-wordmark.svg" },
      { name: "MongoDB", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
      { name: "Redis", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
      { name: "PostgreSQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
      { name: "SQLite", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg" }
    ],
    tools: [
      { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
      { name: "Postman", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg" },
      { name: "NPM", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg" },
      { name: "Yarn", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/yarn/yarn-original.svg" },
      { name: "Webpack", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webpack/webpack-original.svg" }
    ]
  },

  // ========================================
  // FEATURED PROJECTS
  // ========================================
  featuredProjects: [
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
        url: "ZTqdEmM5NJg",
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
        url: "f08CN-qMKCI",
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
        url: "wc1KEIz7oRg",
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
    }
  ],

  // ========================================
  // WORK EXPERIENCE
  // ========================================
  experience: [
    {
      type: "work",
      company: "Mu Sigma - Innovation & Development Labs",
      logo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Mu_Sigma_Logo.jpg",
      role: "Software Engineer → Data Scientist",
      duration: "Oct 2019 – Jul 2023",
      location: "Bangalore, India",
      description: "Led full-stack development and data science initiatives across multiple high-impact projects.",
      projects: [
        {
          title: "Knowledge Management Platform",
          description: "Built a React + Node.js platform for 5,000+ users",
          impact: [
            "Enabled $500K+ in new revenue",
            "Improved artifact retrieval time by 30%",
            "Reduced page load time by 40% with lazy loading",
            "Increased platform adoption via UI/UX revamp"
          ],
          stack: ["React", "Node.js", "Redis", "PostgreSQL", "GitLab CI/CD"]
        },
        {
          title: "Simulation Optimization",
          description: "Optimized large-scale agent-based simulations",
          impact: [
            "Reduced runtime from 36 hours → 8 hours",
            "Used Apache Flink + Kafka for distributed computing",
            "Improved decision-making accuracy via MAPE metrics"
          ],
          stack: ["Python", "Flink", "Kafka", "MongoDB"]
        },
        {
          title: "Performance Review System",
          description: "Built secure, real-time 360° feedback platform",
          impact: [
            "Automated reviews for 1,200+ employees",
            "Created 50+ APIs with Node.js + PostgreSQL",
            "Integrated OAuth2 + RBAC",
            "Cut manual effort by 70%"
          ],
          stack: ["Node.js", "PostgreSQL", "OAuth2", "CI/CD"]
        },
        {
          title: "Chatbot Integration",
          description: "Created AI chatbot for internal knowledge access",
          impact: [
            "Integrated with PowerApps + Microsoft Teams",
            "Enabled NLP-based file retrieval mid-meeting",
            "Reduced search latency and improved consultant efficiency"
          ],
          stack: ["PowerApps", "Python", "Teams API"]
        }
      ]
    },
    {
      type: "education",
      company: "San Francisco State University",
      logo: "https://upload.wikimedia.org/wikipedia/en/1/15/San_Francisco_State_University_seal.svg",
      role: "Software Engineering Tutor",
      duration: "Sep 2023 – Present",
      location: "San Francisco, CA",
      description: "Mentoring students in modern software development practices and technologies.",
      contributions: [
        "Mentored 500+ students in React, Node, and Python",
        "Automated grading with Python scripts (50% time saved)",
        "Guided 20+ full-stack projects through CI/CD pipelines"
      ]
    }
  ],

  // ========================================
  // ACHIEVEMENTS & AWARDS
  // ========================================
  achievements: [
    {
      title: "Best Emerging AI Hack – SF Hacks 2025",
      project: "AI browser guardrail for GenAI tools",
      stack: ["React.js", "Python", "Gemini API", "Ollama", "Mistral"],
      description: "Built an LLM-aware browser extension to block unsafe prompts"
    },
    {
      title: "Headstarter.AI Fellow",
      period: "May – Jun 2024",
      projects: [
        "Delivered 4 AI prototypes in 5 weeks",
        "Worked across RAG pipelines, MongoDB, and LLM prompt tuning",
        "Focused on fast iteration + production-readiness"
      ]
    }
  ],

  // ========================================
  // EDUCATION
  // ========================================
  education: [
    {
      degree: "M.S. in Data Science",
      institution: "San Francisco State University",
      logo: "https://upload.wikimedia.org/wikipedia/en/1/15/San_Francisco_State_University_seal.svg",
      gpa: "3.9",
      graduation: "August 2025"
    },
    {
      degree: "B.Tech in Computer Engineering",
      institution: "Nirma University",
      logo: "https://upload.wikimedia.org/wikipedia/en/8/83/Nirma_University_Logo.png",
      gpa: "7.37 / 10",
      graduation: "May 2019"
    }
  ],

  // ========================================
  // ADDITIONAL PROJECTS (for GitHub API)
  // ========================================
  additionalProjects: [
    {
      title: "LegalGPT",
      description: "A platform that uses a context-specific LLM to analyze historic criminal case documents and provide recommendations.",
      technologies: ["React.js", "Node.js", "AWS"],
      link: "https://github.com/nh0397/Legal-GPT"
    },
    {
      title: "Naive Bayesian Classifier",
      description: "Implemented a Naive Bayesian classifier from scratch for learning purposes.",
      technologies: ["Python"],
      link: "https://github.com/nh0397/naiveBayesianClassifier"
    },
    {
      title: "Flight Fare Prediction",
      description: "A machine learning model to predict flight fares based on historical data.",
      technologies: ["Python"],
      link: "https://github.com/nh0397/Flight-Fare-Prediction"
    },
    {
      title: "Discussion forum",
      description: "Contributed to a project focusing on advanced data analysis techniques.",
      technologies: ["R", "SQL"],
      link: "https://github.com/nh0397/Discussion-Forum"
    }
  ],

  // ========================================
  // THEME & STYLING
  // ========================================
  theme: {
    primaryColor: "#ffea00",
    secondaryColor: "#9f7aea",
    accentColor: "#ff6b6b",
    backgroundColor: "#1e1e1e",
    cardBackground: "#2a2a2a",
    textColor: "#ccc",
    fontFamily: "Courier New, monospace"
  },

  // ========================================
  // SOCIAL LINKS & CONTACT
  // ========================================
  social: {
    linkedin: "https://linkedin.com/in/naisarg-h",
    github: "https://github.com/nh0397",
    email: "naisarg.halvadiya@gmail.com",
    portfolio: "https://naisarg.dev"
  },

  // ========================================
  // GITHUB CONFIGURATION
  // ========================================
  github: {
    username: "nh0397",
    apiUrl: "https://api.github.com/users/nh0397/repos"
  }
};

// Export individual sections for easier imports
export const { personal, skills, featuredProjects, experience, achievements, education, additionalProjects, theme, social, github } = portfolioConfig; 