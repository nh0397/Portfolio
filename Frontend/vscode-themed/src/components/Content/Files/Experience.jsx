import React from "react";
import "./Experience.css";
import { portfolioConfig } from "../../../config/portfolioConfig";
import { FiMapPin, FiCalendar } from "react-icons/fi";
import { FaTrophy, FaUsers } from "react-icons/fa";

function Experience() {
  return (
    <div className="experience-container">
      <h2 className="experience-heading">💼 Professional Experience</h2>
      
      {/* Work Experience */}
      <div className="experience-section">
        <h3 className="section-title">🚀 Work Experience</h3>
        <div className="timeline">
          {portfolioConfig.experience.filter(item => item.type === "work").map((job, index) => (
            <div key={index} className="experience-card">
              <div className="card-header">
                <div className="company-info">
                  <img src={job.logo} alt={job.company} className="company-logo" />
                  <div className="company-details">
                    <h4 className="company-name">{job.company}</h4>
                    <h5 className="job-role">{job.role}</h5>
                    <div className="job-meta">
                      <span className="meta-item">
                        <FiCalendar /> {job.duration}
                      </span>
                      <span className="meta-item">
                        <FiMapPin /> {job.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="job-description">{job.description}</p>
              
              {job.projects && (
                <div className="projects-section">
                  <h6 className="projects-title">Key Projects:</h6>
                  {job.projects.map((project, pIndex) => (
                    <div key={pIndex} className="project-item">
                      <h7 className="project-title">{project.title}</h7>
                      <p className="project-description">{project.description}</p>
                      
                      <div className="project-impact">
                        <strong>Impact:</strong>
                        <ul>
                          {project.impact.map((impact, iIndex) => (
                            <li key={iIndex}>{impact}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="project-stack">
                        {project.stack.map((tech, tIndex) => (
                          <span key={tIndex} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {job.contributions && (
                <div className="contributions-section">
                  <h6 className="contributions-title">Key Contributions:</h6>
                  <ul>
                    {job.contributions.map((contribution, cIndex) => (
                      <li key={cIndex}>{contribution}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="experience-section">
        <h3 className="section-title">🏆 Achievements & Awards</h3>
        <div className="achievements-grid">
          {portfolioConfig.achievements.map((achievement, index) => (
            <div key={index} className="achievement-card">
              <div className="achievement-header">
                {achievement.title.includes("Hack") ? (
                  <FaTrophy className="achievement-icon" />
                ) : (
                  <FaUsers className="achievement-icon" />
                )}
                <h4 className="achievement-title">{achievement.title}</h4>
              </div>
              <p className="achievement-description">{achievement.description}</p>
              {achievement.project && (
                <p className="achievement-project"><strong>Project:</strong> {achievement.project}</p>
              )}
              {achievement.period && (
                <p className="achievement-period"><strong>Period:</strong> {achievement.period}</p>
              )}
              {achievement.projects && (
                <div className="achievement-projects">
                  <strong>Projects:</strong>
                  <ul>
                    {achievement.projects.map((project, pIndex) => (
                      <li key={pIndex}>{project}</li>
                    ))}
                  </ul>
                </div>
              )}
              {achievement.stack && (
                <div className="achievement-stack">
                  {achievement.stack.map((tech, tIndex) => (
                    <span key={tIndex} className="tech-tag">{tech}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="experience-section">
        <h3 className="section-title">🎓 Education</h3>
        <div className="education-grid">
          {portfolioConfig.education.map((edu, index) => (
            <div key={index} className="education-card">
              <div className="education-header">
                <img src={edu.logo} alt={edu.institution} className="education-logo" />
                <div className="education-details">
                  <h4 className="degree">{edu.degree}</h4>
                  <h5 className="institution">{edu.institution}</h5>
                  <div className="education-meta">
                    <span className="gpa">GPA: {edu.gpa}</span>
                    <span className="graduation">Graduation: {edu.graduation}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Experience;
