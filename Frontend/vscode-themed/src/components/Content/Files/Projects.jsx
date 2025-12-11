import React, { useEffect, useState } from "react";
import "./Projects.css";
import { FiGithub, FiExternalLink } from "react-icons/fi";
import { AiOutlineStar, AiOutlineEye } from "react-icons/ai";
import { BiGitRepoForked } from "react-icons/bi";
import FeaturedProjects from "./FeaturedProjects";
function Projects() {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    fetch("https://api.github.com/users/nh0397/repos")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
        setRepos(sorted);
      });
  }, []);

  return (
    <div className="projects-container">
      <FeaturedProjects />
      <div className="projects-grid">
        {repos.map((repo) => (
          <div className="project-card" key={repo.id}>
            <div className="card-top">
              <a 
                href={repo.html_url} 
                target="_blank" 
                rel="noreferrer"
                aria-label={`View ${repo.name} repository on GitHub`}
              >
                <h3 className="repo-name">{repo.name}</h3>
              </a>
              {repo.language && (
                <span className="language-tag" aria-label={`Programming language: ${repo.language}`}>
                  {repo.language}
                </span>
              )}
            </div>
            <p className="repo-description">
              {repo.description || "No description provided"}
            </p>
            <div className="repo-stats" role="list" aria-label="Repository statistics">
              <span role="listitem" aria-label={`${repo.stargazers_count} stars`}>
                <AiOutlineStar aria-hidden="true" /> {repo.stargazers_count}
              </span>
              <span role="listitem" aria-label={`${repo.forks_count} forks`}>
                <BiGitRepoForked aria-hidden="true" /> {repo.forks_count}
              </span>
              <span role="listitem" aria-label={`${repo.watchers_count} watchers`}>
                <AiOutlineEye aria-hidden="true" /> {repo.watchers_count}
              </span>
            </div>
            <div className="repo-actions">
              <a 
                href={repo.html_url} 
                target="_blank" 
                rel="noreferrer"
                aria-label={`View ${repo.name} on GitHub`}
              >
                <FiGithub aria-hidden="true" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;
