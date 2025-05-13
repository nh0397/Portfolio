import React, { useState } from "react";
import "./Content.css";

function Content() {
  const [activeTab, setActiveTab] = useState("home.jsx");

  const tabs = [
    "home.jsx",
    "about.html",
    "projects.js",
    "experience.css",
    "contact.json",
  ];

  return (
    <div className="content-container">
      <div className="tab-bar">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`tab ${activeTab === tab ? "active-tab" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            <span className="close-tab">×</span>
          </div>
        ))}
      </div>

      <div className="content-display">
        <pre>{`// Content for ${activeTab}`}</pre>
      </div>
    </div>
  );
}

export default Content;
