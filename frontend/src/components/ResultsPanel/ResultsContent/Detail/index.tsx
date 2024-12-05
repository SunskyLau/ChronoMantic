import * as d3 from "d3";
import type { ResultItem, Segment } from "../../../../app/slice/resultsSlice";
import { useEffect, useMemo, useRef, useState } from "react";
import { getColor } from "../../../../utils/color";
import { sendQueryTSRequest } from "../../../../api";
import { DataType } from "..";

interface DetailProps {
    data: DataType[];
    segments?: Segment[][];
    results?: ResultItem[];
    name: string;
}

export default function Detail({ data, segments, results }: DetailProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedSegment, setSelectedSegment] = useState<Segment[] | null>(null);

    const handleSelect = (segment: Segment[] | null) => {
        setSelectedSegment(segment);
    };

    useEffect(() => {
        if (!svgRef.current || !containerRef.current || !data.length) return;

        // 清除之前的内容
        d3.select(svgRef.current).selectAll("*").remove();

        // 获取容器宽度
        const containerWidth = containerRef.current.offsetWidth;

        // 设置尺寸和边距
        const height = 120;
        const margin = { top: 20, right: 30, bottom: 30, left: 60 };
        const width = containerWidth - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // 创建SVG
        const svg = d3.select(svgRef.current)
            .attr("width", containerWidth)
            .attr("height", height);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // 创建比例尺
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date) as [Date, Date])
            .range([0, width]);

        // 获取y轴的最大最小值，并调整到整百
        const minValue = Math.floor(d3.min(data, d => d.value)! / 100) * 100;
        const maxValue = Math.ceil(d3.max(data, d => d.value)! / 100) * 100;

        const y = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range([innerHeight, 0]);

        // 创建x轴
        const xAxis = d3.axisBottom(x)
            .ticks(width / 100)
            .tickFormat((domainValue: Date | d3.NumberValue) => {
                if (domainValue instanceof Date) {
                    return d3.timeFormat("%Y")(domainValue);
                }
                return '';
            });

        // 添加x轴
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xAxis);

        // 添加y轴最大最小值标签
        g.append("text")
            .attr("x", -10)
            .attr("y", y(maxValue))
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .attr("fill", "#666")
            .attr("font-size", "12px")
            .text(maxValue);

        g.append("text")
            .attr("x", -10)
            .attr("y", y(minValue))
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .attr("fill", "#666")
            .attr("font-size", "12px")
            .text(minValue);

        // 创建线条生成器
        const line = d3.line<{ date: Date; value: number }>()
            .x(d => x(d.date))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);

        // 绘制主线条
        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        // 添加segment区域
        segments?.forEach(segment => {
            const startDate = data[segment[0].start].date;
            const endDate = data[segment[segment.length - 1].end].date;
            const segmentStart = x(startDate);
            const segmentEnd = x(endDate);

            // 添加灰色背景
            g.append("rect")
                .attr("x", segmentStart)
                .attr("y", 0)
                .attr("width", segmentEnd - segmentStart)
                .attr("height", innerHeight)
                .attr("fill", "rgba(0, 0, 0, 0.1)")
                .style("cursor", "pointer")
                .on("mouseenter", () => handleSelect(segment))
                .on("mouseleave", () => handleSelect(null))
                .attr("stroke", "#999")
                .attr("stroke-width", 1);

            // 如果是选中的segment，添加边框
            if (selectedSegment && selectedSegment === segment) {
                g.append("rect")
                    .attr("x", segmentStart)
                    .attr("y", 0)
                    .attr("width", segmentEnd - segmentStart)
                    .attr("height", innerHeight)
                    .attr("fill", "none")
                    .attr("stroke", "#000")
                    .attr("stroke-width", 1);
            }
        });
    }, [data, segments, selectedSegment]);

    return (
        <div className="dataset-detail" ref={containerRef}>
            <svg ref={svgRef}></svg>
            {results && results?.map((resultItem) => (
                <ResultItem key={resultItem.start + resultItem.end + Date.now()} item={resultItem} data={data} isActive={selectedSegment === resultItem.segments} />
            ))}
        </div>
    );
}


interface ResultItemProps {
    item: ResultItem;
    data: DataType[];
    isActive: boolean;
}

function ResultItem({ item, data, isActive }: ResultItemProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const brushRef = useRef<d3.BrushBehavior<unknown>>();
    const xRef = useRef<d3.ScaleTime<number, number, never> | null>(null);
    const yRef = useRef<d3.ScaleLinear<number, number, never> | null>(null);
    const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
    const [splitPoints, setSplitPoints] = useState<Array<Date>>([]);
    const [brushSelection, setBrushSelection] = useState<[number, number] | null>(null);
    const prevSelection = useRef<[number, number] | null>(null);
    const [prevTrend, setPrevTrend] = useState<string[][] | null>(null);

    const height = 100;
    const showLength = item.end - item.start;
    const space = Math.floor(showLength / 2);
    const margin = useMemo(() => ({ top: 20, right: 20, bottom: 30, left: 50 }), []);
    const showStart = Math.max(item.start - space, 0);
    const showEnd = Math.min(item.end + space, data.length - 1);
    const innerHeight = height - margin.top - margin.bottom;

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;
        d3.select(svgRef.current).selectAll("*").remove();

        const containerWidth = containerRef.current.offsetWidth;
        const innerWidth = containerWidth - margin.left - margin.right;
        const segmentData = data.slice(showStart, showEnd + 1);
        const minValue = Math.floor(d3.min(segmentData, d => d.value)! / 50) * 50;
        const maxValue = Math.ceil(d3.max(segmentData, d => d.value)! / 50) * 50;

        const svg = d3.select(svgRef.current)
            .attr("width", containerWidth)
            .attr("height", height);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        gRef.current = g;

        const x = d3.scaleTime()
            .domain([data[showStart].date, data[showEnd].date])
            .range([0, innerWidth]);

        xRef.current = x;

        const y = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range([innerHeight, 0]);

        yRef.current = y;

        const xAxis = d3.axisBottom(x)
            .ticks(5)
            .tickSize(5)
            .tickFormat(d => d3.timeFormat("%Y-%m")(d as Date));

        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xAxis)
            .attr("font-family", "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial")
            .attr("font-size", "12px");

        g.append("text")
            .attr("x", -5)
            .attr("y", 0)
            .attr("text-anchor", "end")
            .attr("fill", "#666")
            .attr("font-size", "12px")
            .text(maxValue);

        g.append("text")
            .attr("x", -5)
            .attr("y", innerHeight)
            .attr("text-anchor", "end")
            .attr("fill", "#666")
            .attr("font-size", "12px")
            .text(minValue);

        const line = d3.line<DataType>()
            .x(d => x(d.date))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);

        g.append("path")
            .datum(segmentData)
            .attr("fill", "none")
            .attr("stroke", "#666")
            .attr("stroke-width", 1)
            .attr("pointer-events", "none")
            .attr("d", line);
    }, [item, data, innerHeight, splitPoints, brushSelection, margin, showEnd, showStart]);

    useEffect(() => {
        if (!gRef.current || !xRef.current || !yRef.current || !containerRef.current) return;
        const x = xRef.current;
        const y = yRef.current;
        const g = gRef.current;
        const containerWidth = containerRef.current.offsetWidth;
        const innerWidth = containerWidth - margin.left - margin.right;
        const tempSplitPoints = g.append("g")
            .attr("class", "temp-split-lines");
        const splitLines = g.append("g")
            .attr("class", "split-lines");
        const segmentData = data.slice(showStart, showEnd + 1);

        function drawSplitLines(g: d3.Selection<SVGGElement, unknown, null, undefined>, splitPoint: Date) {
            const dataPoint = segmentData.find((d) => d.date === splitPoint);
            if (!dataPoint) return;
            g.append("line")
                .attr("x1", x(dataPoint.date))
                .attr("x2", x(dataPoint.date))
                .attr("y1", 0)
                .attr("y2", innerHeight)
                .attr("stroke", "red")
                .attr("stroke-width", 1.5)
                .attr("stroke-dasharray", "4,4");

            g.append("circle")
                .attr("cx", x(dataPoint.date))
                .attr("cy", y(dataPoint.value))
                .attr("r", 4)
                .attr("fill", "red");
        }

        // 绘制所有分割线
        splitPoints.forEach((splitPoint) => {
            drawSplitLines(splitLines, splitPoint);
        });

        const brush = d3.brushX<unknown>()
            .extent([[0, 0], [innerWidth, innerHeight]])
            .on("end", (event: d3.D3BrushEvent<unknown>) => {
                if (!event.sourceEvent) return;
                if (!event.selection) {
                    setPrevTrend(null)
                    setBrushSelection(null)
                    setSplitPoints(()=>[])
                    return;
                }
                if (event.mode === "drag" && prevSelection.current && prevSelection.current[0] === event.selection[0] && prevSelection.current[1] === event.selection[1]) return;
                setSplitPoints(() => [])
                setBrushSelection(event.selection as [number, number]);
                setPrevTrend(null)
            })
            .on("start", (event) => {
                if (!event.sourceEvent) return;
                if (!event.selection) return;
                prevSelection.current = event.selection as [number, number];
                tempSplitPoints.selectAll("*").remove();
            })

        brushRef.current = brush;

        const brushG = gRef.current.append("g")
            .attr("class", "brush")
            .call(brush)
            .on("mousemove", (event: MouseEvent) => {
                const currentSelection = brushSelection || d3.brushSelection(brushG.node()!) as [number, number] | null;
                if (!currentSelection) return;
                if (!d3.brushSelection(brushG.node()!)) return;
                const [x0, x1] = currentSelection;
                const mouseX = d3.pointer(event)[0];
                tempSplitPoints.selectAll("*").remove();

                // 检查鼠标是否在brush选择区域内
                if (mouseX > x0 && mouseX < x1) {
                    const xValue = x.invert(mouseX);
                    const bisect = d3.bisector((d: DataType) => d.date).left;
                    const index = bisect(segmentData, xValue);
                    const dataPoint = segmentData[index];
                    drawSplitLines(tempSplitPoints, dataPoint.date)
                }
            }).on("mouseleave", () => {
                tempSplitPoints.selectAll("*").remove();
            })

        brushG.select(".selection").attr("stroke", "#666").attr("fill", "#ccc");

        if (brushSelection) {
            brushG.call(brush.move, brushSelection);
        }

        // 处理右键点击事件
        brushG.on("contextmenu", (event: MouseEvent) => {
            event.preventDefault();
            const currentSelection = brushSelection || d3.brushSelection(brushG.node()!) as [number, number] | null;
            if (!currentSelection) return;

            const [x0, x1] = currentSelection;
            const mouseX = d3.pointer(event)[0];

            // 检查鼠标是否在brush选择区域内
            if (mouseX >= x0 && mouseX <= x1) {
                const xValue = x.invert(mouseX);
                const bisect = d3.bisector((d: DataType) => d.date).left;
                const index = bisect(segmentData, xValue);
                const dataPoint = segmentData[index];

                // 添加新的分割点
                setSplitPoints(prev => {
                    // 检查是否已存在相同的分割点
                    if (!prev.some(point => point.getTime() === dataPoint.date.getTime())) {
                        return [...prev, dataPoint.date];
                    }
                    return prev;
                });
                setPrevTrend(null);
            }
        })

        return () => {
            brushG.on("contextmenu", null);
            if (brushRef.current) {
                brushRef.current.on("brush", null).on("end", null);
            }
        };
    }, [brushSelection, splitPoints, data, showStart, showEnd, margin, innerHeight])

    useEffect(() => {
        if (!svgRef.current || !containerRef.current || !xRef.current || !brushSelection || !splitPoints) return;
        const x = xRef.current;
        const [start, end] = brushSelection.map(x.invert);
        const segments = []
        const allPoints = [start, ...splitPoints, end];
        allPoints.sort((a, b) => a.getTime() - b.getTime());
        for (let i = 0; i < allPoints.length - 1; i++) {
            const currentIndex = data.findIndex(d => d.date >= allPoints[i]);
            const nextIndex = data.findIndex(d => d.date >= allPoints[i + 1]);
            segments.push(data.slice(currentIndex, nextIndex + 1).map(d => d.value));
        }

        sendQueryTSRequest(segments).then((result) => {
            setPrevTrend(result);
        })
    }, [splitPoints, brushSelection, data, showStart, showEnd]);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current || !xRef.current || !gRef.current || !brushSelection || !splitPoints || !prevTrend) return;
        const x = xRef.current;
        const [start, end] = brushSelection.map(x.invert);
        const allPoints = [start, ...splitPoints, end];
        allPoints.sort((a, b) => a.getTime() - b.getTime());
        function drawTrendText(trend: string[][]) {
            for (let i = 0; i < allPoints.length - 1; i++) {
                const prevIndex = data.findIndex(d => d.date >= allPoints[i]);
                const currentIndex = data.findIndex(d => d.date >= allPoints[i + 1]);
                const segmentStartDate = data[prevIndex].date;
                const segmentEndDate = data[currentIndex].date;

                // 计算文本位置（在段的中间）
                const textX = (x(segmentEndDate) + x(segmentStartDate)) / 2 + margin.left;

                // 添加文本
                d3.select(svgRef.current)
                    .append('text')
                    .attr('class', 'segment-text')
                    .attr('x', textX)
                    .attr('y', 15)
                    .attr('text-anchor', 'middle')
                    .text(trend[i]?.join(",") || "None");
            }
        }
        drawTrendText(prevTrend);
    }, [prevTrend, brushSelection, data, splitPoints, margin])

    useEffect(() => {
        if (!xRef.current || !yRef.current || !gRef.current) return;
        const x = xRef.current;
        const y = yRef.current;
        item.segments.forEach((segment, i) => {
            const line2 = d3.line<DataType>()
                .x(d => x(d.date))
                .y(d => y(d.value))
                .curve(d3.curveCardinal);
            if (!gRef.current) return;
            gRef.current.append("path")
                .datum(data.slice(segment.start, segment.end + 1))
                .attr("fill", "none")
                .attr("stroke", getColor(i))
                .attr("stroke-width", 3)
                .attr("pointer-events", "none")
                .attr("d", line2);
        });
    }, [item, data, brushSelection, splitPoints]);

    return (
        <div className={`result-item ${isActive ? 'active' : ''}`} ref={containerRef}>
            <svg ref={svgRef}></svg>
        </div>
    );
}