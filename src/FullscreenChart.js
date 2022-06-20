import React from 'react';
import styled from 'styled-components';
import InjectContainerSize from './InjectContainerSize';

import Modal from './Modal';

const Container = styled.div`
  width: 80vw;
  height: 80vh;

  h1 {
    margin-top: 0px;
  }
`

const FullscreenChart = ({show, close, children}) => {
  return (
    <Modal
      show={show}
      allowBackgroundClose
      close={close}
    >
      <Container>
        <InjectContainerSize>
          {children}
        </InjectContainerSize>
      </Container>
    </Modal>
  )
}

export default FullscreenChart;