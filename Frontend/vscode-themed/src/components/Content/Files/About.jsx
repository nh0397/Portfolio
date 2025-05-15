import React, { useState } from "react";
import "./About.css";

const skills = {
  Languages: [
    { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
    { name: "SQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: "R", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/r/r-original.svg" },
    { name: "Bash", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg" }
  ],
  "Data Science & ML": [
    { name: "NLP", icon: null },
    { name: "LLMs", icon: null },
    { name: "Predictive Modeling", icon: null },
    { name: "Supervised Learning", icon: null },
    { name: "Unsupervised Learning", icon: null },
    { name: "Deep Learning", icon: null },
    { name: "Time Series", icon: null },
    { name: "Statistical Analysis", icon: null },
    { name: "Feature Engineering", icon: null },
    { name: "EDA", icon: null }
  ],
  Visualization: [
    { name: "Plotly", icon: null },
    { name: "Dash", icon: null },
    { name: "Seaborn", icon: null },
    { name: "Matplotlib", icon: null },
    { name: "Tableau", icon: null },
    { name: "D3.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/d3js/d3js-original.svg" },
    { name: "Chart.js", icon: null }
  ],
  "Web Development": [
    { name: "React.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "React Native", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "Angular", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg" },
    { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    { name: "Flask", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" },
    { name: "Django", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg" },
    { name: "HTML5", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
    { name: "CSS3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
    { name: "Tailwind CSS", icon: null }
  ],
  "Testing & Quality": [
    { name: "Cypress", icon: null },
    { name: "Jest", icon: null },
    { name: "Selenium", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/selenium/selenium-original.svg" },
    { name: "Accessibility (WCAG)", icon: null }
  ],
  Databases: [
    { name: "PostgreSQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
    { name: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: "MongoDB", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
    { name: "Redis", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
    { name: "Firebase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
    { name: "Pinecone", icon: null },
    { name: "Microsoft SQL Server", icon: null }
  ],
  "Cloud & DevOps": [
    { name: "AWS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg" },
    { name: "Google Vertex AI", icon: null },
    { name: "Docker", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
    { name: "Kubernetes", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
    { name: "CI/CD", icon: null },
    { name: "GitHub Actions", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
    { name: "GitLab Pipelines", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg" }
  ],
  "Security & Architecture": [
    { name: "JWT", icon: null },
    { name: "OAuth2", icon: null },
    { name: "RBAC", icon: null },
    { name: "REST APIs", icon: null },
    { name: "Microservices", icon: null },
    { name: "Caching", icon: null },
    { name: "Kafka", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachekafka/apachekafka-original.svg" },
    { name: "RabbitMQ", icon: null },
    { name: "Load Balancing", icon: null }
  ],
  "Infra & AI Systems": [
    { name: "Gemini API", icon: null },
    { name: "RAG pipelines", icon: null },
    { name: "AKKA", icon: null },
    { name: "Apache Flink", icon: null },
    { name: "Apache Airflow", icon: null },
    { name: "ROS (learning)", icon: null },
    { name: "QNX (learning)", icon: null }
  ]
};

const categories = ["All", ...Object.keys(skills)];

function About() {
  const [activeCategory, setActiveCategory] = useState("All");

  const getFilteredSkills = () => {
    if (activeCategory === "All") {
      return Object.entries(skills).flatMap(([_, list]) => list);
    }
    return skills[activeCategory] || [];
  };

  return (
    <div className="about-container">
      <div className="about-intro">
        <h2>👋 About Me</h2>
        <p>
          I'm Naisarg — an AI Engineer building intelligent systems that turn data into real-world solutions.
        </p>
        <p>
          With a strong foundation in full-stack engineering, machine learning, and scalable infrastructure, I bring ideas to life with clarity and impact.
        </p>
      </div>

      <div className="skills-section">
        <h3>🧰 Skills</h3>
        <div className="skill-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`skill-tab ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="skill-grid">
          {getFilteredSkills().map((skill) => (
            <div key={skill.name} className="skill-badge">
              {skill.icon && (
                <img src={skill.icon} alt={skill.name} className="skill-icon" />
              )}
              <span>{skill.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="linkedin-section">
        <h3>📢 Featured Posts</h3>
        <div className="linkedin-posts">
          <iframe
            src="https://www.linkedin.com/embed/feed/update/urn:li:activity:7324986252401741825"
            height="400"
            width="100%"
            frameBorder="0"
            title="Post 1"
          />
          <iframe
            src="https://www.linkedin.com/embed/feed/update/urn:li:activity:7314908175084789763"
            height="400"
            width="100%"
            frameBorder="0"
            title="Post 2"
          />
          <iframe
            src="https://www.linkedin.com/embed/feed/update/urn:li:activity:7263450357144403969"
            height="400"
            width="100%"
            frameBorder="0"
            title="Post 3"
          />
        </div>
      </div>
    </div>
  );
}

export default About;
