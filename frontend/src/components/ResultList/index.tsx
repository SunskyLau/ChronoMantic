import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { QuerySpec } from '../../types/QuerySpec';
import { setFragmentsIndex, setQuerySpecIndex } from '../../app/slice/stateSlice';

function stringifyQuerySpec(querySpec: QuerySpec): string {
    const parts: string[] = [];
    if (querySpec.patterns) {
        const patternsStr = querySpec.patterns.map(p => `${p.trend ?? 'null'}-${p.extent ?? 'null'}`).join(", ");
        parts.push(`Patterns: [${patternsStr}]`);
    }
    if (querySpec.y_max_condition) {
        const yMaxConditionStr = `${querySpec.y_max_condition.comparator ?? 'null'}:${querySpec.y_max_condition.value ?? 'null'}`;
        parts.push(`Y_Max_Condition: [${yMaxConditionStr}]`);
    }
    if (querySpec.y_min_condition) {
        const yMinConditionStr = `${querySpec.y_min_condition.comparator ?? 'null'}:${querySpec.y_min_condition.value ?? 'null'}`;
        parts.push(`Y_Min_Condition: [${yMinConditionStr}]`);
    }
    if (querySpec.start_time) {
        parts.push(`Start_Time: ${querySpec.start_time}`);
    }
    if (querySpec.end_time) {
        parts.push(`End_Time: ${querySpec.end_time}`);
    }
    return parts.join(", ");
}

export default function ResultList() {
    const svgRef = useRef<SVGSVGElement>(null);
    const querySpecList = useAppSelector(state => state.states.querySpecList);
    const data = querySpecList.map((querySpec) => stringifyQuerySpec(querySpec));
    const querySpecIndex = useAppSelector(state => state.states.querySpecIndex);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const height = 40;
        svg.attr("height", height);

        const textPadding = 30;
        const edgeLengths = data.map((text) => text.length * 6 + textPadding);

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
            .attr("refX", 22)
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
            .attr("r", (d) => querySpecIndex === d.id - 1 ? 18 : 15)
            .attr("fill", (d) => querySpecIndex === d.id - 1 ? "steelblue" : "lightblue")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("cursor", "pointer")
            .on("click", (_, d) => {
                dispatch(setQuerySpecIndex(d.id - 1));
                dispatch(setFragmentsIndex(d.id - 1));
            });

        svg.selectAll(".node-label")
            .data(nodes)
            .join("text")
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y + 6)
            .attr("text-anchor", "middle")
            .text((d) => d.id)
            .attr("pointer-events", "none")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("fill", "white");

        return () => {
            svg.selectAll("circle").on("click", null);
            svg.selectAll("*").remove();
        };
    }, [data, dispatch, querySpecIndex]);

    return (
        <div style={{ overflowX: "auto", overflowY: "hidden", minWidth: "0" }}>
            <svg height={40} ref={svgRef} />
        </div>
    );
}