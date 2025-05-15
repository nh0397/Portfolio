import React from "react";
import "./Contact.css";

function Contact() {
  return (
    <div className="vscode-page">
      <div className="editor-container">
        <div className="terminal-container">
          <div className="panel-tabs">
            <div className="panel-tab">Problems</div>
            <div className="panel-tab">Output</div>
            <div className="panel-tab">Debug Console</div>
            <div className="panel-tab active">Terminal</div>
            <div className="panel-tab">Ports</div>
          </div>
          <div className="terminal-body">
            <div className="terminal-line login-info">
              Last login: Tue May 13 09:45:53 on console
            </div>

            <div className="terminal-line">
              <span className="prompt-user">nh@Naisargs-MacBook-Pro ~ $</span>
            </div>

            <div className="terminal-line">
              <span className="prompt-command">{"> whoami"}</span>
            </div>
            <div className="terminal-output">Naisarg Halvadiya</div>
            <div className="terminal-output">
              📦 Ready to be deployed to your dev team!
            </div>

            <div className="terminal-line">
              <span className="prompt-command">{"> contact"}</span>
            </div>
            <div className="terminal-output">
              <span className="icon">📧</span>{" "}
              <a href="mailto:naisarg.halvadiya@gmail.com">
                naisarg.halvadiya@gmail.com
              </a>
            </div>
            <div className="terminal-output">
              <span className="icon">🌐</span>{" "}
              <a
                href="https://linkedin.com/in/naisarg-halvadiya"
                target="_blank"
                rel="noreferrer"
              >
                linkedin.com/in/naisarg-halvadiya
              </a>
            </div>
            <div className="terminal-output">
              <span className="icon">💻</span>{" "}
              <a
                href="https://github.com/nh0397"
                target="_blank"
                rel="noreferrer"
              >
                github.com/nh0397
              </a>
            </div>
            <div className="terminal-output">
              <span className="icon">📍</span> San Francisco, CA
            </div>

            <div className="terminal-line">
              <span className="prompt-command">{"> resume"}</span>
            </div>
            <div className="terminal-output">
              <span className="icon">📄</span>{" "}
              <a href="/assets/Resume.pdf" target="_blank" rel="noreferrer">
                View Resume
              </a>
            </div>

            <div className="terminal-line">
              <span className="prompt-command">
                {'> echo "Let\'s build something awesome together!"'}
              </span>
            </div>
            <div className="terminal-output">
              Let's build something awesome together! 🚀
            </div>

            <div className="terminal-line">
              <span className="prompt-user">nh@Naisargs-MacBook-Pro ~ $</span>
              <span className="cursor"></span>
            </div>
          </div>
        </div>
      </div>
      <div className="status-bar">
        <div className="status-item">
          <span className="status-icon">🔴</span>
          <span>main</span>
        </div>
        <div className="status-item">
          <span className="status-icon">✓</span>
          <span>UTF-8</span>
        </div>
        <div className="status-item">
          <span>JavaScript React</span>
        </div>
        <div className="status-item">
          <span>Ln 1, Col 1</span>
        </div>
      </div>
    </div>
  );
}

export default Contact;
