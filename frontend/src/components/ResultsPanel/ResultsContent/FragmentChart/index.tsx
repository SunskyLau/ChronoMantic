import React, { useEffect, useRef } from "react";
import { Fragment } from "../../../../types/QuerySpec";
import * as d3 from "d3";

interface FragmentChartProps {
    xData: number[];
    yData: number[];
    ratio: number;
    fragment: Fragment;
}

const FragmentChart: React.FC<FragmentChartProps> = ({ xData, yData, ratio, fragment }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || xData.length === 0 || yData.length === 0 || !fragment) return;

        const svg = d3.select(svgRef.current);
        const fragmentXData = xData.slice(fragment.start_idx, fragment.end_idx + 1);
        const fragmentYData = yData.slice(fragment.start_idx, fragment.end_idx + 1);

        const margin = { top: 20, right: 30, bottom: 20, left: 50 };
        const width = svgRef.current.clientWidth - margin.left - margin.right;
        const xMin = d3.min(fragmentXData)!;
        const xMax = d3.max(fragmentXData)!;
        const xRange = xMax - xMin;
        const xUnitPixel = width / xRange;
        const yUnitPixel = xUnitPixel / ratio;
        const innerWidth = width;
        const fYMax = d3.max(fragmentYData)!, fYMin = d3.min(fragmentYData)!;
        const yRange = fYMax - fYMin;
        const innerHeight = yRange * yUnitPixel * 1000;

        const height = innerHeight + margin.top + margin.bottom;
        svg.attr('height', height);

        svg.selectAll('*').remove();

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const fragmentXScale = d3.scaleTime()
            .domain([new Date(d3.min(fragmentXData)!), new Date(d3.max(fragmentXData)!)]).range([0, innerWidth]);

        const fragmentYScale = d3.scaleLinear()
            .domain([fYMin, fYMax])
            .range([innerHeight, 0]);

        const xAxis = d3.axisBottom(fragmentXScale)
            .tickValues([fragmentXData[0], fragmentXData[fragmentXData.length - 1]])
            .tickFormat((d) => new Date(d as number).toLocaleDateString());
        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis);

        g.append('g').call(d3.axisLeft(fragmentYScale)
            .tickValues([fYMin, fYMax]))

        const fragmentLineGenerator = d3.line()
            .x((_, i) => fragmentXScale(fragmentXData[i]!) ?? 0)
            .y((_, i) => fragmentYScale(fragmentYData[i]!));

        g.append('path')
            .attr('d', fragmentLineGenerator(fragmentXData.map((_, index) => [index, fragmentYData[index]])))
            .attr('fill', 'none')
            .attr('stroke', 'blue')
            .attr('stroke-width', 2);

        fragment.segments?.forEach((segment) => {
            g.append('text')
                .attr('x', (fragmentXScale(xData[segment.start_idx])! + fragmentXScale(xData[segment.end_idx])!) / 2)
                .attr('y', 0)
                .attr('dy', -5)
                .text(segment.trend)
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle');

            g.append('line')
                .attr('x1', fragmentXScale(xData[segment.start_idx]) || 0)
                .attr('y1', fragmentYScale(yData[segment.start_idx]) || 0)
                .attr('x2', fragmentXScale(xData[segment.end_idx!]) || 0)
                .attr('y2', fragmentYScale(yData[segment.end_idx!]) || 0)
                .attr('stroke', 'red')
                .attr('stroke-width', 1);

            g.append('line')
                .attr('x1', fragmentXScale(xData[segment.start_idx]) || 0)
                .attr('y1', 0)
                .attr('x2', fragmentXScale(xData[segment.start_idx]) || 0)
                .attr('y2', innerHeight)
                .attr('stroke', '#333')
                .attr('stroke-width', 1)
                .attr('stroke-dasharray', '5,5');

            g.append('line')
                .attr('x1', fragmentXScale(xData[segment.end_idx]) || 0)
                .attr('y1', 0)
                .attr('x2', fragmentXScale(xData[segment.end_idx]) || 0)
                .attr('y2', innerHeight)
                .attr('stroke', '#333')
                .attr('stroke-width', 1)
                .attr('stroke-dasharray', '5,5');
        });

    }, [xData, yData, ratio, fragment]);

    return <svg ref={svgRef} width="100%"></svg>
};

export default FragmentChart;