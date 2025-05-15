import "./App.css";
import TopBar from "./components/TopBar/TopBar";
import LeftSideBar from "./components/LeftSideBar/LeftSideBar";
import Footer from "./components/Footer/Footer";
import data from "./data/data.json";
import Explorer from "./components/Explorer/Explorer";
import Content from "./components/Content/Content";
import { AppProvider } from "./context/AppContext";

function App() {
  return (
    <div className="App">
      <AppProvider>
        <TopBar />
        <LeftSideBar
          github={data.contact.github}
          linkedin={data.contact.linkedin}
        />
        <Explorer />
        <Content />
        <Footer github={data.contact.github} />
      </AppProvider>
    </div>
  );
}
export default App;
