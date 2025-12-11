import React, { useState, useEffect, useRef } from "react";
import "./About.css";
import { skills, ui } from "../../../config/portfolioConfig";

const categories = ["All", ...Object.keys(skills)];

// Convert LinkedIn embed URL to regular post URL
function convertEmbedUrlToPostUrl(embedUrl) {
  try {
    // Extract URN from embed URL
    // Example: https://www.linkedin.com/embed/feed/update/urn:li:share:7350411566250401793
    const urnMatch = embedUrl.match(/urn:li:(share|activity):(\d+)/);
    if (urnMatch) {
      // Convert to regular LinkedIn post URL
      return `https://www.linkedin.com/feed/update/${urnMatch[0]}`;
    }
    return embedUrl;
  } catch (e) {
    return embedUrl;
  }
}

// LinkedIn post card component - shows card with link (more reliable than iframe)
function LinkedInPostCard({ embedUrl, index }) {
  const postUrl = convertEmbedUrlToPostUrl(embedUrl);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showIframe, setShowIframe] = useState(true);
  
  // Try iframe, but fallback to card if it doesn't load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!iframeLoaded) {
        setShowIframe(false);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [iframeLoaded]);
  
  return (
    <div className="linkedin-post-wrapper">
      {showIframe && (
        <iframe
          src={embedUrl}
          height="400"
          width="100%"
          frameBorder="0"
          title={`LinkedIn post ${index + 1}`}
          aria-label={`LinkedIn post ${index + 1}`}
          allow="clipboard-write; encrypted-media"
          loading="lazy"
          onLoad={() => setIframeLoaded(true)}
          onError={() => setShowIframe(false)}
          style={{ display: showIframe ? 'block' : 'none' }}
        />
      )}
      {!showIframe && (
        <div className="linkedin-post-card">
          <div className="linkedin-post-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3v9zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.75 1.75 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.5-.03-3.45-2.1-3.45-2.1 0-2.42 1.64-2.42 3.34V19H6.5v-9h2.84v1.3h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.6V19z"/>
            </svg>
            <span>LinkedIn Post {index + 1}</span>
          </div>
          <div className="linkedin-post-content">
            <p>LinkedIn embeds are blocked by browser security policies. Click below to view this post on LinkedIn.</p>
            <a 
              href={postUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="linkedin-post-link"
              aria-label={`View LinkedIn post ${index + 1} on LinkedIn`}
            >
              View on LinkedIn →
            </a>
          </div>
        </div>
      )}
    </div>
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
            <LinkedInPostCard key={index} embedUrl={postUrl} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;
