import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from "react";
import "./Explorer.css";
import {
  FaJs,
  FaHtml5,
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaFolderOpen,
  FaReact,
} from "react-icons/fa";
import { VscTerminalPowershell } from "react-icons/vsc";
import { SiCsswizardry } from "react-icons/si";
import { AppContext } from "../../context/AppContext";

function Explorer() {
  const [isOpen, setIsOpen] = useState(true);
  const [width, setWidth] = useState(250);
  const resizeRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const { activeFile, setActiveFile } = useContext(AppContext);

  // Your original files
  const files = [
    { no: 1, name: "home.jsx", icon: <FaReact style={{ color: "#61DBFB" }} /> },
    {
      no: 2,
      name: "about.html",
      icon: <FaHtml5 style={{ color: "#e34c26" }} />,
    },
    { no: 3, name: "projects.js", icon: <FaJs style={{ color: "#f7df1e" }} /> },
    {
      no: 4,
      name: "experience.css",
      icon: <SiCsswizardry style={{ color: "#2965f1" }} />,
    },
    {
      no: 5,
      name: "contact.sh",
      icon: <VscTerminalPowershell style={{ color: "#7fdbff" }} />,
    },
  ];


  const handleMouseDown = (e) => {
    setIsResizing(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth > 100 && newWidth < 300) {
        setWidth(newWidth);
      }
    },
    [isResizing]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

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
          <button 
            className="explorer-folder" 
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} portfolio folder`}
          >
            {isOpen ? (
              <FaChevronDown size={10} aria-hidden="true" />
            ) : (
              <FaChevronRight size={10} aria-hidden="true" />
            )}
            {isOpen ? (
              <FaFolderOpen style={{ color: "#dcb67a" }} aria-hidden="true" />
            ) : (
              <FaFolder style={{ color: "#dcb67a" }} aria-hidden="true" />
            )}
            <span>Naisarg's Portfolio</span>
          </button>

          {isOpen && (
            <div className="folder-contents" role="list">
              {files.map((file, index) => (
                <button
                  key={index}
                  role="listitem"
                  className={`explorer-file ${file.no === activeFile ? 'selected-explorer' : ''}`}
                  style={{ paddingLeft: "16px" }}
                  onClick={() => setActiveFile(file.no)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveFile(file.no);
                    }
                  }}
                  aria-label={`Open ${file.name}`}
                  aria-current={file.no === activeFile ? 'page' : undefined}
                >
                  <span className="file-icon" aria-hidden="true">{file.icon}</span>
                  <span>{file.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className="resize-handle"
        ref={resizeRef}
        onMouseDown={handleMouseDown}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize explorer panel"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const newWidth = e.key === 'ArrowLeft' ? width - 10 : width + 10;
            if (newWidth > 100 && newWidth < 300) {
              setWidth(newWidth);
            }
          }
        }}
      />
    </div>
  );
}

export default Explorer;
