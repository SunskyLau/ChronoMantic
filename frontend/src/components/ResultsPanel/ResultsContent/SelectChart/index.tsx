import * as d3 from "d3";
import { memo, useCallback, useEffect, useRef } from "react";
import { debounce } from "../../../../utils/debounce";

interface DataPoint {
    x: number;
    y: number;
}

interface SelectChartProps {
    data: DataPoint[];
    title: string;
    onBrush?: (minX: number, maxX: number) => void;
}

function SelectChart({ data, title, onBrush }: SelectChartProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    const draw = useCallback(() => {
        if (svgRef.current && data.length > 0) {
            const width = svgRef.current.clientWidth;
            const height = svgRef.current.clientHeight;
            const margin = { top: 20, right: 0, bottom: 0, left: 0 };
            const innerWidth = width - margin.left - margin.right;
            const innerHeight = height - margin.top - margin.bottom;

            if (data.length === 1) {
                data.push({ x: data[0].x + 1, y: data[0].y });
            }

            const x = d3.scaleLinear()
                .domain(d3.extent(data, (d) => d.x) as [number, number])
                .range([0, innerWidth]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, (d) => d.y) || 0])
                .nice()
                .range([innerHeight, 0]);

            const line = d3.line<DataPoint>()
                .x((d) => x(d.x))
                .y((d) => y(d.y));

            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();

            const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

            const areaGenerator = d3.area<DataPoint>()
                .x(d => x(d.x))
                .y0(y(0))
                .y1(d => y(d.y));

            g.append("path")
                .datum(data)
                .attr("d", areaGenerator)
                .attr("fill", "#ddd");

            svg.append('text')
                .attr('x', innerWidth / 2)
                .attr('y', 15)
                .attr('text-anchor', 'middle')
                .attr('font-size', '14px')
                .text(title);

            g.append('path')
                .data([data])
                .attr('class', 'line')
                .attr('d', line)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 2);

            function brushFn(event: d3.D3BrushEvent<DataPoint>) {
                svg.select(".area").remove()
                if (data.length <= 2) {
                    onBrush?.(0, data[0].x);
                    return;
                }
                const selection = event.selection;
                if (!selection) return;
                const [x0, x1] = selection;
                const [minX, maxX] = [x.invert(x0 as number), x.invert(x1 as number)];
                const areaGenerator = d3.area<DataPoint>()
                    .x(d => x(d.x))
                    .y0(y(0))
                    .y1(d => y(d.y));
                g.append("path")
                    .attr("class", "area")
                    .datum(data.filter(d => d.x >= minX && d.x <= maxX))
                    .attr("d", areaGenerator)
                    .attr("fill", "lightblue");
                onBrush?.(minX, maxX);
            }

            const debouncedBrushFn = debounce(brushFn, 100);

            const brush = d3.brushX()
                .extent([[0, 0], [innerWidth, innerHeight]])
                .on('brush', (event) => debouncedBrushFn(event))
                .on('end', function (event) {
                    const selection = event.selection;
                    if (!selection) {
                        svg.select(".area").remove()
                        onBrush?.(0, d3.max(data, (d) => d.x) || 0);
                    }
                });

            svg.append("g").attr('transform', `translate(${margin.left},${margin.top})`).attr("class", "brush").call(brush);
            svg.select('.selection')
                .attr('fill', 'none')
                .attr("stroke", "black");

            return () => {
                brush.on('brush', null).on('end', null);
                svg.selectAll('*').remove();
            };
        }
    }, [data, onBrush, title]);

    useEffect(() => {
        const cancel = draw();
        window.addEventListener('resize', draw);
        return () => {
            window.removeEventListener('resize', draw);
            cancel?.();
        };
    },[draw]);

    return (<svg ref={svgRef} width="100%" height="100%"></svg>);
}

export default memo(SelectChart, (prevProps, nextProps) => {
    return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) && prevProps.title === nextProps.title;
});