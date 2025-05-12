import logo from './logo.svg';
import './App.css';
import TopBar from './components/TopBar/TopBar';
import LeftSideBar from './components/LeftSideBar/LeftSideBar';

function App() {
  return (
    <div className="App">
      <TopBar/>
      <LeftSideBar/>
    </div>
  );
}
export default App;
