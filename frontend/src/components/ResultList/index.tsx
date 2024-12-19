import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export default function ResultList() {
    const svgRef = useRef<SVGSVGElement>(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const data = ["Short", "Longer Text", "Another Example", "Really Long Text"];

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const height = 40;
        svg.attr("height", height);

        const textPadding = 20;
        const edgeLengths = data.map((text) => text.length * 9 + textPadding);

        const nodes: { id: number; x: number; y: number }[] = [];
        let currentX = 20;
        nodes.push({ id: 0, x: currentX, y: height / 2 });
        data.forEach((_, index) => {
            currentX += edgeLengths[index];
            nodes.push({ id: index + 1, x: currentX, y: height / 2 });
        });

        const totalWidth = currentX + 20; // 最后一个节点右侧留一点间距
        svg.attr("width", totalWidth);

        svg.append("defs")
            .append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 18)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "black");

        svg.selectAll("line")
            .data(data)
            .join("line")
            .attr("x1", (_, i) => nodes[i].x)
            .attr("y1", (_, i) => nodes[i].y)
            .attr("x2", (_, i) => nodes[i + 1].x)
            .attr("y2", (_, i) => nodes[i + 1].y)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrowhead)"); // 添加箭头

        svg.selectAll(".edge-label")
            .data(data)
            .join("text")
            .attr("x", (_, i) => (nodes[i].x + nodes[i + 1].x) / 2 - 5)
            .attr("y", (_, i) => nodes[i].y - 10)
            .attr("text-anchor", "middle")
            .text((d) => d)
            .attr("font-size", "12px")
            .attr("fill", "black");

        svg.selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("r", 10)
            .attr("fill", "steelblue")
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        svg.selectAll(".node-label")
            .data(nodes)
            .join("text")
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y + 4)
            .attr("text-anchor", "middle")
            .text((d) => d.id)
            .attr("font-size", "12px")
            .attr("fill", "white");

        return () => {
            svg.selectAll("*").remove();
        };
    }, [data]);

    return (
        <div style={{ overflowX: "auto", overflowY: "hidden" }}>
            <svg height={40} ref={svgRef} />
        </div>
    );
}