import React, { useState } from 'react';
import styled from 'styled-components';

import { RoundNumberForDisplay } from './Utils';

const Container = styled.div`
  width: 180px;
  height: 190px;
  background-color: #e1e1e1;
  border: 1px solid #cccccc;
  padding: 5px;
  margin-right: 5px;

  &[data-highlight="yes"] {
    border: 3px solid #000000;
  }

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
    border-radius: 2px;
    background-color: #ffffff;
    border: 1px solid #2196f3;
  }

  button:hover {
    background-color: #f1f1f1;
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

const Filter = ({id, pos, count, fields, availableOptions, selectedField, selectedOptions, changeField, changeSelection, selectAll, clearAll, deleteFilter, stats, highlight, setHighlight, moveFilter}) => {
  const [newPos, setNewPos] = useState(pos);
  
  const filterStats = stats.filter(s => s.forId === id);

  const onDrag = (e) => {
    const rect = e.target.getBoundingClientRect();

    // this stops the 'jump' at the end of the drag
    if (e.clientX > 0 && e.clientY > 0) {
      // find where we are moving
      const leftEdgeOffset = e.nativeEvent.offsetX; 
      // if we are moving left we need to move the array position backwards
      if(leftEdgeOffset < 0) {
        const arrayOffset = -Math.ceil(Math.abs(leftEdgeOffset / rect.width));
        const newArrayPosition = pos + arrayOffset;
        setHighlight(newArrayPosition >= 0 ? newArrayPosition : 0);
        setNewPos(newArrayPosition >= 0 ? newArrayPosition : 0);
      }
      // if we are moving right we need to move the array position forwards
      if(leftEdgeOffset > 0) {
        const arrayOffset = Math.floor(Math.abs(leftEdgeOffset / rect.width));
        const newArrayPosition = pos + arrayOffset;
        setHighlight(newArrayPosition > count-1 ? count-1 : newArrayPosition);
        setNewPos(newArrayPosition > count-1 ? count-1 : newArrayPosition);
      }
      
    }
  }

  const onDragEnd = (e) => {
    console.log("end of drag, swap from", pos, "to", newPos)
    setHighlight(-1);
    moveFilter(pos, newPos);
  }

  return (
    <Container draggable={true} onDragEnd={onDragEnd} onDrag={onDrag} data-highlight={highlight ? "yes" : "no"}>
      <select onChange={e => changeField(id, e.target.value)} value={selectedField}>
        {fields.sort().map(f => <option value={f} key={f}>{f}</option>)}
      </select>
      <ListOfOptions fullHeight={!filterStats.length > 0}>
        {selectedField !== "" && availableOptions[selectedField].map(o => o === "" || o === null ? "(blank)" : o).sort().map((o,i) => {
          return(
            <div key={o}>
              <input 
                type="checkbox" 
                id={o} 
                checked={selectedOptions.includes(o)} 
                onChange={e => changeSelection(id, e.target.id, e.target.checked)}
              />
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
      <button 
        disabled={selectedField === ""} 
        onClick={e => selectAll(id, availableOptions[selectedField].map(o => o === "" || o === null ? "(blank)" : o))}
      >All</button>
      <button 
        disabled={selectedField === ""}
        onClick={e => clearAll(id)}
      >Clear</button>
    </Container>
  )
}

export default Filter;