import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface LineChartProps {
    xData: string[];
    yData: number[];
    ratio?: number;
    title?: string;
}

export default function LineChart({ xData, yData, ratio = 1, title = "" }: LineChartProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!svgRef.current || xData.length === 0 || yData.length === 0) return;

        const svg = d3.select(svgRef.current);
        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const scaledYData = yData.map((d) => d * ratio);

        const xScale = d3.scaleBand()
            .domain(xData)
            .range([0, innerWidth])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(scaledYData)!])
            .range([innerHeight, 0]);

        const lineGenerator = d3.line()
            .x((_, i) => xScale(xData[i]!) ?? 0)
            .y((_, i) => yScale(scaledYData[i]!));

        svg.selectAll('*').remove();

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        g.append('text')
            .attr('x', -margin.left / 2)
            .attr('y', margin.top / 2)
            .attr('text-anchor', 'start')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .text(title);

        // const xAxis = d3.axisBottom(xScale);
        // g.append('g')
        //     .attr('class', 'x-axis')
        //     .attr('transform', `translate(0,${innerHeight})`)
        //     .call(xAxis);

        // const yAxis = d3.axisLeft(yScale);
        // g.append('g')
        //     .attr('class', 'y-axis')
        //     .call(yAxis);

        g.append('path')
            .attr('d', lineGenerator(xData.map((_, index) => [index, scaledYData[index]])))
            .attr('fill', 'none')
            .attr('stroke', '#333')
            .attr('stroke-width', 1);

    }, [xData, yData, ratio, title]);

    return (
        <svg ref={svgRef} width="100%" height="100%">
        </svg>
    );
};