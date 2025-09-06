import React, { useContext } from "react";
import "./Content.css";
import { AppContext } from "../../context/AppContext";
import Home from "./Files/Home";
import About from "./Files/About";
import Projects from "./Files/Projects";
import Experience from "./Files/Experience";
import Contact from "./Files/Contact";
import Chatbot from "./Files/Chatbot";
import { ui } from "../../config/portfolioConfig";

function Content() {
  const { activeFile, setActiveFile } = useContext(AppContext);
  const { copilotClicked, setCopilotClicked } = useContext(AppContext);

  const tabs = ui.tabs;

  const renderContent = () => {
    switch (activeFile) {
      case 1:
        return <Home />;
      case 2:
        return <About />;
      case 3:
        return <Projects />;
      case 4:
        return <Experience />;
      case 5:
        return <Contact />;
      default:
        return <pre>// File not found.</pre>;
    }
  };

  return (
    <>
      <div
        className={`content-container ${
          copilotClicked ? "reduced-content-container" : ""
        }`}
      >
        <div className="tab-bar">
          {tabs.map((tab) => (
            <div
              key={tab.no}
              className={`tab ${activeFile === tab.no ? "active-tab" : ""}`}
              onClick={() => setActiveFile(tab.no)}
            >
              {tab.name}
              <span className="close-tab">×</span>
            </div>
          ))}
        </div>

        <div className="content-display">{renderContent()}</div>
      </div>
      
      {/* Always render Chatbot, control visibility via props */}
      <Chatbot
        isOpen={copilotClicked}
        onClose={() => setCopilotClicked(false)}
      />
    </>
  );
}

export default Content;
