import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  right: 5px;
  top: 15px;
  width: auto;
  height: 25px;
  background-color: #f1f1f1;
  border: 1px solid #cccccc;
  padding: 5px;
  font-size: 8pt;
  text-align: right;

  p {
    margin: 1px;
  }

  p:first-child {
    font-weight: bold;
  }
`

const MetaLabel = ({fileName, size}) => {

  return (
    <Container>
      <p>{fileName}</p>
      <p>{size} total records</p>
    </Container>
  )
}

export default MetaLabel;