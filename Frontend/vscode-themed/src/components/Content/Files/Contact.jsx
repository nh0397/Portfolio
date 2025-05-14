import React from "react";
import "./Contact.css";

function Contact() {
  return (
    <div className="terminal-container">
      <div className="terminal-window">
        <div className="terminal-line"><span className="prompt">> whoami</span></div>
        <div className="terminal-output">Naisarg Halvadiya</div>

        <div className="terminal-line"><span className="prompt">> status</span></div>
        <div className="terminal-output">📦 Ready to be deployed to your dev team!</div>

        <div className="terminal-line"><span className="prompt">> contact</span></div>
        <div className="terminal-output">📧 <a href="mailto:naisarg.halvadiya@gmail.com">naisarg.halvadiya@gmail.com</a></div>
        <div className="terminal-output">🌐 <a href="https://linkedin.com/in/naisarg-halvadiya" target="_blank" rel="noreferrer">linkedin.com/in/naisarg-halvadiya</a></div>
        <div className="terminal-output">💻 <a href="https://github.com/nh0397" target="_blank" rel="noreferrer">github.com/nh0397</a></div>
        <div className="terminal-output">📍 San Francisco, CA</div>

        <div className="terminal-line"><span className="prompt">> resume</span></div>
        <div className="terminal-output">📄 <a href="/assets/Resume.pdf" target="_blank" rel="noreferrer">View Resume</a></div>

        <div className="terminal-line"><span className="prompt">{`> echo "Let's build something awesome together!"`}</span></div>
        <div className="terminal-output">Let's build something awesome together! 🚀</div>
      </div>
    </div>
  );
}

export default Contact;
