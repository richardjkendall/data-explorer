import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  table {
    font-size: 8pt;
    width: 100%;
    max-width: 100%;
    table-layout: fixed;
  }

  tr:first-child>th {
    position: sticky;
    top: 0;
    background-color: grey;
  }

  table td {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  table th {
    font-weight: bold;
    text-overflow: ellipsis;
    overflow: hidden;
    background-color: grey;
    color: white;
  }

  tr:nth-child(odd) {
    background-color: #efefef;
  }

  table tr:hover td {
    background-color: #ffffcc;
  }
`

const DetailTable = ({data, columns, search = ""}) => {
  const tableRows = data
  .map(row => {
    const tableCells = columns.map(column => <td key={"row_" + row.__sys_id + "_col_" + column}>{row[column]}</td>);
    return(
      <tr key={"row_" + row.__sys_id}>{tableCells}</tr>
    )
  });
  const tableHeaders = columns.map(column => <th key={column}>{column}</th>);
  return(
    <Container>
      <table>
        <thead>
          <tr>
            {tableHeaders}
          </tr>
        </thead>
        <tbody>
          {tableRows}
        </tbody>
      </table>
    </Container>
  );
}

export default DetailTable;