import React, { useState } from "react";
import "./About.css";
import { skills, ui } from "../../../config/portfolioConfig";

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
        <h2>{ui.about.title}</h2>
        {ui.about.intro.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </div>

      <div className="skills-section">
        <h3>{ui.about.skillsTitle}</h3>
        <div className="skill-filters" role="tablist" aria-label="Skill categories">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
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
        <h3>{ui.about.featuredPostsTitle}</h3>
        <div className="linkedin-posts">
          {ui.about.linkedinPosts.map((postUrl, index) => (
            <iframe
              key={index}
              src={postUrl}
              height="400"
              width="100%"
              frameBorder="0"
              title={`LinkedIn post ${index + 1}`}
              aria-label={`LinkedIn post ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;
