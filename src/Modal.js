import React from 'react';
import styled from 'styled-components';

const Blockout = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  background: rgba(51, 51, 51, 0.7);
  z-index: 100;
`

const CentreBox = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  padding: 10px;
  z-index: 110;

  h1 {
    margin: 0px;
    padding: 0px;
    font-size: 14pt;
    margin-top: 10px;
    margin-bottom: 10px;
  }
`

const Modal = (props) => {

  const CloseBox = (reason) => {
    props.close(reason);
  }

  const SwallowClick = (e) => {
    e.stopPropagation();
  }

  return (
    props.show && <Blockout onClick={props.allowBackgroundClose && CloseBox.bind(null, "cancel")}>
      <CentreBox onClick={SwallowClick}>
        {props.children}
      </CentreBox>
    </Blockout>
  )
}

export default Modal;