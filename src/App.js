import styled from 'styled-components';
import './App.css';
import MainView from './MainView';

import icircle from './images/information.png';

const Header = styled.div`
  display: flex;

  h1 {
    position: relative;
  }

  img {
    height: 32px;
    width: 32px;
    padding: 5px;
    padding-left: 10px;
    cursor: pointer;
  }

`

function App() {
  return (
    <div className="App">
      <Header>
        <h1>Data Explorer</h1> 
        <img style={{width: "32px"}} src={icircle}
          onClick={() => {
            window.open("https://github.com/richardjkendall/data-explorer", "_blank");
          }}
        />
      </Header>
      <MainView />
    </div>
  );
}

export default App;
