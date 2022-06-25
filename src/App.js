import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import './App.css';
import MainView from './MainView';

import icircle from './images/information.png';
import og from './images/og.png';

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

const PageTitle = "Data Explorer";
const PageDesc = "Data explorer for local data investigation";

function App() {
  return (
    <div className="App">
      <Helmet>
        <html lang="en" />
        <title>{PageTitle}</title>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1" 
        />
        <meta
          name="description"
          content={PageDesc}
        />
        <meta
          name="og:description"
          content={PageDesc}
        />
        <meta
          name="og:title"
          content={PageTitle}
        />
        <meta
          name="twitter:description"
          content={PageDesc}
        />
        <meta
          name="twitter:title"
          content={PageTitle}
        />
        <meta
          name="og:description"
          content={PageDesc}
        />
        <meta
          name="og:image"
          content={og}
        />
        <meta
          name="og:description"
          content={PageDesc}
        />
        <meta
          name="twitter:image"
          content={og}
        />
      </Helmet>
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
