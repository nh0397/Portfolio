import React, { useState, useEffect, useRef } from "react";
import "./About.css";
import { skills, ui } from "../../../config/portfolioConfig";

const categories = ["All", ...Object.keys(skills)];

// Separate component for LinkedIn embed to properly use hooks
function LinkedInEmbed({ postUrl, index }) {
  const iframeRef = useRef(null);
  
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = () => {
        console.log(`✅ LinkedIn embed ${index + 1} loaded:`, postUrl);
      };
      
      const handleError = () => {
        console.error(`❌ LinkedIn embed ${index + 1} failed:`, postUrl);
        console.error('Check browser console for CSP violations');
      };
      
      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);
      
      // Timeout check for blocked iframes
      const timeout = setTimeout(() => {
        try {
          // Try to access iframe content - will fail if blocked
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!iframeDoc) {
            console.warn(`⚠️ LinkedIn embed ${index + 1} may be blocked (CSP or CORS):`, postUrl);
          }
        } catch (e) {
          console.warn(`⚠️ LinkedIn embed ${index + 1} blocked (cross-origin):`, postUrl, e.message);
        }
      }, 3000);
      
      return () => {
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
        clearTimeout(timeout);
      };
    }
  }, [postUrl, index]);
  
  return (
    <iframe
      ref={iframeRef}
      src={postUrl}
      height="400"
      width="100%"
      frameBorder="0"
      title={`LinkedIn post ${index + 1}`}
      aria-label={`LinkedIn post ${index + 1}`}
      allow="clipboard-write; encrypted-media"
      loading="lazy"
    />
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
          {ui.about.linkedinPosts.map((postUrl, index) => (
            <LinkedInEmbed key={index} postUrl={postUrl} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;
