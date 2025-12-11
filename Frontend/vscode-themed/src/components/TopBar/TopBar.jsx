import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import "./TopBar.css";
import expand from "../../assets/icons/expand.png";
import chatbot from "../../assets/icons/chatbot.png";
import logo from "../../assets/icons/Logo.png";

const TopBar = () => {
  const { copilotClicked, setCopilotClicked } = useContext(AppContext);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-button-group" role="toolbar" aria-label="Window controls">
          <button 
            className="close-button"
            aria-label="Close window"
            title="Close window"
          >
            <span className="window-icon" aria-hidden="true">×</span>
          </button>
          <button 
            className="minimize-button"
            aria-label="Minimize window"
            title="Minimize window"
          >
            <span className="window-icon" aria-hidden="true">–</span>
          </button>
          <button 
            className="expand-button"
            aria-label="Expand window"
            title="Expand window"
          >
            <img src={expand} alt="" className="expand-icon" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="topbar-center">
        <button 
          className="arrow-button"
          aria-label="Navigate back"
          title="Navigate back"
        >
          <span aria-hidden="true">←</span>
        </button>
        <button 
          className="arrow-button"
          aria-label="Navigate forward"
          title="Navigate forward"
        >
          <span aria-hidden="true">→</span>
        </button>
        <input
          type="text"
          placeholder="Naisarg Halvadiya's Portfolio"
          className="search-input"
          disabled={true}
          aria-label="Portfolio title"
          readOnly
        />
        <button
          title="Talk to my AI Buddy!"
          onClick={() => setCopilotClicked(!copilotClicked)}
          className={`copilot-icon ${!copilotClicked ? "blink" : ""}`}
          aria-label={copilotClicked ? "Close AI chatbot" : "Open AI chatbot"}
          aria-expanded={copilotClicked}
        >
          <img src={chatbot} alt="" className="chatbot-icon" aria-hidden="true" />
        </button>
      </div>

      <div className="topbar-right">
        <img src={logo} alt="Naisarg Halvadiya Logo" className="logo-icon" />
      </div>
    </div>
  );
};

export default TopBar;
