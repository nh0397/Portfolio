import React, { useState } from "react";
import "./TopBar.css";
import expand from "../../assets/icons/expand.png";
import chatbot from "../../assets/icons/chatbot.png";
import logo from "../../assets/icons/Logo.png";

const TopBar = () => {
  const [copilotClicked, setCopilotClicked] = useState(false);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-button-group">
          <div className="close-button">
            <span className="window-icon">×</span>
          </div>
          <div className="minimize-button">
            <span className="window-icon">–</span>
          </div>
          <div className="expand-button">
            <img src={expand} alt="expand" className="expand-icon" />
          </div>
        </div>
      </div>

      <div className="topbar-center">
        <button className="arrow-button">←</button>
        <button className="arrow-button">→</button>
        <input
          type="text"
          placeholder="Naisarg Halvadiya's Portfolio"
          className="search-input"
          disabled={true}
        />
        <span
          title="Talk to Naisarg's AI Buddy"
          onClick={() => setCopilotClicked(true)}
          className={`copilot-icon ${!copilotClicked ? "blink" : ""}`}
        >
          <img src={chatbot} alt="chatbot" className="chatbot-icon" />
        </span>
      </div>

      <div className="topbar-right">
        <img src={logo} alt="logo" className="logo-icon" />
      </div>
    </div>
  );
};

export default TopBar;
