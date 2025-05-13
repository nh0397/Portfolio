import './App.css';
import TopBar from './components/TopBar/TopBar';
import LeftSideBar from './components/LeftSideBar/LeftSideBar';
import Footer from './components/Footer/Footer';
import data from './data/data.json'
import Explorer from './components/Explorer/Explorer';
import Content from './components/Content/Content';

function App() {
  return (
    <div className="App">
      <TopBar/>
      <LeftSideBar/>
      <Explorer />
      <Content /> 
      <Footer github={data.contact.github} />
    </div>
  );
}
export default App;
