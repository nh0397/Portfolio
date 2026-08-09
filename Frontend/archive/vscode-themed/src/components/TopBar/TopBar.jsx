import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import "./TopBar.css";
import expand from "../../assets/icons/expand.png";
import chatbot from "../../assets/icons/chatbot.png";
import logo from "../../assets/icons/Logo.png";

const TopBar = () => {
  const { copilotClicked, setCopilotClicked } = useContext(AppContext);
  const [showToast, setShowToast] = React.useState(false);

  React.useEffect(() => {
    const hasSeenToast = localStorage.getItem("hasSeenChatbotToast");
    if (!hasSeenToast) {
      const timer = setTimeout(() => setShowToast(true), 2000); // Show after 2s
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChatbotClick = () => {
    setCopilotClicked(!copilotClicked);
    setShowToast(false);
    localStorage.setItem("hasSeenChatbotToast", "true");
  };

  const closeToast = (e) => {
    e.stopPropagation();
    setShowToast(false);
    localStorage.setItem("hasSeenChatbotToast", "true");
  };
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-button-group" role="toolbar" aria-label="Window controls">
          <button 
            className="close-button"
            aria-label="Close window"
            title="Close window"
          >
          </button>
          <button 
            className="minimize-button"
            aria-label="Minimize window"
            title="Minimize window"
          >
          </button>
          <button 
            className="expand-button"
            aria-label="Expand window"
            title="Expand window"
          >
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
        <div className="chatbot-wrapper">
          <button
            title="Talk to my AI Buddy!"
            onClick={handleChatbotClick}
            className={`copilot-icon ${!copilotClicked && !showToast ? "blink" : ""}`}
            aria-label={copilotClicked ? "Close AI chatbot" : "Open AI chatbot"}
            aria-expanded={copilotClicked}
          >
            <img src={chatbot} alt="" className="chatbot-icon" aria-hidden="true" />
          </button>
          
          {showToast && (
            <div className="chatbot-toast">
              <div className="toast-content">
                <p>This is a portfolio. But if you don't want to scroll, ask me questions about him.</p>
                <button className="toast-close" onClick={closeToast}>×</button>
              </div>
              <div className="toast-arrow"></div>
            </div>
          )}
        </div>
      </div>

      <div className="topbar-right">
        <img src={logo} alt="Naisarg Halvadiya Logo" className="logo-icon" />
      </div>
    </div>
  );
};

export default TopBar;
