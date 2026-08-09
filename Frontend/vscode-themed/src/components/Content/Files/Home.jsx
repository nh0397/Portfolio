import React, { useState, useEffect, useContext } from "react";
import "./Home.css";
import profilePic from "../../../assets/images/Photo.jpeg";
import { AppContext } from "../../../context/AppContext";
import { portfolioConfig } from "../../../config/portfolioConfig";

function Home() {
  const { homeVisited, setHomeVisited } = useContext(AppContext);
  const { setActiveFile } = useContext(AppContext);
  const [animationsComplete, setAnimationsComplete] = useState(homeVisited);

  const developerInfo = {
    name: portfolioConfig.personal.name,
    role: portfolioConfig.personal.title,
    bio: portfolioConfig.personal.bio,
    skills: ["AI Engineer", "Full-Stack Developer", "Data Scientist"]
  };

  useEffect(() => {
    if (!homeVisited) {
      setTimeout(() => {
        setHomeVisited(true);
        setAnimationsComplete(true);
      }, 1500);
    } else {
      setAnimationsComplete(true);
    }
  }, [homeVisited, setHomeVisited]);

  return (
    <main className="modern-hero">
      {/* Animated background gradient */}
      <div className="gradient-bg"></div>

      {/* Floating shapes background */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className={`hero-wrapper ${animationsComplete ? "loaded" : ""}`}>
        {/* Left side - Content */}
        <div className="hero-left-section">
          <div className={`content-block ${animationsComplete ? "fade-in" : ""}`}>
            <div className="greeting">Hey there, I'm</div>

            <h1 className="name-title">{developerInfo.name}</h1>

            <p className="role-subtitle">{developerInfo.role}</p>

            <p className="bio-text">{developerInfo.bio}</p>

            <div className="skills-badges">
              {developerInfo.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="skill-badge"
                  style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="cta-group">
              <button
                className="cta-button primary"
                onClick={() => setActiveFile(2)}
                aria-label="Navigate to About section"
              >
                Explore My Work
                <span className="arrow">→</span>
              </button>
              <button
                className="cta-button secondary"
                onClick={() => setActiveFile(5)}
                aria-label="Navigate to Contact section"
              >
                Get In Touch
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Profile Image with decorative elements */}
        <div className="hero-right-section">
          <div className={`profile-wrapper ${animationsComplete ? "scale-in" : ""}`}>
            <div className="profile-frame">
              <img
                src={profilePic}
                alt={developerInfo.name}
                className="profile-image"
              />
              <div className="profile-glow"></div>
            </div>

            {/* Decorative floating elements */}
            <div className="float-element float-1">
              <div className="element-content">AI</div>
            </div>
            <div className="float-element float-2">
              <div className="element-content">⚡</div>
            </div>
            <div className="float-element float-3">
              <div className="element-content">Code</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <div className="text">Scroll to explore</div>
      </div>
    </main>
  );
}

export default Home;
