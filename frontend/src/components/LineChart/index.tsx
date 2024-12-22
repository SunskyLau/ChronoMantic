import { memo, useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface LineChartProps {
    xData: number[];
    yData: number[];
    ratio?: number;
    title?: string;
}

function LineChart({ xData, yData, ratio = 0.00001, title = "" }: LineChartProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || xData.length === 0 || yData.length === 0) return;
        const timeStampData = xData.map((d) => d * 1000);

        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const svg = d3.select(svgRef.current);
        const width = Math.max(10, svgRef.current.clientWidth - margin.left - margin.right);
        const xMin = d3.min(timeStampData)!;
        const xMax = d3.max(timeStampData)!;
        const yMin = d3.min(yData)!;
        const yMax = d3.max(yData)!;
        const xRange = xMax - xMin;
        const xUnitPixel = width / xRange;
        const yUnitPixel = xUnitPixel / ratio;
        const yRange = yMax - yMin;
        const innerHeight = yRange * yUnitPixel * 1000;
        const innerWidth = width;
        const height = innerHeight + margin.top + margin.bottom;

        svg.attr('height', height);

        const xScale = d3.scaleTime()
            .domain([new Date(d3.min(timeStampData)!), new Date(d3.max(timeStampData)!)])
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(yData)!])
            .range([innerHeight, 0]);

        const lineGenerator = d3.line<[number, number]>()
            .x((d) => xScale(new Date(d[0]))!)
            .y((d) => yScale(d[1]));

        svg.selectAll('*').remove();

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        g.append('text')
            .attr('x', 10)
            .attr('y', 10)
            .attr('text-anchor', 'start')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .text(title);

        const xAxis = d3.axisBottom(xScale).tickValues([xMin, xMax]).tickFormat((d) => new Date(d as number).toLocaleDateString());
        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis);

        const yAxis = d3.axisLeft(yScale).tickValues([0, yMax]);
        g.append('g')
            .call(yAxis);

        g.append('path')
            .datum(timeStampData.map((t, i) => [t, yData[i]] as [number, number]))
            .attr('d', lineGenerator)
            .attr('fill', 'none')
            .attr('stroke', '#333')
            .attr('stroke-width', 1);

    }, [xData, yData, ratio, title]);

    return (
        <svg ref={svgRef} width="100%" height="0"></svg>
    );
};

export default memo(LineChart, (prevProps, nextProps) => {
    return (
        JSON.stringify(prevProps.xData) === JSON.stringify(nextProps.xData) &&
        JSON.stringify(prevProps.yData) === JSON.stringify(nextProps.yData) &&
        prevProps.ratio === nextProps.ratio &&
        prevProps.title === nextProps.title
    );
});