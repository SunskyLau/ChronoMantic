import { memo, useCallback, useEffect, useId, useRef } from 'react';
import * as d3 from 'd3';
import { deepEqual } from '../../utils/deepclone';

interface LineChartProps {
    xData: number[] | string[];
    yData: number[];
    ratio?: number;
    height?: number | string;
    title?: string;
    isXAxisVisible?: boolean;
    isYAxisVisible?: boolean;
    isXAxisTextVisible?: boolean;
    isYAxisTextVisible?: boolean;
    isBrush?: boolean;
    onBrush?: (start: number, end: number) => void;
    onBrushEnd?: (start: number, end: number) => void;
    brushPosition?: [number, number];
    isFill?: boolean;
    range?: [number, number];
    isShowRange?: boolean;
    split?: number[];
    isSplitMask?: boolean;
    isExpand?: boolean;
    isZoom?: boolean;
    isActive?: boolean;
    onScroll?: (delta: number) => void;
    onContextMenu?: (event: MouseEvent) => void;
    children?: React.ReactNode;
    xAxisColor?: string;
    yAxisColor?: string;
    lineColor?: string;
    textColor?: string;
    xAxisFormatter?: (date: Date) => string;
    brushColor?: string;
}

function LineChart({ xData, yData, ratio, title = "", isXAxisVisible = false, isYAxisVisible = false, isXAxisTextVisible = false, isYAxisTextVisible = false, isBrush = false, isFill = false, onBrush, onBrushEnd, range, height, split, isSplitMask = false, brushPosition, isZoom = false, isExpand = true, isShowRange = true, isActive, children, onScroll, onContextMenu, xAxisColor = '#C5C5C5', yAxisColor = '#C5C5C5', lineColor = '#A6A6A6', textColor = '#C5C5C5', xAxisFormatter = (date: Date) => date.getFullYear().toString(), brushColor = '#546BB61A' }: LineChartProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const id = useId();

    const handleScroll = useCallback((event: WheelEvent) => {
        if (!onScroll) return;
        event.preventDefault();
        const total = range ? range?.[1] - range?.[0] : xData.length;
        const step = Math.max(1, Math.round(total / 10));
        onScroll(event.deltaY > 0 ? step : -step);
    }, [onScroll, range, xData.length]);

    useEffect(() => {
        if (!svgRef.current) return;
        const svg = svgRef.current;
        svg.addEventListener('wheel', handleScroll);
        return () => {
            svg?.removeEventListener('wheel', handleScroll);
        }
    }, [handleScroll])

    const handleContextMenu = useCallback((event: MouseEvent) => {
        event.preventDefault();
        onContextMenu?.(event);
    }, [onContextMenu]);

    useEffect(() => {
        if (!svgRef.current) return;
        const svg = svgRef.current;
        svg.addEventListener('contextmenu', handleContextMenu);
        return () => {
            svg?.removeEventListener('contextmenu', handleContextMenu);
        }
    }, [handleContextMenu])

    const draw = useCallback(() => {
        if (!svgRef.current || xData.length === 0 || yData.length === 0) return;

        let start = range?.[0] ?? 0;
        let end = range?.[1] ? range[1] + 1 : xData.length;
        const timeStampData = xData.every(x => typeof x === 'string') ? xData.map((d) => new Date(d).getTime()) : xData.slice();
        let keyData = range ? timeStampData.slice(start, end) : timeStampData.slice();
        let valueData = range ? yData.slice(start, end) : yData.slice();
        let data = keyData.map((x, i) => [x, valueData[i]] as [number, number]);

        const isMargin = isXAxisTextVisible || isYAxisTextVisible;
        const margin = { top: isMargin ? 30 : 20, right: isMargin ? 40 : 25, bottom: isMargin ? 30 : 20, left: isMargin ? 40 : 25 };
        const svg = d3.select(svgRef.current);
        svg.attr('width', '100%');
        svg.attr('height', '100%');
        const width = Math.max(10, svgRef.current.clientWidth - margin.left - margin.right);
        let iHeight: number = typeof height === 'string' ? svgRef.current.clientHeight * parseFloat(height) / 100 : height ?? 200;
        iHeight -= margin.top + margin.bottom;
        const xMin = d3.min(keyData)!;
        const xMax = d3.max(keyData)!;
        const yMin = d3.min(valueData)!;
        const yMax = d3.max(valueData)!;
        const xRange = Math.max(1, xMax - xMin);
        const yRange = Math.max(1, yMax - yMin);
        const xScale = [xMin, xMax];
        const yScale = [yMin, yMax];
        let innerWidth = width;
        let innerHeight: number = 0;
        if (height && ratio) {
            const yUnitPixel = iHeight / yRange;
            const xUnitPixel = yUnitPixel * ratio;
            innerWidth = xUnitPixel * xRange / 1000;
            if (innerWidth > width) {
                const scale = width / innerWidth;
                const delta = yRange / scale - yRange;
                yScale[0] -= delta / 2;
                yScale[1] += delta / 2;
            } else {
                const scale = width / innerWidth;
                const delta = xRange * scale - xRange;
                xScale[0] -= delta / 2;
                xScale[1] += delta / 2;
                if (isExpand) {
                    const extentData = timeStampData.map((d, i) => [d, i]).filter((v) => v[0] >= xScale[0] && v[0] <= xScale[1]);
                    keyData = extentData.map((v) => v[0]);
                    valueData = extentData.map((v) => yData[v[1]]);
                    data = keyData.map((x, i) => [x, valueData[i]] as [number, number]);
                    start = Math.max(0, Math.min(...extentData.map((v) => v[1])));
                    end = Math.min(xData.length, Math.max(...extentData.map((v) => v[1])) + 1);
                }
            }
            innerHeight = iHeight;
            innerWidth = width;
            svg.attr("width", innerWidth + margin.left + margin.right);
        } else if (ratio) {
            const xUnitPixel = width / xRange;
            const yUnitPixel = xUnitPixel / ratio;
            innerHeight = yRange * yUnitPixel * 1000;
        } else {
            innerHeight = iHeight;
        }
        const outerHeight = innerHeight + margin.top + margin.bottom;

        svg.attr('height', outerHeight);

        const x = d3.scaleTime()
            .domain(xScale.map((d) => new Date(d)))
            .range([0, innerWidth]);

        const y = d3.scaleLinear()
            .domain(yScale)
            .range([innerHeight, 0]);

        const lineGenerator = d3.line<[number, number]>()
            .x((d) => x(new Date(d[0]))!)
            .y((d) => y(d[1]));

        svg.selectAll('*').remove();

        svg.append("defs")
            .append("clipPath")
            .attr("id", `clip-path-${id}`)
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", innerWidth)
            .attr("height", innerHeight);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        if (isZoom) {
            const zoom = d3.zoom<SVGGElement, unknown>().on("zoom", (event) => {
                g.attr("transform", event.transform);
            });
            g.call(zoom);
        }

        if (isActive) {
            svg.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', outerWidth)
                .attr('height', outerHeight)
                .attr('fill', '#82C4FF33')
        }

        g.append('text')
            .attr('x', 20)
            .attr('text-anchor', 'end')
            .attr('font-size', '16px')
            .attr('fill', textColor)
            .attr('writing-mode', 'sideways-lr')
            .text(title);

        svg.append("defs")
            .append("marker")
            .attr("id", `arrow-${id}`)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 8)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", xAxisColor);

        if (isXAxisVisible) {
            const xAxis = d3.axisBottom(x)
                .tickValues([...new Set([xMin, xMax, ...xScale])])
                .tickFormat((d) => xAxisFormatter(new Date(d as number)))
                .tickSize(isXAxisTextVisible ? 6 : 0);
            
            const xAxisG = g.append('g')
                .attr('transform', `translate(0,${innerHeight})`)
                .call(xAxis)
                .call(g => {
                    g.selectAll('path, line')
                        .attr('stroke', xAxisColor);
                    g.selectAll('text')
                        .attr('fill', xAxisColor)
                        .style('display', isXAxisTextVisible ? 'block' : 'none');
                });

            xAxisG.append('line')
                .attr('x1', innerWidth)
                .attr('y1', 0)
                .attr('x2', innerWidth + 10)
                .attr('y2', 0)
                .attr('stroke', xAxisColor)
                .attr('marker-end', `url(#arrow-${id})`);
        }

        if (isYAxisVisible) {
            const yAxis = d3.axisLeft(y)
                .tickValues([...new Set([yMin, yMax, ...yScale])])
                .tickSize(isYAxisTextVisible ? 6 : 0);
            
            const yAxisG = g.append('g')
                .call(yAxis)
                .call(g => {
                    g.selectAll('path, line')
                        .attr('stroke', yAxisColor);
                    g.selectAll('text')
                        .attr('fill', yAxisColor)
                        .style('display', isYAxisTextVisible ? 'block' : 'none');
                });

            yAxisG.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', 0)
                .attr('y2', -10)
                .attr('stroke', yAxisColor)
                .attr('marker-end', `url(#arrow-${id})`);
        }

        if (range && range[0] !== range[1] || !range) {
            g.append('path')
                .datum(keyData.map((t, i) => [t, valueData[i]] as [number, number]))
                .attr('d', lineGenerator)
                .attr('fill', 'none')
                .attr('stroke', lineColor)
                .attr('stroke-opacity', '0.7')
                .attr("clip-path", `url(#clip-path-${id})`)
                .attr('stroke-width', 1);
        }

        if (split && keyData.length > 2) {
            const splitG = g.append('g').attr('class', 'split-line');
            if (isSplitMask) {
                splitG.attr("clip-path", `url(#clip-path-${id})`)
            }

            const color = d3.color(lineColor);
            const darkerColor = color ? d3.hsl(color).darker(10).toString() : lineColor;

            for (let i = 0; i < split.length - 1; i++) {
                const x1 = x(timeStampData[split[i]])
                const x2 = x(timeStampData[split[i + 1]])
                const y1 = y(yData[split[i]])
                const y2 = y(yData[split[i + 1]]);
                splitG.append('line')
                    .attr('class', 'split-line')
                    .attr('x1', x1)
                    .attr('x2', x2)
                    .attr('y1', y1)
                    .attr('y2', y2)
                    .attr('stroke', darkerColor)
                    .attr('stroke-opacity', '0.5')
                    .attr('stroke-width', 1);
            }
        }

        if (range && isShowRange) {
            g.append('rect')
                .attr('x', x(xMin))
                .attr('y', 0)
                .attr('width', x(xMax) - x(xMin))
                .attr('height', innerHeight)
                .attr('fill', '#3331');
        }

        const areaGenerator = d3.area<[number, number]>()
            .x(d => x(d[0]))
            .y0(y(yMin))
            .y1(d => y(d[1]));

        if (isFill) {
            g.append("path")
                .datum(data)
                .attr("d", areaGenerator)
                .attr("fill", "#82C4FF99");
        }

        if (isBrush) {
            function brushFn(event: d3.D3BrushEvent<[number, number]>) {
                svg.select(".area").remove();
                const selection = event.selection;
                if (!selection) return;
                const [x0, x1] = selection;
                const [minX, maxX] = [x.invert(x0 as number), x.invert(x1 as number)];
                const filteredIndices = getFilteredIndices([minX, maxX]);
                if (isFill) highlightBrush([minX, maxX]);
                onBrush?.((filteredIndices.at(0) || 0) + start, (filteredIndices.at(-1) || 0) + start);
            }

            function getFilteredIndices(selection: [Date, Date]) {
                const [minX, maxX] = selection;
                return data
                    .map((d, i) => ({ index: i, value: d }))
                    .filter(d => d.value[0] >= minX.getTime() && d.value[0] <= maxX.getTime())
                    .map(d => d.index);
            }

            function highlightBrush(selection: [Date, Date]) {
                g.selectAll(".area").remove();
                const filteredIndices = getFilteredIndices(selection);
                g.append("path")
                    .attr("class", "area")
                    .datum(filteredIndices.map(i => data[i]))
                    .attr("d", areaGenerator)
                    .attr("fill", "#82C4FF99");
            }

            const brush = d3.brushX()
                .extent([[0, 0], [innerWidth, innerHeight]]);

            const brushG = svg.append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`)
                .attr("class", "brush")
                .call(brush);

            if (brushPosition) {
                brushG.call(brush.move!, [x(timeStampData[brushPosition[0]]), x(timeStampData[brushPosition[1]])]);
                const minX = new Date(timeStampData[brushPosition[0]]);
                const maxX = new Date(timeStampData[brushPosition[1]]);
                if (isFill) highlightBrush([minX, maxX]);
            }

            brush.on("brush", (event) => brushFn(event))
                .on("end", function (event) {
                    svg.select(".area").remove();
                    const selection = event.selection;
                    if (!selection) {
                        onBrush?.(start, start);
                        onBrushEnd?.(start, start);
                        return;
                    }
                    const [x0, x1] = selection;
                    const [minX, maxX] = [x.invert(x0 as number), x.invert(x1 as number)];
                    const filteredIndices = getFilteredIndices([minX, maxX]);
                    onBrush?.(start + (filteredIndices.at(0) || 0), start + (filteredIndices.at(-1) || 0));
                    onBrushEnd?.(start + (filteredIndices.at(0) || 0), start + (filteredIndices.at(-1) || 0));
                });

            svg.select(".selection")
                .attr("fill", brushColor)
                .attr("clip-path", `url(#clip-path-${id})`)
                .attr("stroke", "none");

            return () => {
                brush.on('brush', null).on('end', null);
                svg.selectAll('*').remove();
            };
        }
    }, [xData, yData, ratio, title, isXAxisVisible, isYAxisVisible, isXAxisTextVisible, isYAxisTextVisible, isBrush, onBrush, isFill, range, height, split, isSplitMask, brushPosition, isZoom, isExpand, isShowRange, id, onBrushEnd, isActive, xAxisColor, yAxisColor, lineColor, textColor, xAxisFormatter, brushColor]);

    useEffect(() => {
        const cancle = draw();
        window.addEventListener('resize', draw);
        return () => {
            window.removeEventListener('resize', draw);
            cancle?.();
        };
    }, [draw]);

    return (
        <>
            <svg ref={svgRef} width="100%" height="100%"></svg>
            {children}
        </>
    );
};

export default memo(LineChart, (prevProps, nextProps) => {
    return Object.keys(prevProps).every((key) => {
        const k = key as keyof LineChartProps;
        if (k === 'children') return false;
        return deepEqual(prevProps[k], nextProps[k]);
    })
});