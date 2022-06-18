import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import "./waterfall.css";

const Waterfall = ({ margin, width, height, data, endName }) => {
  const subgroups = ["start", "float", "minus", "plus", endName];

  const ref = useRef();
  const [procData, setProcData] = useState({
    groups: [],
    rows: []
  });

  useEffect(() => {    
    let processedData = {
      groups: [],
      rows: [],
      rowArrays: []
    };
    //console.log("data from external source", data);
    let float = 0;
    data.forEach((d, i) => {
      //console.log("working in row", d);
      processedData.groups.push(d?.group);
      let row = [];
      if(i === 0) {
        float = d?.start;
      }
      subgroups.forEach(g => {
        if(g in d) {
          row.push(d[g]);
        } else {
          if(g === "float") {
            // need to deal with special case of float bar
            // we need to subtract now if there's a minus
            if("minus" in d) {
              //console.log("row has a minus", d.minus, "float before minus", float);
              float -= d.minus;
              //console.log("float after minus", float);
            }
            row.push("start" in d ? 0 : float);
            // calculate next float, needs to go up if there was a plus
            if("plus" in d) {
              float += d.plus;
              //console.log("float after plus", float);
            }
          } else {
            row.push(0);
          }
        }
      });
      processedData.rowArrays.push(row);
    })
    // need to add last entry for 'end'
    processedData.rowArrays.push([0,0,0,0,float]);
    // need to create data format for d3
    processedData.rowArrays.forEach((row, ri) => {
      processedData.rows.push(
        {...row.reduce((p, c, i) => {
          p[subgroups[i]] = c;
          return p;
        }, {}), group: endName, ...data[ri]}
        // adding "end" above assumes the only row without a group name will be the end one we added
      );
    })
    //console.log("processed data", processedData);
    setProcData(processedData);
  // eslint-disable-next-line
  }, [data, endName]);

  const draw = () => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const selection = svg
      .append("g")
      .attr("transform", `translate(${margin+10},${margin})`);    
    
    // y axis
    const yScale = d3.scaleLinear()
                    .domain([0, d3.max(procData.rows.map(d => d.start))])
                    .range([height, 0]);
    selection.append("g")
              .call(d3.axisLeft(yScale).tickFormat(d3.format(".2s")));
    
    // x axis
    const xScale = d3.scaleBand()
                    .range([0, width - margin - 10])
                    .domain(procData.rows.map(d => d.group))
    selection.append("g")
              .attr("transform", `translate(0,${height})`)
              .call(d3.axisBottom(xScale));

    const colours = d3.scaleOrdinal()
              .domain(subgroups)
              .range(['darkblue', 'transparent', 'red', 'green', 'darkblue']);
    
    const stacked = d3.stack()
              .keys(subgroups)
              (procData.rows);

    let bars = selection
      .selectAll(".bar")
      .data(stacked)
      .enter()
      .append("g")
        .attr("fill", d => colours(d.key))
        .selectAll("rect")
          .data(d => d)
          .enter()
          .append("g")
            .attr("transform", d => `translate(${xScale(d.data.group)},${yScale(d[1])})`);
    
    bars.append("rect")
      .attr("width", xScale.bandwidth() - 10)
      .attr("height", d => yScale(d[0]) - yScale(d[1]));
    
    bars.append("text")
      .attr("class", "small-text-waterfall")
      .attr("y", d => (yScale(d[0]) - yScale(d[1])) / 2)
      .attr("x", (xScale.bandwidth() - 10) / 2)
      .filter(d => (yScale(d[0]) - yScale(d[1])) > 0)
      .style("fill", "white")
      .attr("text-anchor", "middle")
      .text(d => {
        const data = d.data;
        if(data.start > 0) {
          return data.start;
        } else if(data.minus > 0) {
          return data.minus
        } else if(data.plus > 0) {
          return data.plus;
        } else if(data["Final Set"] > 0) {
          return data["Final Set"];
        } else {
          return "na"
        }
      });
  }

  useEffect(() => {
    // we trigger the draw when the processed data is updated
    draw();
  // eslint-disable-next-line
  }, [procData, width]);

  return (
    <svg ref={ref} width={(margin*2) - 10 + width} height={(margin*2) + height} />
  )
};
 
export default Waterfall;