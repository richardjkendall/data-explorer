import React from 'react';
import styled from 'styled-components';

import Modal from './Modal';

const Container = styled.div`
  width: 500px;
  height: 300px;

  h1 {
    margin-top: 0px;
  }
`

const ListOfOptions = styled.div`
  width: calc(100% - 6px);
  height: calc(100% - 40px);
  border: 1px solid #cccccc;
  background-color: white;
  padding: 2px;
  overflow-y: scroll;

  text-overflow: ellipsis;
  white-space: nowrap;
  overflow-x: hidden;

  label {
    font-size: 8pt;
  }
`

const FieldSelector = ({show, fields, filtered, selected, close, selectField}) => {
  return (
    <Modal
      show={show}
      allowBackgroundClose
      close={close}
    >
      <Container>
        <h1>Fields to Show</h1>
        <ListOfOptions>
          {
            fields.sort().map(f => {
              return (
                <div key={f}>
                  <input 
                    type="checkbox" 
                    id={f} 
                    checked={filtered.includes(f) || selected.includes(f)} 
                    disabled={filtered.includes(f)} 
                    onChange={(e) => selectField(e.target.id, e.target.checked)}
                  />
                  <label htmlFor={f}>{f}</label>
                </div>
              )
            })
          }
        </ListOfOptions>
      </Container>
    </Modal>
  )
}

export default FieldSelector;