import React from "react";
import "./TopBar.css";
import expand from "../assets/icons/expand.png";

const TopBar = () => {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-button-group">
          <div className="close-button"></div>
          <div className="minimize-button"></div>
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
        <span className="copilot-icon">🤖</span>
      </div>

      <div className="topbar-right">
        <span className="view-icon">🧩</span>
        <span className="view-icon">▭</span>
        <span className="view-icon">▣</span>
        <span className="view-icon">▥</span>
      </div>
    </div>
  );
};

export default TopBar;
