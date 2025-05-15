import React, { useEffect, useState } from "react";
import "./Projects.css";
import { FiGithub, FiExternalLink } from "react-icons/fi";
import { AiOutlineStar, AiOutlineEye } from "react-icons/ai";
import { BiGitRepoForked } from "react-icons/bi";

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
      <div className="projects-grid">
        {repos.map((repo) => (
          <div className="project-card" key={repo.id}>
            <div className="card-top">
              <a href={repo.html_url} target="_blank" rel="noreferrer">
                <h3 className="repo-name">{repo.name}</h3>
              </a>
              {repo.language && <span className="language-tag">{repo.language}</span>}
            </div>
            <p className="repo-description">
              {repo.description || "No description provided"}
            </p>
            <div className="repo-stats">
              <span><AiOutlineStar /> {repo.stargazers_count}</span>
              <span><BiGitRepoForked /> {repo.forks_count}</span>
              <span><AiOutlineEye /> {repo.watchers_count}</span>
            </div>
            <div className="repo-actions">
              <a href={repo.html_url} target="_blank" rel="noreferrer">
                <FiGithub />
              </a>
              <a href={repo.homepage || repo.html_url} target="_blank" rel="noreferrer">
                <FiExternalLink />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;
