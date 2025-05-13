import React, { useState, useRef, useEffect } from "react";
import "./Explorer.css";
import {
  FaJs,
  FaHtml5,
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaFolderOpen,
  FaReact
} from "react-icons/fa";
import { SiCsswizardry } from "react-icons/si";
import { BsFiletypeJson } from "react-icons/bs";

function Explorer() {
  const [isOpen, setIsOpen] = useState(true);
  const [width, setWidth] = useState(250);
  const resizeRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  
  // Your original files
  const files = [
    { name: "home.jsx", icon: <FaReact style={{ color: "#61DBFB" }} /> },
    { name: "about.html", icon: <FaHtml5 style={{ color: "#e34c26" }} /> },
    { name: "projects.js", icon: <FaJs style={{ color: "#f7df1e" }} /> },
    { name: "style.css", icon: <SiCsswizardry style={{ color: "#2965f1" }} /> },
    { name: "contact.json", icon: <BsFiletypeJson style={{ color: "#7fdbff" }} /> },
  ];

  // Handle mouse down for resizing
  const handleMouseDown = (e) => {
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle mouse move for resizing
  const handleMouseMove = (e) => {
    if (!isResizing) return;
    console.log(e.clientX)
    const newWidth = e.clientX;
    if (newWidth > 100 && newWidth < 300) {
      setWidth(newWidth);
    }
  };

  // Handle mouse up to stop resizing
  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="explorer-container" style={{ width: `${width}px` }}>
      <div className="explorer-header">
        <span className="explorer-title">EXPLORER</span>
        <div className="explorer-actions">
          <span>...</span>
        </div>
      </div>
      
      <div className="explorer-content">
        <div>
          <div 
            className="explorer-folder" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
            {isOpen ? 
              <FaFolderOpen style={{ color: "#dcb67a" }} /> : 
              <FaFolder style={{ color: "#dcb67a" }} />
            }
            <span>Naisarg's Portfolio</span>
          </div>
          
          {isOpen && (
            <div className="folder-contents">
              {files.map((file, index) => (
                <div 
                  key={index} 
                  className="explorer-file"
                  style={{ paddingLeft: '16px' }}
                >
                  <span className="file-icon">{file.icon}</span>
                  <span>{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div 
        className="resize-handle"
        ref={resizeRef}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}

export default Explorer;