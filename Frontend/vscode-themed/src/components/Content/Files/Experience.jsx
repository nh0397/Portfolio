import React, { useMemo, useEffect, useState } from 'react';
import './Experience.css';
import { portfolioConfig } from '../../../config/portfolioConfig';

function Experience() {
  const [dbExperience, setDbExperience] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch experience data from backend
    fetch('http://localhost:5001/api/experience')
      .then((res) => res.json())
      .then((data) => {
        console.log('Experience data:', data);
        if (data.experiences) {
          setDbExperience(data.experiences);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch experience:', err);
        setLoading(false);
      });
  }, []);

  const timelineItems = useMemo(() => {
    const items = [];

    // Use DB data if available, otherwise use config
    const experienceData = dbExperience.length > 0 ? dbExperience : portfolioConfig.experience;

    if (Array.isArray(experienceData)) {
      experienceData.forEach((exp, idx) => {
        if (exp.source === undefined) {
          // From config
          items.push({
            id: `exp-${idx}`,
            type: 'work',
            title: exp.role,
            company: exp.company,
            duration: exp.duration,
            location: exp.location,
            description: exp.description,
            projects: exp.projects,
            logo: exp.logo,
            date: exp.date,
            isWork: true,
          });
        } else {
          // From DB
          items.push({
            id: `exp-${idx}`,
            type: 'work',
            title: exp.text,
            company: exp.metadata?.company || 'Portfolio Entry',
            duration: '',
            location: exp.metadata?.location || '',
            description: exp.text,
            date: exp.date,
            isWork: true,
          });
        }
      });
    }

    return items.sort((a, b) => {
      const aDate = new Date(a.date || a.duration?.split('–')[1]?.trim() || '2025');
      const bDate = new Date(b.date || b.duration?.split('–')[1]?.trim() || '2025');
      return bDate - aDate;
    });
  }, [dbExperience]);

  return (
    <div className="experience-page">
      <div className="experience-header">
        <h1 className="gradient-text">Experience & Journey</h1>
        <p className="subtitle">
          {loading ? 'Loading...' : 'A timeline of my professional growth and key milestones'}
        </p>
      </div>

      <div className="timeline-container">
        {timelineItems.map((item, idx) => (
          <div key={item.id} className="timeline-item" style={{ '--index': idx }}>
            <div className="timeline-dot">
              <div className="dot-inner"></div>
              <div className="dot-pulse"></div>
            </div>

            <div className={`timeline-card ${idx % 2 === 0 ? 'left' : 'right'}`}>
              <div className="card-content">
                {item.logo && (
                  <img src={item.logo} alt={item.company} className="company-logo" />
                )}
                <h3 className="role-title">{item.title}</h3>
                <p className="company-name">{item.company}</p>
                {item.duration && (
                  <p className="duration">
                    <span className="duration-icon">📅</span>
                    {item.duration}
                  </p>
                )}
                {item.location && (
                  <p className="location">
                    <span className="location-icon">📍</span>
                    {item.location}
                  </p>
                )}
                <p className="description">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skills Section */}
      <div className="skills-section">
        <h2 className="gradient-text-secondary">Core Competencies</h2>
        <div className="skills-grid">
          {Object.entries(portfolioConfig.skills).map(([category, skills]) => (
            <div key={category} className="skill-category">
              <h4>{category}</h4>
              <div className="skill-list">
                {skills.slice(0, 5).map((skill, idx) => (
                  <span key={idx} className="skill-tag">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Experience;
