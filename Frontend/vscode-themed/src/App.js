import React, { useEffect } from "react";
import "./App.css";
import TopBar from "./components/TopBar/TopBar";
import LeftSideBar from "./components/LeftSideBar/LeftSideBar";
import Footer from "./components/Footer/Footer";
import { portfolioConfig } from "./config/portfolioConfig";
import Explorer from "./components/Explorer/Explorer";
import Content from "./components/Content/Content";
import { AppProvider } from "./context/AppContext";

function App() {
  // Global scroll listener for auto-hiding mobile scrollbars
  useEffect(() => {
    let scrollTimeout;
    
    const handleScroll = () => {
      document.body.classList.add('is-scrolling');
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 2500); // Hide after 2.5 seconds of inactivity
    };

    // Use capture phase to catch scrolls on any child element
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      clearTimeout(scrollTimeout);
      document.body.classList.remove('is-scrolling');
    };
  }, []);

  return (
    <div className="App">
      <AppProvider>
        <TopBar />
        <div className="main-container">
          <LeftSideBar
            github={portfolioConfig.personal.github}
            linkedin={portfolioConfig.personal.linkedin}
          />
          <Explorer />
          <Content />
        </div>
        <Footer github={portfolioConfig.personal.github} />
      </AppProvider>
    </div>
  );
}
export default App;
