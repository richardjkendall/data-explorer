import React, { useEffect, useState, useRef } from 'react';
import * as d3 from "d3"; 
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import jp from 'jsonpath';
import * as htmlToImage from 'html-to-image';

import Filter from './Filter';
import { FilterDataSetWithIndex,  saveToCsv, GetStats } from './Utils';
import DetailTable from './DetailTable';
import Waterfall from './Waterfall';
import Sankey from './Sankey';
import Tabs from './Tabs';
import TabContent from './TabContent';
import InjectContainerSize from './InjectContainerSize';
import MetaLabel from './MetaLabel';
import ErrorDisplay from './ErrorDisplay';
import Loading from './Loading';
import FieldSelector from './FieldSelector';

import copy from './images/copy.png';
import expand from './images/expand.png';
import FullscreenChart from './FullscreenChart';

// ControlPanel is the area at the top where the filters are placed
// may be extended in the future hence being called ControlPanel
const ControlPanel = styled.div`
  height: 222px;
  background-color: #f1f1f1;
  padding: 10px;
  margin-bottom: 5px;
  border: 1px solid #cccccc;
`

// ControlTitle is the title of the control panel, at the moment it says 'Filters'
const ControlTitle = styled.p`
  margin: 0px;
  padding: 0px;
  font-size: 10pt;
  font-weight: bold;
`

// Filters is a list of filters that have been configured by the user
// it will show a scroll bar if the number of filters causes an overflow
const Filters = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  width: 100%;
  padding-top: 5px;
  overflow-y: auto;

  button {
    border-radius: 2px;
    background-color: #ffffff;
    border: 1px solid #2196f3;
  }

  button:hover {
    background-color: #f1f1f1;
  }
`

// VisualGrid shows grid of data visualisations two per row
const VisualGrid = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
`

// these are the Visuals which go in the visual grid
const Visual = styled.div`
  flex-grow: 1;
  width: calc(50% - 10px);
  height: 600px;
  margin: 5px;

  &:not(:first-child) {
    margin-left: 0px;
  }
`

const TitleBar = styled.div`
  color: #000000;
  background-color: #f1f1f1;
  border: 1px solid #cccccc;

  &::before {
    content: "";
    display: table;
    clear: both;
  }

  &::after {
    content: "";
    display: table;
    clear: both;
  }
`

const TitleItemLeft = styled.div`
  color: #000000;
  font-size: 10pt;
  font-weight: bold;
  padding: 8px 16px;
  float: left;
  display: block;
  outline: 0;
`

const TitleItemRight = styled.div`
  color: #000000;
  font-size: 10pt;
  font-weight: bold;
  padding: 8px 16px;
  float: right;
  display: block;
  outline: 0;
`

const ItalicMessage = styled.p`
  padding-left: 16px;
  font-style: italic;
`

const ImgButton = styled.img`
  width: 14px;
  height: 14px;
  margin-left: 10px;

  &:hover {
    background-color: #efefef;
    cursor: pointer;
  }
`

const FieldDisplayToolbar = styled.div`
  padding: 5px;
  padding-bottom: 0px;
  display: flex;
  justify-content: left;
  align-items: center;

  p {
    margin: 0px;
    font-size: 10pt;
    padding-right: 5px;
  }

  button {
    margin-right: 5px;
    border-radius: 2px;
    background-color: #ffffff;
    border: 1px solid #2196f3;
  }

  button:hover {
    background-color: #f1f1f1;
  }
`

const MainView = () => {
  /* refs */
  const errorRef = useRef();        // reference to the error display module
  const sankeyRef = useRef();       // reference to the sankey chart
  const largeSankeyRef = useRef();  // reference to the large sankey chart

  /* places to store state */
  const [loading, setLoading] = useState(false);                          // should the loading box be open
  const [showFieldSelector, setShowFieldSelector] = useState(false);      // show the field selector box be open
  const [showLargeSankey, setShowLargeSankey] = useState(false);          // show the large sankey diagram
  const [sankeyShowBlackhole, setSankeyShowBlackhole] = useState(false);  // should we show the sankey blackhole nodes/links
  const [allData, setAllData] = useState([]);                             // this is all the raw data as loaded
  const [dataHash, setDataHash] = useState({});                           // this is the raw data organised as a hash with the key being the __sys_id (row ID)
  const [dataStats, setDataStats] = useState({});                         // this is the stats about the data (unique values and matching row ids)
  const [fieldNames, setFieldNames] = useState([]);                       // list of field names
  const [distinctVals, setDistinctVals] = useState({});                   // hash of unique values by field, key is field name
  const [filters, setFilters] = useState([]);                             // filters that have been created
  const [dispData, setDispData] = useState([]);                           // this is the data which matches the filters
  const [filterStats, setFilterStats] = useState([]);                     // these are the stats from the filtering process
  const [fileName, setFileName] = useState("");                           // name of the loaded file
  const [fieldsToShow, setFieldsToShow] = useState([]);                   // list of fields to display
  const [sankeyData, setSankeyData] = useState({                          // data used to render the Sankey diagram
    nodes: [],
    links: []
  });        

  // need to process data once loaded
  useEffect(() => {
    if(allData.length > 0) {
      setLoading(true);
      const stats = GetStats(allData);
      console.log("stats", stats);
      setFieldNames(Object.keys(stats));
      setDistinctVals(
        Object.keys(stats).reduce((p, c) => {
          return {...p, [c]: Object.keys(stats[c].uniqueValues)};
        }, {})
      );
      setDataHash(
        allData.reduce((p, c) => {
          return {...p, [c.__sys_id]: c}
        }, {})
      );
      setDataStats(stats);
      setLoading(false);
    }
  }, [allData]);

  // need to filter data and display if the filters have changed
  useEffect(() => {
    const [subset, stats] = FilterDataSetWithIndex(dataHash, dataStats, filters);
    //console.log("filter stats", stats);
    setDispData(subset);
    setFilterStats(stats);
    let sankey = {
      nodes: [],
      links: []
    }
    if(filters.length > 1) {
      filters.forEach((f, i) => {
        f.options.forEach(o => {
          sankey.nodes.push(f.field + "~" + o);
        });
        if(i > 0 && f.field !== "" && f.options.length > 0) {
          sankey.nodes.push(f.field + "~blackhole");
        }
      })
      //console.log("sankey nodes", sankey.nodes);
      stats.slice(1).forEach((s, i) => {
        Object.keys(s.fromToMap).forEach(fk => {
          const from = filters[i].field + "~" + fk;
          Object.keys(s.fromToMap[fk]).forEach(tk => {
            const to = filters[i+1].field + "~" + tk;
            //console.log("link: from", sankey.nodes.indexOf(from), "to", sankey.nodes.indexOf(to), "value", s.fromToMap[fk][tk]);
            sankey.links.push({
              source: sankey.nodes.indexOf(from),
              target: sankey.nodes.indexOf(to),
              value: s.fromToMap[fk][tk]
            });
          });
        });        
      })
    }
    // convert nodes to expected format
    sankey.nodes = sankey.nodes.map(n => {
      return {
        name: n,
        displayName: n.split("~")[1],
        category: n.split("~")[0]
      }
    });
    setSankeyData(sankey);
  }, [filters, dataHash, dataStats])

  const addFilter = () => {
    setFilters([
      ...filters,
      {
        id: uuidv4(),
        field: "",
        options: []
      }
    ])
  }

  const selectField = (id, field) => {
    setFilters(filters.map(f => {
      if(f.id === id) {
        return {
          ...f,
          field: field,
          options: []
        }
      } else {
        return f;
      }
    }));
  }

  const deleteFilter = (id) => {
    setFilters(filters.filter(f => f.id !== id));
  }

  const changeOption = (id, option, added) => {
    setFilters(filters.map(f => {
      if(f.id === id) {
        return {
          ...f,
          options: added ? f.options.concat([option]) : f.options.filter(o => o !== option)
        }
      } else {
        return f;
      }
    }));
  }

  const loadJson = (content) => {
    try {
      const parsed = JSON.parse(content);
      setAllData(parsed);
    } catch (err) {
      console.log("hit error in JSON parse", err);
      errorRef.current.addError(`Could not read file: ${err.message}`);
    }
  }

  // TODO: need to catch errors on loading
  const loadCsv = (content) => {
    const parsed = d3.csvParse(content);
    setAllData(parsed);
  }

  const openFile = (e) => {
    setLoading(true);
    const file = e.target.files[0];
    if(!file) {
      errorRef.current.addError("No file selected");
      setLoading(false);
      return;
    }
    const fileType = file.type;
    const fileName = file.name;
    console.log("openFile", fileName, fileType);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const dataUrlbits = dataUrl.split(",");
      if(dataUrlbits.length > 1) {
        const content = atob(dataUrlbits[1]);
        switch(fileType) {
          case "application/json":
            // this is a JSON file
            setFileName(fileName);
            loadJson(content);
            break;
          case "text/csv":
            // this is a CSV file
            setFileName(fileName);
            loadCsv(content);
            break;
          default:
            errorRef.current.addError(`File type of ${fileType} is not supported.`);
            return;
        }
      } else {
        errorRef.current.addError(`Error reading ${fileName}`);
        return;
      }
      setLoading(false);
    }
    reader.readAsDataURL(file);
  }

  const domElementToClipboard = (element) => {
    console.log("copying chart to clipboard", element);
    htmlToImage.toBlob(element)
    .then(blob => {
      navigator.clipboard.write([
        new window.ClipboardItem(
          Object.defineProperty({}, blob.type, {
            value: blob,
            enumerable: true
          })
        )
      ]).then(() => {
        console.log("copied to clipboard");
      });
    });
  }

  return (
    <div>
      <ErrorDisplay ref={errorRef} displayLength={10} />
      <FieldSelector 
        show={showFieldSelector} 
        close={() => setShowFieldSelector(false)}
        fields={fieldNames.filter(f => f !== "__sys_id")}
        filtered={filters.filter(f => f.options.length > 0).map(f => f.field)}
        selected={fieldsToShow}
        selectField={(id, selected) => {
          if(selected) {
            // need to add it
            setFieldsToShow(fieldsToShow.concat([id]));
          } else {
            setFieldsToShow(fieldsToShow.filter(f => f !== id));
          }
        }}
      />
      <Loading
        showLoading={loading}
      />
      {allData.length === 0 &&
      <div>
        <p>To get started open a JSON or CSV file from your computer.</p>
        <p>All the data is processed locally and not uploaded to the server.  If you don't believe me, then you can run this app for yourself by following the instructions here: <a href="https://github.com/richardjkendall/data-explorer">https://github.com/richardjkendall/data-explorer</a></p>
        <input onChange={openFile} type="file" />
      </div>}
      {allData.length > 0 &&
      <div>
        {fileName !== "" && <MetaLabel title={fileName} />}
        <ControlPanel>
          <ControlTitle>Filters</ControlTitle>
          <Filters>
            {filters.map((f, i) => <Filter 
              key={f.id}
              id={f.id}
              fields={["", ...fieldNames.filter(f => f !== "__sys_id")]} 
              availableOptions={distinctVals} 
              selectedField={f.field} 
              selectedOptions={f.options} 
              changeField={selectField}
              changeSelection={changeOption}
              deleteFilter={deleteFilter}
              stats={filterStats}
            />)}
            <button disabled={filters.length > 0 && filters.slice(-1).pop().options.length === 0} onClick={addFilter}>+</button>
          </Filters>
        </ControlPanel>
        <Tabs defaultTab="Statistics">
          <TabContent name="Statistics">
            <DetailTable
              data={Object.entries(dataStats).filter(d => d[1].fieldName !== "__sys_id").map((s, i) => {
                return {
                  "__sys_id": "attr_" + i,
                  "Field Name": s[1].fieldName,
                  "Field Type": s[1].fieldType,
                  "Index Type": s[1].indexType,
                  "Unique Values": jp.query(s[1], "$.uniqueValues[*]").length,
                }
              })}
              columns={[
                "Field Name",
                "Field Type",
                "Index Type",
                "Unique Values"
              ]}
            />
          </TabContent>
          <TabContent name="Visualisations">
            <VisualGrid>
              <Visual>
                <TitleBar>
                  <TitleItemLeft>Filter Dynamics</TitleItemLeft>
                  <TitleItemRight>
                    <ImgButton src={expand} onClick={() => setShowLargeSankey(true)}/>
                    <ImgButton src={copy} onClick={() => {
                      domElementToClipboard(sankeyRef.current);
                    }} />
                  </TitleItemRight>
                </TitleBar>
                {sankeyData.nodes.length > 0 && sankeyData.links.length > 0 ? 
                <InjectContainerSize heightBuffer={60}>
                  <Sankey
                    data={sankeyData}
                    width={500}
                    height={500}
                    margin={10}
                    hideBlackhole={!sankeyShowBlackhole}
                    ref={sankeyRef}
                  />
                </InjectContainerSize> : <ItalicMessage>You need to select at least two filters</ItalicMessage>}
                <FullscreenChart 
                  show={showLargeSankey}
                  close={() => setShowLargeSankey(false)}
                >
                  <Sankey
                    data={sankeyData}
                    width={500}
                    height={500}
                    margin={10}
                    hideBlackhole={!sankeyShowBlackhole}
                    ref={largeSankeyRef}
                  />
                </FullscreenChart>
                {sankeyData.nodes.length > 0 && sankeyData.links.length > 0 && 
                <div>
                  <input
                    id="sankeyShowBlackhole"
                    type="checkbox"
                    checked={sankeyShowBlackhole}
                    onChange={
                      (e) => setSankeyShowBlackhole(e.target.checked)
                    }
                  />
                  <label htmlFor="sankeyShowBlackhole">Show flows to blackholes</label>
                </div>}
              </Visual>
              <Visual>
                <TitleBar>
                  <TitleItemLeft>Data Waterfall</TitleItemLeft>
                  <TitleItemRight>
                    <ImgButton src={expand} />
                    <ImgButton src={copy} />
                  </TitleItemRight>
                </TitleBar>
                <InjectContainerSize heightBuffer={70}>
                  {filters.filter(f => f.options.length > 0).length > 0 ? <Waterfall
                    margin={20}
                    width={500}
                    height={500}
                    endName="Final Set"
                    data={[{
                      group: "Initial Set",
                      start: allData.length
                    },
                    ...filterStats.map(s => {
                      return {
                        // TODO fix bug below for deleted filters, need to guard against failed access to this field
                        group: filters.filter(f => f.id === s.forId)[0]?.field,
                        minus: s.eliminated
                      }
                    })
                    ]}
                  /> : <ItalicMessage>You need to select at least one filter</ItalicMessage>}
                </InjectContainerSize>
              </Visual>
            </VisualGrid>
          </TabContent>
          <TabContent name="Raw Data">
            <FieldDisplayToolbar>
              <p>{`Showing ${dispData.length} records`}</p>
              <button onClick={() => {setShowFieldSelector(true)}}>Select fields</button>
              <button onClick={() => {saveToCsv(dispData)}}>Save to CSV</button>
            </FieldDisplayToolbar>
            <DetailTable
              data={dispData}
              columns={
                ["__sys_id"]
                .concat(filters.filter(f => f.options.length > 0).map(f => f.field))
                .concat(fieldsToShow)
              }
            />
          </TabContent>
        </Tabs>
      </div>}
    </div>
  )
}

export default MainView;