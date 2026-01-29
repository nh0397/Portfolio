import React from "react";
import "./FeaturedProjects.css";
import { portfolioConfig } from "../../../config/portfolioConfig";
import { FiGithub } from "react-icons/fi";
import secureSenseGif from "../../../assets/images/Secure Sense.gif";

function FeaturedProjects() {
  const renderMedia = (media) => {
    if (!media) return null;

    switch (media.type) {
      case "image":
        if (!media.url) return null;
        return (
          <div className="project-media">
            <img src={media.url} alt={media.alt} className="project-image" />
          </div>
        );
      case "gif":
        return (
          <div className="project-media">
            <img src={secureSenseGif} alt={media.alt} className="project-gif" />
          </div>
        );
      case "youtube":
        if (!media.url) return null;
        // Use privacy-enhanced mode and add proper parameters to avoid blocking
        const embedUrl = `https://www.youtube-nocookie.com/embed/${media.url}?modestbranding=1&rel=0&enablejsapi=1`;
        return (
          <div className="project-media">
            <iframe
              width="100%"
              height="315"
              src={embedUrl}
              title={media.alt}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="project-video"
            ></iframe>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="featured-wrapper">
      <h2 className="featured-heading">📌 Featured Projects</h2>
      {portfolioConfig.featuredProjects.map((proj, i) => (
        <div key={i} className="project-card expanded">
          <div className="project-header">
            <div>
              <h3>{proj.title}</h3>
              <p className="subtitle">{proj.subtitle}</p>
            </div>
            {proj.github && (
              <a 
                href={proj.github} 
                target="_blank" 
                rel="noreferrer" 
                className="github-icon"
                aria-label={`View ${proj.title} project on GitHub`}
              >
                <FiGithub aria-hidden="true" />
              </a>
            )}
          </div>

          <div className="project-body">
            {renderMedia(proj.media)}
            
            <p><strong>🔍 Problem:</strong> {proj.problem}</p>
            <p><strong>🧠 Solution:</strong> {proj.solution}</p>
            <p><strong>📈 Impact:</strong></p>
            <ul>
              {proj.impact.map((point, idx) => (
                <li key={idx}>• {point}</li>
              ))}
            </ul>
            <p><strong>🔮 Future:</strong> {proj.future}</p>

            {proj.backend && (
              <div className="backend-info">
                <p><strong>🔧 Backend:</strong> {proj.backend.title}</p>
                <p>{proj.backend.description}</p>
                <a 
                  href={proj.backend.github} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="backend-github-link"
                  aria-label={`View backend code for ${proj.title} on GitHub`}
                >
                  <FiGithub aria-hidden="true" /> View Backend Code <span aria-hidden="true">→</span>
                </a>
              </div>
            )}

            <div className="tech-stack">
              {proj.tech.map((tech, idx) => (
                <span key={idx} className="tech-badge">{tech}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
      
      <div className="quirky-note">
        <p>💻 <em>...and that's just the tip of the iceberg! Check out all my development work below 👇</em></p>
      </div>
    </div>
  );
}

export default FeaturedProjects;
