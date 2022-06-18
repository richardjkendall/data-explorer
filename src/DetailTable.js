import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2px;

  table {
    font-size: 8pt;
    width: 100%;
    max-width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }

  table tr {
    border-bottom: 1px solid #cccccc;
  }

  tr:first-child>th {
    position: sticky;
    top: 0;
    background-color: grey;
  }

  table td, th {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    padding: 8px 8px;
    text-align: left;
    vertical-align: top;
    display: table-cell;
    border: 0;
  }

  table td:first-child, th:first-child {
    padding-left: 16px;
  }

  table th {
    font-weight: bold;
    text-overflow: ellipsis;
    overflow: hidden;
    background-color: grey;
    color: white;
  }

  tr:nth-child(odd) {
    background-color: #ffffff;
  }

  tr:nth-child(even) {
    background-color: #f1f1f1;
  }

  table tr:hover td {
    background-color: #cccccc;
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