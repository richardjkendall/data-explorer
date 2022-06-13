import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  right: 30px;
  top: 20px;
  width: 190px;
  height: 20px;
  border-radius: 5px;
  background-color: limegreen;
  color: #ffffff;
  font-size: 10pt;
  padding: 5px;
  text-align: center;
  font-weight: bold;
`

const MetaLabel = ({title}) => {

  return (
    <Container>
      {title}
    </Container>
  )
}

export default MetaLabel;