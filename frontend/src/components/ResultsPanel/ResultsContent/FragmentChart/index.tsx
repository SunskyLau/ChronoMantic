import React, { memo, useEffect, useRef } from "react";
import { Segment } from "../../../../types/QuerySpec";
import * as d3 from "d3";

interface FragmentChartProps {
    className?: string;
    xData: number[];
    yData: number[];
    ratio?: number;
    segments: Segment[];
    isXAxisVisible?: boolean;
    isYAxisVisible?: boolean;
}

const FragmentChart: React.FC<FragmentChartProps> = ({ className, xData, yData, ratio = 0.00001, segments, isXAxisVisible = false, isYAxisVisible = false }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || xData.length === 0 || yData.length === 0 || !segments) return;
        const start = segments.at(0)!.start_idx;
        const end = segments.at(-1)!.end_idx;
        const svg = d3.select(svgRef.current);
        const fragmentXData = xData.slice(start, end + 1).map((d) => d * 1000);
        const fragmentYData = yData.slice(start, end + 1);

        const margin = { top: 4, right: 4, bottom: 4, left: 4 };
        const maxHeight = 50 - margin.top - margin.bottom;
        const width = 50 - margin.left - margin.right;
        const xMin = d3.min(fragmentXData)!;
        const xMax = d3.max(fragmentXData)!;
        const xRange = xMax - xMin;
        const xUnitPixel = width / xRange;
        const yUnitPixel = xUnitPixel / ratio;
        let innerWidth = width;
        const fYMax = d3.max(fragmentYData)!, fYMin = d3.min(fragmentYData)!;
        const yRange = fYMax - fYMin;
        let innerHeight = yRange * yUnitPixel * 1000;
        let height = innerHeight + margin.top + margin.bottom;
        if (innerHeight > maxHeight) {
            const r = innerHeight / maxHeight;
            const newWidth = width / r;
            innerWidth = newWidth;
            svg.attr('width', newWidth + margin.left + margin.right);
            height = maxHeight + margin.top + margin.bottom;
            innerHeight = maxHeight;
        }

        svg.attr('height', height);
        svg.selectAll('*').remove();

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const fragmentXScale = d3.scaleTime()
            .domain([new Date(d3.min(fragmentXData)!), new Date(d3.max(fragmentXData)!)]).range([0, innerWidth]);

        const fragmentYScale = d3.scaleLinear()
            .domain([fYMin, fYMax])
            .range([innerHeight, 0]);

        if (isXAxisVisible) {
            const xAxis = d3.axisBottom(fragmentXScale)
                .tickValues([fragmentXData[0], fragmentXData[fragmentXData.length - 1]])
                .tickFormat((d) => new Date(d as number).toLocaleDateString());
            g.append('g')
                .attr('transform', `translate(0,${innerHeight})`)
                .call(xAxis);
        }

        if (isYAxisVisible) {
            g.append('g').call(d3.axisLeft(fragmentYScale)
                .tickValues([fYMin, fYMax]))
        }

        const fragmentLineGenerator = d3.line()
            .x((_, i) => fragmentXScale(fragmentXData[i]!) ?? 0)
            .y((_, i) => fragmentYScale(fragmentYData[i]!));

        g.append('path')
            .attr('d', fragmentLineGenerator(fragmentXData.map((_, index) => [index, fragmentYData[index]])))
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-opacity', '30%')
            .attr('stroke-width', 1);

        segments?.forEach((segment) => {
            // g.append('text')
            //     .attr('x', (fragmentXScale(xData[segment.start_idx])! + fragmentXScale(xData[segment.end_idx])!) / 2)
            //     .attr('y', 0)
            //     .attr('dy', -5)
            //     .text(segment.trend)
            //     .attr('text-anchor', 'middle')
            //     .attr('alignment-baseline', 'middle');

            g.append('line')
                .attr('x1', fragmentXScale(fragmentXData[segment.start_idx - start]) || 0)
                .attr('y1', fragmentYScale(fragmentYData[segment.start_idx - start]) || 0)
                .attr('x2', fragmentXScale(fragmentXData[segment.end_idx! - start]) || 0)
                .attr('y2', fragmentYScale(fragmentYData[segment.end_idx! - start]) || 0)
                .attr('stroke', segment.slope! > 0 ? 'red' : 'green')
                .attr('stroke-opacity', '50%')
                .attr('stroke-width', 1);

            // g.append('line')
            //     .attr('x1', fragmentXScale(fragmentXData[segment.start_idx - fragment.start_idx]) || 0)
            //     .attr('y1', 0)
            //     .attr('x2', fragmentXScale(fragmentXData[segment.start_idx - fragment.start_idx]) || 0)
            //     .attr('y2', innerHeight)
            //     .attr('stroke', '#333')
            //     .attr('stroke-width', 1)
            //     .attr('stroke-dasharray', '5,5');

            // g.append('line')
            //     .attr('x1', fragmentXScale(fragmentXData[segment.end_idx - fragment.start_idx]) || 0)
            //     .attr('y1', 0)
            //     .attr('x2', fragmentXScale(fragmentXData[segment.end_idx - fragment.start_idx]) || 0)
            //     .attr('y2', innerHeight)
            //     .attr('stroke', '#333')
            //     .attr('stroke-width', 1)
            //     .attr('stroke-dasharray', '5,5');
        });

    }, [xData, yData, ratio, segments, isXAxisVisible, isYAxisVisible]);

    return <svg className={className} ref={svgRef} width="50"></svg>
};

export default memo(FragmentChart, (prevProps, nextProps) => {
    return JSON.stringify(prevProps.xData) === JSON.stringify(nextProps.xData) && JSON.stringify(prevProps.yData) === JSON.stringify(nextProps.yData) && prevProps.ratio === nextProps.ratio && JSON.stringify(prevProps.segments) === JSON.stringify(nextProps.segments) && prevProps.isXAxisVisible === nextProps.isXAxisVisible && prevProps.isYAxisVisible === nextProps.isYAxisVisible
});