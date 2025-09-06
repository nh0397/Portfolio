import React, { useState } from "react";
import "./Contact.css";
import ResumeViewer from "./ResumeViewer";
import { ui, personal, social } from "../../../config/portfolioConfig";

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
    const message = ui.contact.quickTemplates[mode] || "";
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
              <h2 className="form-title">{ui.contact.formTitle}</h2>

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
                {ui.contact.panelTabs.map((tab, index) => (
                  <div key={index} className={`panel-tab ${tab === "Terminal" ? "active" : ""}`}>
                    {tab}
                  </div>
                ))}
              </div>
              <div className="terminal-body">
                <div className="terminal-line login-info">
                  {ui.contact.terminal.loginInfo}
                </div>

                <div className="terminal-line">
                  <span className="prompt-user">
                    {ui.contact.terminal.prompt}
                  </span>
                </div>

                <div className="terminal-line">
                  <span className="prompt-command">{"> whoami"}</span>
                </div>
                <div className="terminal-output">{ui.contact.terminal.whoami}</div>
                <div className="terminal-output">
                  {ui.contact.terminal.readyMessage}
                </div>

                <div className="terminal-line">
                  <span className="prompt-command">{ui.contact.terminal.contactCommand}</span>
                </div>
                <div className="terminal-output">
                  <span className="icon">📧</span>{" "}
                  <a href={`mailto:${personal.email}`}>
                    {personal.email}
                  </a>
                </div>
                <div className="terminal-output">
                  <span className="icon">🌐</span>{" "}
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {social.linkedin.replace('https://', '')}
                  </a>
                </div>
                <div className="terminal-output">
                  <span className="icon">💻</span>{" "}
                  <a
                    href={social.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {social.github.replace('https://', '')}
                  </a>
                </div>
                <div className="terminal-output">
                  <span className="icon">📍</span> {personal.location}
                </div>

                <div className="terminal-line">
                  <span className="prompt-command">{ui.contact.terminal.resumeCommand}</span>
                </div>
                <div className="terminal-output">
                  <span className="icon">📄</span>{" "}
                  <button className="resume-viewer-btn" onClick={() => setShowResume(true)}>
                    View Resume
                  </button>
                </div>

                <div className="terminal-line">
                  <span className="prompt-command">
                    {ui.contact.terminal.echoCommand}
                  </span>
                </div>
                <div className="terminal-output">
                  {ui.contact.terminal.echoOutput}
                </div>

                <div className="terminal-line">
                  <span className="prompt-user">
                    {ui.contact.terminal.prompt}
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
