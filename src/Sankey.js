/*
 * Used examples here https://reactviz.holiday/sankey/
 * and here https://d3-graph-gallery.com/graph/sankey_basic.html
 * to get this working
 */

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, sankeyLeft } from "d3-sankey";
import chroma from "chroma-js";

import "./sankey.css";

const Sankey = ({ data, width, height, margin, hideBlackhole }) => {
  const ref = useRef();

  useEffect(() => {
    // should draw when data changes
    draw();
  // eslint-disable-next-line
  }, [data, width, hideBlackhole]);

  const nodeMouseOver = (event, node) => {
    //console.log("mouse over node", node, "event", event);
    const svg = d3.select(ref.current);
    node.sourceLinks.forEach(link => {
      svg.select(`#link_${link.index}`).style("stroke-opacity", 0.6);
    });
    node.targetLinks.forEach(link => {
      svg.select(`#link_${link.index}`).style("stroke-opacity", 0.6);
    });
  }

  const nodeMouseOut = (event, node) => {
    //console.log("mouse out node", node, "event", event);
    const svg = d3.select(ref.current);
    node.sourceLinks.forEach(link => {
      svg.select(`#link_${link.index}`).style("stroke-opacity", 0.3);
    });
    node.targetLinks.forEach(link => {
      svg.select(`#link_${link.index}`).style("stroke-opacity", 0.3);
    });
  }
  
  const linkMouseOver = (event, link) => {
    //console.log("mouse over link", link, "event", event);
    const svg = d3.select(ref.current);
    svg.select(`#link_${link.index}`).style("stroke-opacity", 0.6);
  }

  const linkMouseOut = (event, link) => {
    //console.log("mouse out link", link, "event", event);
    const svg = d3.select(ref.current);
    svg.select(`#link_${link.index}`).style("stroke-opacity", 0.3);
  }

  const draw = () => {

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const selection = svg
      .append("g")
      .attr("transform", `translate(${margin},${margin + 10})`); 
      
    const { nodes, links } = sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .nodeAlign(sankeyLeft)
      .extent([[1, 1], [width - (margin * 2), height - 5]])(data);
    
    console.log("sankey nodes", nodes);

    const labelNodes = nodes.reduce((p, c, i) => {
      if(i === 0) {
        return [c];
      } else {
        if(c.category !== p[p.length-1].category) {
          return [...p, c];
        } else {
          return p;
        }
      }
    }, []);
    const lastLabelIndex = labelNodes[labelNodes.length-1].index;
    const levelLookup = labelNodes.reduce((p, c) => {
      return [...p, c.category];
    }, [])
    const levelColours = chroma.scale(["#fafa6e", "#2a4858"])
      .mode("lch").colors(labelNodes.length);

    // add the links to the diagram
    selection.append("g")
      .selectAll(".link")
      .data(links)
      .enter()
      .filter(d => !hideBlackhole ? true : d.target.displayName !== "blackhole")
      .append("path")
        .attr("class", "link")
        .attr("id", d => "link_" + d.index)
        .attr("d", sankeyLinkHorizontal())
        .style("stroke-width", (d) => d.width)
        .on("mouseover", linkMouseOver)
        .on("mouseout", linkMouseOut)
    
    // add the nodes
    let node = selection.append("g")
      .selectAll(".node")
      .data(nodes)
      .enter()
      .filter(d => !hideBlackhole ? true : d.displayName !== "blackhole")
      .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x0},${d.y0})`)
    
    // add level labels
    selection.append("g")
      .selectAll(".label")
      .data(labelNodes)
      .enter()
      .append("g")
        .attr("transform", d => `translate(${d.x0}, -5)`)
        .append("text")
          .attr("x", d => d.index === 0 ? d.x0 : d.index === lastLabelIndex ? (d.x1 - d.x0) : ((d.x1 - d.x0) / 2))
          .attr("text-anchor", d => d.index === 0 ? "start" : d.index === lastLabelIndex ? "end" : "middle")
          .attr("class", "label-text")
          .text(d => d.category)
          
    // node rectangles
    node.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => levelColours[levelLookup.indexOf(d.category)])
      .on("mouseover", nodeMouseOver)
      .on("mouseout", nodeMouseOut)

    // node labels
    node.append("text")
      .attr("class", "small-text")
      .attr("x", -6)
      .attr("y", d => (d.y1 - d.y0) / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(d => d.displayName === "blackhole" ? "" : d.displayName)
      .filter(d => d.x0 < width/2)
        .attr("x", d => 6 + (d.x1 - d.x0))
        .attr("text-anchor", "start")

  }

  return (
    <svg ref={ref} width={width + (margin*2)} height={height + (margin*2)} />
  );
};

export default Sankey;