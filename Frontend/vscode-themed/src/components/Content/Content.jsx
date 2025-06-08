import React, { useContext } from "react";
import "./Content.css";
import { AppContext } from "../../context/AppContext";
import Home from "./Files/Home";
import About from "./Files/About";
import Projects from "./Files/Projects";
import Experience from "./Files/Experience";
import Contact from "./Files/Contact";
import Chatbot from "./Files/Chatbot";

function Content() {
  const { activeFile, setActiveFile } = useContext(AppContext);
  const { copilotClicked, setCopilotClicked } = useContext(AppContext);

  const tabs = [
    { no: 1, name: "home.jsx" },
    { no: 2, name: "about.html" },
    { no: 3, name: "projects.js" },
    { no: 4, name: "experience.css" },
    { no: 5, name: "contact.sh" },
  ];

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
