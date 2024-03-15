import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { processData, dataParser } from './dataProcessing';
import ZoomComponent from './ZoomComponent';

const GraphComponent = ({ data }) => {
    const svgRef = useRef(null); 
    const infoSvgRef = useRef(null);
    const gRef = useRef(null);

    useEffect(() => {
        const width = 1300, height = 800;
        const infoWidth = 600, infoHeight = 800;
        const color = d3.scaleOrdinal()
            .domain(["Tweet", "Account", "Hashtag", "URL"])
            .range(["green", "orange", "blue", "red"]);

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

        processData().then(({ nodes, links }) => {
            console.log(nodes)
            // 그래프 처리 및 렌더링 코드
            var accountCount = 0;
            var urlCount = 0;
            var dataCount = svg.append("text")
                .attr("x", 10)
                .attr("y", 20)
                .text("Account : " + accountCount + "  URL : " + urlCount)
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
                
                dataParser(d).then((info) => {
                    // infoSvg에 있는 모든 요소를 삭제합니다.
                    infoSvg.selectAll("*").remove();
                
                    // "Node information" 텍스트를 추가합니다.
                    infoSvg.append("text")
                        .attr("x", 170)
                        .attr("y", 30)
                        .text("Node information")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "30px")
                        .attr("fill", "red");
                
                    // info 배열을 반복하며 텍스트 요소를 추가합니다.
                    info.forEach((i, index) => {
                        const text = infoSvg.append("text")
                            .attr("x", 10)
                            .attr("y", 70 + index * 20)
                            .text(i)
                            .attr("font-family", "sans-serif")
                            .attr("font-size", "20px")
                            .attr("fill", "black");
                        
                        // URL 그룹이고 "ID : "로 시작하는 경우 추가 작업을 수행합니다.
                        if (d.group === "URL" && i.startsWith("ID : ")) {
                            // 텍스트를 수정하여 쉼표 이후의 내용을 삭제합니다.
                            text.text(i.split(",")[0]);
                
                            // URL을 표시하는 텍스트를 추가하고 클릭 이벤트를 연결합니다.
                            var urlText = infoSvg.append("text")
                                .attr("x", 50)
                                .attr("y", 70 + index * 20)
                                .text(i.split(",")[1])
                                .style("cursor", "pointer")
                                .attr("fill", "blue")
                                .style("text-decoration", "underline")
                                .on("click", () => window.open(d.id, "_blank"));
                        }
                    });
                }).catch((error) => {
                    // 에러가 발생한 경우 콘솔에 에러 메시지를 출력합니다.
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
    }, []);

    return (
        <div style={{ overflowX: 'auto' }}>
            <svg ref={svgRef}></svg>
            <svg ref={infoSvgRef}></svg>
            <ZoomComponent gRef={gRef} svgRef = {svgRef} />
        </div>
    );
};
export default GraphComponent;
