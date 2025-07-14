import React, { useState } from "react";
import "./Contact.css";
import ResumeViewer from "./ResumeViewer";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [showResume, setShowResume] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically send the data to a server
    alert("Message sent successfully!");
    setFormData({ name: "", email: "", message: "" });
  };

  const setQuickMode = (mode) => {
    let message = "";
    switch (mode) {
      case "job":
        message = "I'd like to discuss a job opportunity with you.";
        break;
      case "project":
        message = "I have a project idea I'd like to collaborate on.";
        break;
      case "question":
        message = "I have a question about your work.";
        break;
      default:
        message = "";
    }

    setFormData((prevState) => ({
      ...prevState,
      message,
    }));
  };

  return (
    <div className="vscode-page">
      <div className="content-wrapper">
        <div className="main-content">
          <div className="contact-form-container">
            <form className="contact-form" onSubmit={handleSubmit}>
              <h2 className="form-title">Contact Form</h2>

              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  const name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  const email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  const message
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="form-input form-textarea"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="// Write your message here..."
                ></textarea>
              </div>

              <div className="quick-mode-container">
                <span className="quick-mode-title">// Quick templates:</span>
                <button
                  type="button"
                  className="quick-mode-button"
                  onClick={() => setQuickMode("job")}
                >
                  Job Opportunity
                </button>
                <button
                  type="button"
                  className="quick-mode-button"
                  onClick={() => setQuickMode("project")}
                >
                  Project Idea
                </button>
                <button
                  type="button"
                  className="quick-mode-button"
                  onClick={() => setQuickMode("question")}
                >
                  Question
                </button>
              </div>

              <button type="submit" className="form-button">
                Send Message
              </button>
            </form>
          </div>

          {/* Terminal Section */}
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
                  <span className="prompt-user">
                    nh@Naisargs-MacBook-Pro ~ $
                  </span>
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
                    href="https://linkedin.com/in/naisarg-h"
                    target="_blank"
                    rel="noreferrer"
                  >
                    linkedin.com/in/naisarg-h
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
                  <button className="resume-viewer-btn" onClick={() => setShowResume(true)}>
                    View Resume
                  </button>
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
                  <span className="prompt-user">
                    nh@Naisargs-MacBook-Pro ~ $
                  </span>
                  <span className="cursor"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showResume && <ResumeViewer onClose={() => setShowResume(false)} />}
    </div>
  );
}

export default Contact;
