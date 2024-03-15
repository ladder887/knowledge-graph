import React, { useEffect } from 'react';
import * as d3 from 'd3';

const ZoomComponent = ({ gRef, svgRef }) => {
    
    const zoom = d3.zoom()
        .scaleExtent([0.01, 10])
        .on("zoom", function (event) {
            gRef.current.attr("transform", event.transform);
        });

    const zoomIn = () => {
        gRef.current.transition().call(zoom.scaleBy, 2);
    };

    const zoomOut = () => {
        gRef.current.transition().call(zoom.scaleBy, 0.5);
    };

    const resetZoom = () => {
        gRef.current.transition().call(zoom.scaleTo, 1);
    };

    const panLeft = () => {
        gRef.current.transition().call(zoom.translateBy, 50, 0);
    };

    const panRight = () => {
        gRef.current.transition().call(zoom.translateBy, -50, 0);
    };

    const panUp = () => {
        gRef.current.transition().call(zoom.translateBy, 0, 50);
    };

    const panDown = () => {
        gRef.current.transition().call(zoom.translateBy, 0, -50);
    };

    const center = () => {
        gRef.current.transition().call(zoom.translateTo, 0, 0);
    };
    useEffect(() => {

    d3.select(svgRef.current).call(zoom);
    },[]);

    return (
        <div>
            <button onClick={resetZoom}>Reset zoom</button>
            <button onClick={zoomIn}>Zoom in</button>
            <button onClick={zoomOut}>Zoom out</button>
            <button onClick={panLeft}>Left</button>
            <button onClick={panRight}>Right</button>
            <button onClick={panUp}>Up</button>
            <button onClick={panDown}>Down</button>
            <button onClick={center}>Center</button>
        </div>
    );
};

export default ZoomComponent;
