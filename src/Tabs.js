import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Box = styled.div`
  border: 1px solid #cccccc;
`

const ButtonTray = styled.div`
  color: #000000;
  background-color: #f1f1f1;
  border-bottom: 1px solid #cccccc;

  &::before {
    content: "";
    display: table;
    clear: both;
  }

  &::after {
    content: "";
    display: table;
    clear: both;
  }

  button {
    padding: 8px 16px;
    width: auto;
    border: none;
    display: block;
    outline: 0;
    float: left;
  }

  button:disabled {
    color: #ffffff;
    background-color: #616161;
  }

  button:not(:disabled):hover {
    background-color: #cccccc;
    cursor: pointer;
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
    <Box>
      <ButtonTray>
        {buttons}
      </ButtonTray>
      {displayed}
    </Box>
  )
}

export default Tabs;