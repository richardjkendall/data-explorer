import React from 'react';

import Modal from './Modal';

const Loading = ({showLoading, message}) => {
  return (
    <Modal
      show={showLoading}
    >
      <p>Loading...</p>
    </Modal>
  )
}

export default Loading;