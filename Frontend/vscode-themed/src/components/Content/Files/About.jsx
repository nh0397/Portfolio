import React, { useState } from 'react';
import './About.css';
import { portfolioConfig } from '../../../config/portfolioConfig';

function About() {
  const [activeCategory, setActiveCategory] = useState('All');
  const skills = portfolioConfig.skills;
  const categories = ['All', ...Object.keys(skills)];

  const getFilteredSkills = () => {
    if (activeCategory === 'All') {
      return Object.entries(skills).flatMap(([_, list]) => list);
    }
    return skills[activeCategory] || [];
  };

  const personal = portfolioConfig.personal;

  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="hero-content">
          <h1 className="gradient-text">About Me</h1>
          <p className="hero-subtitle">
            Transforming data into impact through innovative engineering
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="about-container">
        {/* Bio Section with Cards */}
        <section className="bio-section">
          <div className="bio-grid">
            <div className="bio-card">
              <div className="card-icon">💡</div>
              <h3>Who I Am</h3>
              <p>{personal.bio}</p>
            </div>

            <div className="bio-card">
              <div className="card-icon">🎯</div>
              <h3>What I Do</h3>
              <p>
                I specialize in full-stack development and data science, creating solutions
                that solve real-world problems with elegance and efficiency.
              </p>
            </div>

            <div className="bio-card">
              <div className="card-icon">🚀</div>
              <h3>My Passion</h3>
              <p>
                Leveraging AI and modern technologies to build scalable systems that make a
                tangible difference in user experiences and business outcomes.
              </p>
            </div>
          </div>

          <div className="bio-full">
            <h2 className="gradient-text-secondary">My Journey</h2>
            <p className="bio-text">{personal.brief}</p>

            <div className="contact-info">
              <h3>Let's Connect</h3>
              <div className="contact-links">
                {personal.email && (
                  <a href={`mailto:${personal.email}`} className="contact-badge">
                    <span className="badge-icon">✉️</span>
                    <span>{personal.email}</span>
                  </a>
                )}
                {personal.location && (
                  <div className="contact-badge">
                    <span className="badge-icon">📍</span>
                    <span>{personal.location}</span>
                  </div>
                )}
                {personal.linkedin && (
                  <a href={personal.linkedin} target="_blank" rel="noreferrer" className="contact-badge">
                    <span className="badge-icon">💼</span>
                    <span>LinkedIn</span>
                  </a>
                )}
                {personal.github && (
                  <a href={personal.github} target="_blank" rel="noreferrer" className="contact-badge">
                    <span className="badge-icon">🐙</span>
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="skills-showcase">
          <h2 className="gradient-text">Technical Expertise</h2>
          <p className="section-subtitle">
            A comprehensive toolkit built through real-world projects and continuous learning
          </p>

          <div className="skill-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="skills-grid">
            {getFilteredSkills().map((skill, idx) => (
              <div
                key={skill.name}
                className="skill-item"
                style={{ '--index': idx }}
              >
                {skill.icon && (
                  <div className="skill-icon-wrapper">
                    <img src={skill.icon} alt={skill.name} className="skill-icon" />
                  </div>
                )}
                <span className="skill-name">{skill.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <h2 className="gradient-text-secondary">By The Numbers</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Projects Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">10+</div>
              <div className="stat-label">Years Experience</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100%</div>
              <div className="stat-label">Dedication</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">∞</div>
              <div className="stat-label">Learning Curve</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;
