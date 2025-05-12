import './App.css';
import TopBar from './components/TopBar/TopBar';
import LeftSideBar from './components/LeftSideBar/LeftSideBar';
import Footer from './components/Footer/Footer';
import data from './data/data.json'

function App() {
  return (
    <div className="App">
      <TopBar/>
      <LeftSideBar/>
      <Footer github={data.contact.github} />
    </div>
  );
}
export default App;
