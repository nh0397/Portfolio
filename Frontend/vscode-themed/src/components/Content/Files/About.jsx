import React, { useState } from "react";
import "./About.css";
import { skills, ui } from "../../../config/portfolioConfig";

const categories = ["All", ...Object.keys(skills)];

// Simple, reliable LinkedIn post card - no iframes, no embeds, never fails
function LinkedInPostCard({ post, index }) {
  return (
    <article className="linkedin-post-card">
      <div className="linkedin-post-header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3v9zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.75 1.75 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.5-.03-3.45-2.1-3.45-2.1 0-2.42 1.64-2.42 3.34V19H6.5v-9h2.84v1.3h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.6V19z"/>
        </svg>
        <div className="linkedin-post-meta">
          <span className="linkedin-post-platform">LinkedIn</span>
          {post.date && <span className="linkedin-post-date">{post.date}</span>}
        </div>
      </div>
      <div className="linkedin-post-content">
        <h4 className="linkedin-post-title">{post.title}</h4>
        <p className="linkedin-post-description">{post.description}</p>
        <a 
          href={post.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="linkedin-post-link"
          aria-label={`Read "${post.title}" on LinkedIn`}
        >
          Read on LinkedIn
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
            <path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
          </svg>
        </a>
      </div>
    </article>
  );
}

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
          {ui.about.linkedinPosts.map((post, index) => (
            <LinkedInPostCard key={index} post={post} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;
