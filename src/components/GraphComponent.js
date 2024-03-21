import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { nodeCreate, nodeInformation } from './dataProcessing';
import ZoomComponent from './ZoomComponent';

const GraphComponent = ({ data }) => {
    const svgRef = useRef(null); 
    const infoSvgRef = useRef(null);
    const gRef = useRef(null);
    const width = 1300, height = 800;
    const infoWidth = 600, infoHeight = 800;
    const color = d3.scaleOrdinal()
        .domain(["Tweet", "Account", "Hashtag", "URL"])
        .range(["green", "orange", "blue", "red"]);

    useEffect(() => {
        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("x", d3.forceX())
            .force("y", d3.forceY());

        const svg = d3.select(svgRef.current)
            .attr("id", "svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; border:2px solid black;");

        const infoSvg = d3.select(infoSvgRef.current)
            .attr("id", "infoSvg")
            .attr("width", infoWidth)
            .attr("height", infoHeight)
            .attr("viewBox", [0, 0, infoWidth, infoHeight])
            .attr("style", "max-width: 100%; height: auto; border:2px solid black;")
            .attr("x", width)
            .attr("y", 0);

        gRef.current = d3.select(svgRef.current).append("g");

        nodeCreate().then(({ nodes, links, dataCount }) => {
            //console.log(nodes)
            console.log(links)
            console.log(dataCount)
            // 그래프 처리 및 렌더링 코드
            const Count = svg.append("text")
                .attr("x", 10)
                .attr("y", 20)
                .text("Account : " + dataCount.accountCount + "  Tweet : " + dataCount.tweetCount + "  URL : " + dataCount.urlCount)
                .attr("font-family", "sans-serif")
                .attr("font-size", "20px")
                .attr("fill", "black");

            const link = gRef.current.append("g")
                .attr("stroke", "#999")
                .attr("stroke-opacity", 1)
                .selectAll("line")
                .data(links)
                .join("line")
                .attr("stroke-width", d => Math.sqrt(d.value));

            const node = gRef.current.append("g")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5)
                .selectAll("circle")
                .data(nodes)
                .join("circle")
                .attr("r", 7)
                .attr("fill", d => color(d.group))
                .call(drag(simulation))
                .on("click", (event, d) => handleNodeClick(event, d));

            // 노드에 마우스 클릭 이벤트 처리 함수
            function handleNodeClick(event, d) {
                d3.selectAll("circle").style("stroke", "#fff");
                d3.select(event.currentTarget).style("stroke", "blue");
                
                nodeInformation(d).then((info) => {
                    infoSvg.selectAll("*").remove();
                
                    infoSvg.append("text")
                        .attr("x", 170)
                        .attr("y", 30)
                        .text("Node information")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "30px")
                        .attr("fill", "red");
                
                    const textbox = infoSvg.append("foreignObject")
                        .attr("x", 10)
                        .attr("y", 60)
                        .attr("width", infoWidth - 20)
                        .attr("height", infoHeight - 70);

                    const div = textbox.append("xhtml:div")
                        .style("width", "100%")
                        .style("height", "100%")
                        .style("overflow", "auto");

                    Object.entries(info).forEach(([key, value]) => {
                        if (key.includes("URL")) {
                            if (Array.isArray(value)) {
                                div.append("xhtml:p")
                                    .style("margin", "0px")
                                    .style("padding", "5px")
                                    .style("font-size", "15px")
                                    .style("font-weight", "bold")
                                    .text(key)
                                value.forEach((value) => {
                                    div.append("xhtml:a")
                                        .attr("href", value)
                                        .attr("target", "_blank")
                                        .style("display", "block")
                                        .style("margin", "0px")
                                        .style("padding", "7px")
                                        .text(value);
                                });
                                div.append("xhtml:p")
                                    .style("margin", "0px")
                                    .style("margin-bottom", "10px")
                                    .style("padding", "5px")
                                    .style("border-bottom", "1px solid #ccc");
                            } else {
                                div.append("xhtml:p")
                                    .style("margin", "0px")
                                    .style("padding", "5px")
                                    .style("font-size", "15px")
                                    .style("font-weight", "bold")
                                    .text(key)
                                div.append("xhtml:a")
                                    .attr("href", value)
                                    .attr("target", "_blank")
                                    .style("display", "block")
                                    .style("margin", "0px")
                                    .style("margin-bottom", "10px")
                                    .style("padding", "7px")
                                    .style("border-bottom", "1px solid #ccc")
                                    .text(value);
                            }
                            
                        } else {
                            div.append("xhtml:p")
                                .style("margin", "0")
                                .style("padding", "5px")
                                .style("font-size", "15px")
                                .style("font-weight", "bold")
                                .text(key);
                            div.append("xhtml:p")
                                .style("margin", "0")
                                .style("margin-bottom", "10px")
                                .style("padding", "7px")
                                .style("border-bottom", "1px solid #ccc")
                                .text(value);
                    }
                    });
                }).catch((error) => {
                    console.error("에러:", error);
                });
            }

            node.append("title")
                .text(d => d.id);

            simulation.nodes(nodes)
                .on("tick", () => {
                    link
                        .attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);

                    node
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y);
                });

            simulation.force("link")
                .links(links);
        });

    }, []);
        // drag 함수
    function drag(simulation) {
        const dragstarted = (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        };

        const dragged = (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
        };

        const dragended = (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        };

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
        
    return (
        <div style={{ overflowX: 'auto' }}>
            <svg ref={svgRef}></svg>
            <svg ref={infoSvgRef}></svg>
            <ZoomComponent gRef={gRef} svgRef = {svgRef} />
        </div>
    );
};
export default GraphComponent;
