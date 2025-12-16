import React, { useMemo } from "react";
import "./Experience.css";
import { portfolioConfig } from "../../../config/portfolioConfig";
import { FiMapPin, FiCalendar, FiBriefcase, FiAward, FiBook } from "react-icons/fi";

function Experience() {
  // Combine all timeline items and sort chronologically
  const timelineItems = useMemo(() => {
    const items = [];

    // Add work experience
    portfolioConfig.experience.forEach((item) => {
      if (item.type === "work") {
        const startDate = item.duration.split("–")[0].trim();
        items.push({
          type: "work",
          data: item,
          date: startDate,
          sortKey: getDateSortKey(startDate)
        });
      } else if (item.type === "education") {
        const startDate = item.duration.split("–")[0].trim();
        items.push({
          type: "tutoring",
          data: item,
          date: startDate,
          sortKey: getDateSortKey(startDate)
        });
      }
    });

    // Add achievements
    portfolioConfig.achievements.forEach((achievement) => {
      let date = "";
      if (achievement.period) {
        // Extract date from period like "May – Jun 2024"
        const periodParts = achievement.period.split("–");
        const startPart = periodParts[0].trim();
        // Extract year from the period
        const yearMatch = achievement.period.match(/\d{4}/);
        const year = yearMatch ? yearMatch[0] : "";
        if (year) {
          date = `${startPart} ${year}`;
        } else {
          date = startPart;
        }
      } else if (achievement.title.includes("2025")) {
        date = "Jan 2025";
      } else if (achievement.title.includes("2024")) {
        date = "May 2024";
      }
      items.push({
        type: "achievement",
        data: achievement,
        date: date,
        sortKey: getDateSortKey(date)
      });
    });

    // Add education
    portfolioConfig.education.forEach((edu) => {
      const gradDate = edu.graduation;
      items.push({
        type: "education",
        data: edu,
        date: gradDate,
        sortKey: getDateSortKey(gradDate)
      });
    });

    // Sort by date (newest first)
    return items.sort((a, b) => b.sortKey - a.sortKey);
  }, []);

  function getDateSortKey(dateString) {
    if (!dateString) return 0;
    const months = {
      "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
      "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
    };
    const parts = dateString.trim().split(" ");
    if (parts.length >= 2) {
      const month = months[parts[0]] || 1;
      const year = parseInt(parts[1]) || 2000;
      return year * 100 + month;
    }
    return 0;
  }

  const renderTimelineItem = (item, index) => {
    if (item.type === "work") {
      const job = item.data;
      return (
        <div key={index} className="timeline-item timeline-item-work">
          <div className="timeline-marker timeline-marker-work"></div>
          <div className="timeline-content">
            <div className="timeline-header">
              <div className="timeline-icon-wrapper timeline-icon-work">
                <FiBriefcase className="timeline-icon" />
              </div>
              <div className="timeline-title-section">
                <h4 className="timeline-title">{job.role}</h4>
                <h5 className="timeline-subtitle">{job.company}</h5>
              </div>
              <div className="timeline-date">{item.date}</div>
            </div>
            <div className="timeline-meta">
              <span className="timeline-meta-item">
                <FiCalendar /> {job.duration}
              </span>
              <span className="timeline-meta-item">
                <FiMapPin /> {job.location}
              </span>
            </div>
            <p className="timeline-description">{job.description}</p>
            
            {job.projects && (
              <div className="timeline-projects">
                {job.projects.map((project, pIndex) => (
                  <div key={pIndex} className="timeline-project">
                    <div className="project-header">
                      <span className="project-title">{project.title}</span>
                      <span className="project-description-text">{project.description}</span>
                    </div>
                    {project.impact && (
                      <div className="project-impact">
                        <ul>
                          {project.impact.map((impact, iIndex) => (
                            <li key={iIndex}>{impact}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {project.stack && (
                      <div className="project-stack">
                        {project.stack.map((tech, tIndex) => (
                          <span key={tIndex} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {job.contributions && (
              <div className="timeline-contributions">
                <ul>
                  {job.contributions.map((contribution, cIndex) => (
                    <li key={cIndex}>{contribution}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (item.type === "tutoring") {
      const tutoring = item.data;
      return (
        <div key={index} className="timeline-item timeline-item-work">
          <div className="timeline-marker timeline-marker-work"></div>
          <div className="timeline-content">
            <div className="timeline-header">
              <div className="timeline-icon-wrapper timeline-icon-work">
                <FiBriefcase className="timeline-icon" />
              </div>
              <div className="timeline-title-section">
                <h4 className="timeline-title">{tutoring.role}</h4>
                <h5 className="timeline-subtitle">{tutoring.company}</h5>
              </div>
              <div className="timeline-date">{item.date}</div>
            </div>
            <div className="timeline-meta">
              <span className="timeline-meta-item">
                <FiCalendar /> {tutoring.duration}
              </span>
              <span className="timeline-meta-item">
                <FiMapPin /> {tutoring.location}
              </span>
            </div>
            <p className="timeline-description">{tutoring.description}</p>
            {tutoring.contributions && (
              <div className="timeline-contributions">
                <ul>
                  {tutoring.contributions.map((contribution, cIndex) => (
                    <li key={cIndex}>{contribution}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (item.type === "achievement") {
      const achievement = item.data;
      return (
        <div key={index} className="timeline-item timeline-item-achievement">
          <div className="timeline-marker timeline-marker-achievement"></div>
          <div className="timeline-content">
            <div className="timeline-header">
              <div className="timeline-icon-wrapper timeline-icon-achievement">
                <FiAward className="timeline-icon" />
              </div>
              <div className="timeline-title-section">
                <h4 className="timeline-title">{achievement.title}</h4>
              </div>
              <div className="timeline-date">{item.date}</div>
            </div>
            <p className="timeline-description">{achievement.description}</p>
            {achievement.project && (
              <p className="timeline-detail"><strong>Project:</strong> {achievement.project}</p>
            )}
            {achievement.period && (
              <p className="timeline-detail"><strong>Period:</strong> {achievement.period}</p>
            )}
            {achievement.projects && (
              <div className="timeline-contributions">
                <ul>
                  {achievement.projects.map((project, pIndex) => (
                    <li key={pIndex}>{project}</li>
                  ))}
                </ul>
              </div>
            )}
            {achievement.stack && (
              <div className="project-stack">
                {achievement.stack.map((tech, tIndex) => (
                  <span key={tIndex} className="tech-tag">{tech}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (item.type === "education") {
      const edu = item.data;
      return (
        <div key={index} className="timeline-item timeline-item-education">
          <div className="timeline-marker timeline-marker-education"></div>
          <div className="timeline-content">
            <div className="timeline-header">
              <div className="timeline-icon-wrapper timeline-icon-education">
                <FiBook className="timeline-icon" />
              </div>
              <div className="timeline-title-section">
                <h4 className="timeline-title">{edu.degree}</h4>
                <h5 className="timeline-subtitle">{edu.institution}</h5>
              </div>
              <div className="timeline-date">{item.date}</div>
            </div>
            <div className="timeline-meta">
              <span className="timeline-meta-item">GPA: {edu.gpa}</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="experience-container">
      <h2 className="experience-heading">Experience Timeline</h2>
      <div className="unified-timeline">
        {timelineItems.map((item, index) => renderTimelineItem(item, index))}
      </div>
    </div>
  );
}

export default Experience;
