import React, { useState, useContext } from "react";
import "./Content.css";
import { AppContext } from "../../context/AppContext";

function Content() {
  const {activeFile, setActiveFile} = useContext(AppContext)

  const tabs = [
  { no: 1, name: "home.jsx" },
  { no: 2, name: "about.html" },
  { no: 3, name: "projects.js" },
  { no: 4, name: "experience.css" },
  { no: 5, name: "contact.json" },
];

  return (
    <div className="content-container">
      <div className="tab-bar">
        {tabs.map((tab) => (
          <div
            key={tab.name}
            className={`tab ${activeFile === tab.no ? "active-tab" : ""}`}
            onClick={() => setActiveFile(tab.no)}
          >
            {tab.name}
            <span className="close-tab">×</span>
          </div>
        ))}
      </div>

      <div className="content-display">
        <pre>{`// Content for ${activeFile}`}</pre>
      </div>
    </div>
  );
}

export default Content;
