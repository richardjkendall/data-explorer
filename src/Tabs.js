import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ButtonTray = styled.div`
  margin: 5px;

  button:not(:first-child) {
    margin-left: 5px;
  }
`

const Tabs = ({defaultTab, children}) => {
  const [buttons, setButtons] = useState([]);
  const [selected, setSelected] = useState("");
  const [displayed, setDisplayed] = useState([]);

  const switchSelected = (name) => {
    setSelected(name);
  }

  useEffect(() => {
    setSelected(defaultTab);
  }, [defaultTab])

  useEffect(() => {
    const nav = React.Children.map(children, (c) => <button disabled={selected === c.props.name} onClick={switchSelected.bind(null, c.props.name)}>{c.props.name}</button>)
    setButtons(nav);
  }, [children, selected]);

  useEffect(() => {
    setDisplayed(
      React.Children.toArray(children).filter(c => c.props.name === selected)[0]
    );
  }, [selected, children])

  return (
    <div>
      <ButtonTray>
        {buttons}
      </ButtonTray>
      {displayed}
    </div>
  )
}

export default Tabs;