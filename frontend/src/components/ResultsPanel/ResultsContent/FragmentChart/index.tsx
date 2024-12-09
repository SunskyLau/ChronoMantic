import React, { useEffect, useRef } from "react";
import { Fragment } from "../../../../types/QuerySpec";
import * as d3 from "d3";

interface FragmentChartProps {
    xData: string[];
    yData: number[];
    ratio: number;
    fragment: Fragment;
}

const FragmentChart: React.FC<FragmentChartProps> = ({ xData, yData, ratio, fragment }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || xData.length === 0 || yData.length === 0) return;

        const svg = d3.select(svgRef.current);
        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;
        const margin = { top: 20, right: 30, bottom: 20, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        const scaledYData = yData.map((d) => d * ratio);

        svg.selectAll('*').remove();

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        if (fragment.start_idx !== null && fragment.end_idx !== null) {
            const fragmentXData = xData.slice(fragment.start_idx, fragment.end_idx + 1);
            const fragmentYData = scaledYData.slice(fragment.start_idx, fragment.end_idx + 1);
            const originalYData = yData.slice(fragment.start_idx, fragment.end_idx + 1);

            const fragmentXScale = d3.scaleBand()
                .domain(fragmentXData)
                .range([0, innerWidth])
                .padding(0.2);

            const fragmentYScale = d3.scaleLinear()
                .domain([d3.min(fragmentYData)!, d3.max(fragmentYData)!])
                .range([innerHeight, 0]);

            const originalYScale = d3.scaleLinear()
                .domain([d3.min(originalYData)!, d3.max(originalYData)!])
                .range([innerHeight, 0]);

            g.append('g')
                .attr('transform', `translate(0,${innerHeight})`)
                .call(d3.axisBottom(fragmentXScale)
                    .tickValues([fragmentXData[0], fragmentXData[fragmentXData.length - 1]])
                    .tickFormat((d) => d));

            g.append('g').call(d3.axisLeft(originalYScale).tickValues([d3.min(originalYData)!, d3.max(originalYData)!]));

            const fragmentLineGenerator = d3.line()
                .x((_, i) => fragmentXScale(fragmentXData[i]!) ?? 0)
                .y((_, i) => fragmentYScale(fragmentYData[i]!));

            g.append('path')
                .attr('d', fragmentLineGenerator(fragmentXData.map((_, index) => [index, fragmentYData[index]])))
                .attr('fill', 'none')
                .attr('stroke', 'blue')
                .attr('stroke-width', 2);

            if (fragment.segments) {
                fragment.segments.forEach((segment) => {
                    if (!segment.start_idx || !segment.end_idx) return;

                    g.append('text')
                        .attr('x', (fragmentXScale(xData[segment.start_idx])! + fragmentXScale(xData[segment.end_idx])!) / 2)
                        .attr('y', 0)
                        .attr('dy', -5)
                        .text(segment.trend)
                        .attr('text-anchor','middle')
                        .attr('alignment-baseline','middle');

                    g.append('line')
                        .attr('x1', fragmentXScale(xData[segment.start_idx]) || 0)
                        .attr('y1', fragmentYScale(scaledYData[segment.start_idx]) || 0)
                        .attr('x2', fragmentXScale(xData[segment.end_idx!]) || 0)
                        .attr('y2', fragmentYScale(scaledYData[segment.end_idx!]) || 0)
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
            }
        }
    }, [xData, yData, ratio, fragment]);

    return <svg ref={svgRef} width="100%" height="300"></svg>
};

export default FragmentChart;