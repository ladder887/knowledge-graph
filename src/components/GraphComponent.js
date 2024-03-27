import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { drag, handleNodeClick} from './Event';
import ZoomComponent from './ZoomComponent';

const GraphComponent = ({ data }) => {
    const svgRef = useRef(null); 
    const infoSvgRef = useRef(null);
    const gRef = useRef(null);
    const linkRef = useRef(null);
    const nodeRef = useRef(null);
    const width = 1300, height = 800;
    const infoWidth = 600, infoHeight = 800;
    const color = d3.scaleOrdinal()
        .domain(["Tweet", "Account", "Hashtag", "URL"])
        .range(["green", "orange", "blue", "red"]);

    const simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody())
        .force("link", d3.forceLink().id(d => d.id))
        .force("center", d3.forceCenter(width / 32, height / 32))
        .force("x", d3.forceX())
        .force("y", d3.forceY());

    let old = null;

    useEffect(() => {
        const svg = d3.select(svgRef.current)
            .attr("id", "svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", "max-width: 100%; height: auto; border:2px solid black;");

        const infoSvg = d3.select(infoSvgRef.current)
            .attr("id", "infoSvg")
            .attr("width", infoWidth)
            .attr("height", infoHeight)
            .attr("viewBox", [0, 0, infoWidth, infoHeight])
            .attr("style", "max-width: 100%; height: auto; border:2px solid black;")
            .attr("x", width)
            .attr("y", 0);

        gRef.current = svg.append("g");

        linkRef.current = gRef.current.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 1);

        nodeRef.current = gRef.current.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);
        svg.append("text")
            .attr("x", (-width / 2) + 10)
            .attr("y", (-height / 2) + 20)
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", "black");

        old = new Map(nodeRef.current.selectAll("circle").data().map(d => [d.id, d]));

    }, [])

    useEffect(() => {

        const svg = d3.select(svgRef.current);
        const infoSvg = d3.select(infoSvgRef.current);

        svg.selectAll("text")
            .text("Account : " + data.dataCount.accountCount + "  Tweet : " + data.dataCount.tweetCount + "  URL : " + data.dataCount.urlCount);

        const old = new Map(nodeRef.current.selectAll("circle").data().map(d => [d.id, d]));
        data.nodes = data.nodes.map(d => ({...old.get(d.id), ... d}));
        //data.links = data.links.map(d => ({...d}));
        
        const node = nodeRef.current
            .selectAll("circle")
            .data(data.nodes, d => d.id)
            .join(
                enter => enter.append("circle")
                    .attr("r", 7)
                    .attr("fill", d => color(d.group))
                    .call(drag(simulation))
                    .on("click", (event, d) => handleNodeClick(event, d, infoSvg))
            );
    
        node.append("title").text(d => d.id);
    
        const link = linkRef.current
            .selectAll("line")
            .data(data.links, d => [d.source, d.target])
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value));

        // function ticked() {
        //     node.attr("cx", d => d.x)
        //         .attr("cy", d => d.y);
        
        //     link.attr("x1", d => d.source.x)
        //         .attr("y1", d => d.source.y)
        //         .attr("x2", d => d.target.x)
        //         .attr("y2", d => d.target.y);
        //     }

        simulation.nodes(data.nodes)
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
        simulation.force("link").links(data.links);

        //simulation.alpha(1).restart();
        // simulation.on("tick", () => {
        //     link
        //         .attr("x1", d => d.source.x)
        //         .attr("y1", d => d.source.y)
        //         .attr("x2", d => d.target.x)
        //         .attr("y2", d => d.target.y);

        //     node
        //         .attr("cx", d => d.x)
        //         .attr("cy", d => d.y);
        // });
    }, [data]);

    return (
        <div style={{ overflowX: 'auto' }}>
            <svg ref={svgRef}></svg>
            <svg ref={infoSvgRef}></svg>
            <ZoomComponent gRef={gRef} svgRef = {svgRef} />
        </div>
    );
};
export default GraphComponent;
