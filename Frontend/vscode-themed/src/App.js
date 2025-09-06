import "./App.css";
import TopBar from "./components/TopBar/TopBar";
import LeftSideBar from "./components/LeftSideBar/LeftSideBar";
import Footer from "./components/Footer/Footer";
import { portfolioConfig } from "./config/portfolioConfig";
import Explorer from "./components/Explorer/Explorer";
import Content from "./components/Content/Content";
import { AppProvider } from "./context/AppContext";

function App() {
  return (
    <div className="App">
      <AppProvider>
        <TopBar />
        <LeftSideBar
          github={portfolioConfig.personal.github}
          linkedin={portfolioConfig.personal.linkedin}
        />
        <Explorer />
        <Content />
        <Footer github={portfolioConfig.personal.github} />
      </AppProvider>
    </div>
  );
}
export default App;
