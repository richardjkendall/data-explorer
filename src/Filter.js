import React from 'react';
import styled from 'styled-components';

import { RoundNumberForDisplay } from './Utils';

const Container = styled.div`
  width: 180px;
  height: 190px;
  background-color: #e1e1e1;
  border: 1px solid #cccccc;
  padding: 5px;
  margin-right: 5px;

  select {
    font-size: 8pt;
    padding: 0px;
    margin: 0px;
    margin-bottom: 3px;
    max-width: 100%;
    border: 1px solid #cccccc;
  }
  
  button {
    font-size: 8pt;
  }

  table p {
    font-size: 8pt;
    padding: 0px;
    margin: 0px;
  }
`

const ListOfOptions = styled.div.attrs(props => ({
  style: {
    height: props.fullHeight ? "140px" : "100px"
  }
}))`
  width: calc(100% - 6px);
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

const Filter = ({id, fields, availableOptions, selectedField, selectedOptions, changeField, changeSelection, deleteFilter, stats}) => {
  const filterStats = stats.filter(s => s.forId === id);
  return (
    <Container>
      <select onChange={e => changeField(id, e.target.value)} value={selectedField}>
        {fields.sort().map(f => <option value={f} key={f}>{f}</option>)}
      </select>
      <ListOfOptions fullHeight={!filterStats.length > 0}>
        {selectedField !== "" && availableOptions[selectedField].map(o => o === "" || o === null ? "(blank)" : o).sort().map(o => {
          return(
            <div key={o}>
              <input type="checkbox" id={o} checked={selectedOptions.includes(o)} onChange={e => changeSelection(id, e.target.id, e.target.checked)}/>
              <label htmlFor={o}>{o}</label>
            </div>
          )
        })}
      </ListOfOptions>
      {filterStats.length > 0 &&<table>
        <tbody>
          <tr>
            <td><p>Matching</p></td>
            <td><p>{filterStats[0].withinContext} ({RoundNumberForDisplay(filterStats[0].withinContextP * 100, 1)}%)</p></td>
          </tr>
          <tr>
            <td><p>Eliminated</p></td>
            <td><p>{filterStats[0].eliminated} ({RoundNumberForDisplay(filterStats[0].eliminatedP * 100, 1)}%)</p></td>
          </tr>
        </tbody>
      </table>}
      <button onClick={e => deleteFilter(id)}>Delete</button>
    </Container>
  )
}

export default Filter;