import React, { useState, useEffect, useContext } from "react";
import "./Home.css";
import profilePic from "../../../assets/images/Photo.jpeg";
import { AppContext } from "../../../context/AppContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function Home() {
  const { homeVisited, setHomeVisited } = useContext(AppContext);
  const [animationsComplete, setAnimationsComplete] = useState(homeVisited);
  const {activeFile, setActiveFile} = useContext(AppContext)
  const developerInfo = {
    name: "Naisarg Halvadiya",
    role: "AI Engineer | Software + Data",
    bio: "Transforming insights into impact: A data-savvy software engineer passionate about solving real-world problems using AI."
  };

  const codeString = `const HomePage = () => {
  const [isLoaded, setIsLoaded] = useState(true);
  const developerInfo = {
    name: 'Naisarg Halvadiya',
    role: 'AI Engineer | Software + Data',
    bio: 'Building modern web experiences'
  };

  useEffect(() => {
    document.title = \`\${developerInfo.name} | Portfolio\`;
    setIsLoaded(true);
  }, []);

  return (
    <main className=\"hero-container\">
      <h1>{developerInfo.name}</h1>
      <p>{developerInfo.role}</p>
      <div className=\"cta\">
        <Link href=\"/about\">Know More About Me</Link>
      </div>
    </main>
  );
};`;

  const [typedCode, setTypedCode] = useState(() =>
    homeVisited ? codeString : ""
  );

  // Typewriter effect on first visit only
  useEffect(() => {
    if (!homeVisited) {
      let currentIndex = 0;
      const typeSpeed = 20;

      const typeInterval = setInterval(() => {
        if (currentIndex < codeString.length) {
          setTypedCode((prev) => prev + codeString.charAt(currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setTypedCode(codeString); // ensure full code appears
          
          // Add delay before marking as visited to let animations complete
          setTimeout(() => {
            setHomeVisited(true);
            setAnimationsComplete(true);
          }, 1000);
        }
      }, typeSpeed);

      return () => clearInterval(typeInterval);
    } else {
      setTypedCode(codeString); // skip typing on revisit
      setAnimationsComplete(true);
    }
  }, [homeVisited, codeString, setHomeVisited]);

  return (
    <main className="hero-container">
      <div className={`hero-content ${!animationsComplete ? "fade-in" : ""}`}>
        <div className="hero-left">
          <div className="profile-container">
            <img
              src={profilePic}
              alt={developerInfo.name}
              className="profile-photo"
            />
          </div>
          <div className={`hero-text ${!animationsComplete ? "slideUp" : ""}`}>
            <h1 className="gradient-text">{developerInfo.name}</h1>
            <h2>{developerInfo.role}</h2>
            <p>{developerInfo.bio}</p>
            <div className={`cta ${!animationsComplete ? "fadeIn" : ""}`}>
              <div
                className={`cta-button ${!animationsComplete ? "buttonGlow" : ""}`}
                onClick={() => setActiveFile(2)}
              >
                Know More About Me <span>→</span>
              </div>
            </div>
          </div>
        </div>

        <div className="code-editor">
          <div className="editor-header">
            <div className="editor-tabs">
              <div className="editor-tab active">Home.jsx</div>
            </div>
          </div>
          <SyntaxHighlighter
            language="jsx"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: "0 0 4px 4px",
              padding: "1rem",
              height: "100%",
              fontSize: "14px",
              backgroundColor: "#1e1e1e"
            }}
            showLineNumbers={true}
            lineNumberStyle={{
              minWidth: "2.5em",
              paddingRight: "1em",
              color: "#858585",
              textAlign: "right"
            }}
          >
            {typedCode}
          </SyntaxHighlighter>
        </div>
      </div>
    </main>
  );
}

export default Home;