import * as d3 from "d3";
import { useEffect, useRef } from "react";

const PointCloud = ({ metadata }) => {
    const svgRef = useRef();

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Limpia el lienzo

        const width = 500;
        const height = 500;

        // Configuración del lienzo
        svg.attr("width", width).attr("height", height);

        // Escalas para normalizar las posiciones
        const xScale = d3.scaleLinear().domain([0, 640]).range([0, width]); // Ajusta según los datos
        const yScale = d3.scaleLinear().domain([0, 480]).range([0, height]); // Ajusta según los datos

        // Renderiza los puntos
        svg.selectAll("circle")
            .data(metadata?.detections || [])
            .enter()
            .append("circle")
            .attr("cx", (d) => xScale(d.x))
            .attr("cy", (d) => yScale(d.y))
            .attr("r", 5)
            .attr("fill", "blue")
            .attr("opacity", 0.7)
            .on("mouseover", (event, d) => {
                d3.select(event.currentTarget).attr("fill", "red");
                // Opcional: Muestra un tooltip con información
                console.log(d.label);
            })
            .on("mouseout", (event) => {
                d3.select(event.currentTarget).attr("fill", "blue");
            });
    }, [metadata]);

    return <svg ref={svgRef}></svg>;
};

export default PointCloud;
