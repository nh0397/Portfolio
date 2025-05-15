import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./Experience.css";

function Experience() {
  const codeString = `/* experience.css */

.mu-sigma {
  role: "Software Engineer → Data Scientist";
  company: "Mu Sigma Innovation Labs";
  duration: "Oct 2019 – Jul 2023";
  location: "Bangalore, India";

  projects: {
    knowledge_management_platform: {
      description: "Built a React + Node.js platform for 5,000+ users",
      impact: [
        "Enabled $500K+ in new revenue",
        "Improved artifact retrieval time by 30%",
        "Reduced page load time by 40% with lazy loading",
        "Increased platform adoption via UI/UX revamp"
      ],
      stack: ["React", "Node.js", "Redis", "PostgreSQL", "GitLab CI/CD"]
    },

    simulation_optimization: {
      description: "Optimized large-scale agent-based simulations",
      impact: [
        "Reduced runtime from 36 hours → 8 hours",
        "Used Apache Flink + Kafka for distributed computing",
        "Improved decision-making accuracy via MAPE metrics"
      ],
      stack: ["Python", "Flink", "Kafka", "MongoDB"]
    },

    performance_review_system: {
      description: "Built secure, real-time 360° feedback platform",
      impact: [
        "Automated reviews for 1,200+ employees",
        "Created 50+ APIs with Node.js + PostgreSQL",
        "Integrated OAuth2 + RBAC",
        "Cut manual effort by 70%"
      ],
      stack: ["Node.js", "PostgreSQL", "OAuth2", "CI/CD"]
    },

    chatbot_integration: {
      description: "Created AI chatbot for internal knowledge access",
      impact: [
        "Integrated with PowerApps + Microsoft Teams",
        "Enabled NLP-based file retrieval mid-meeting",
        "Reduced search latency and improved consultant efficiency"
      ],
      stack: ["PowerApps", "Python", "Teams API"]
    }
  };
}

.sfsu {
  role: "Software Engineering Tutor";
  duration: "Sep 2023 – Present";
  location: "San Francisco, CA";

  contributions: [
    "Mentored 500+ students in React, Node, and Python",
    "Automated grading with Python scripts (50% time saved)",
    "Guided 20+ full-stack projects through CI/CD pipelines"
  ];
}

.sf-hacks-2025 {
  title: "Best Emerging AI Hack – SF Hacks 2025";
  project: "AI browser guardrail for GenAI tools";
  stack: ["React.js", "Python", "Gemini API", "Ollama", "Mistral"];
  notes: "Built an LLM-aware browser extension to block unsafe prompts"
}

.headstarter-fellowship {
  title: "Headstarter.AI Fellow";
  period: "May – Jun 2024";
  projects: [
    "Delivered 4 AI prototypes in 5 weeks",
    "Worked across RAG pipelines, MongoDB, and LLM prompt tuning",
    "Focused on fast iteration + production-readiness"
  ];
}
.education {
  sfsu: {
    degree: "M.S. in Data Science",
    institution: "San Francisco State University",
    gpa: "3.9",
    graduation: "May 2025"
  };

  nirma: {
    degree: "B.Tech in Computer Engineering",
    institution: "Nirma University",
    gpa: "7.37 / 10",
    graduation: "May 2019"
  };
}

`;

  return (
    <div className="experience-container">
      <SyntaxHighlighter
        language="css"
        style={vscDarkPlus}
        customStyle={{
          fontSize: "14px",
          background: "#1e1e1e",
          padding: "1.5rem",
          borderRadius: "8px",
          overflowX: "auto",
        }}
        showLineNumbers
        lineNumberStyle={{
          color: "#555",
          paddingRight: "10px",
          minWidth: "2em",
          textAlign: "right",
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}

export default Experience;
