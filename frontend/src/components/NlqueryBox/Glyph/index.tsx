import { Attribute, Comparator, Relation, Trend } from "../../../types/QuerySpec"
import * as d3 from "d3";
import { deepClone } from "../../../utils/deepclone";
import { getColor } from "../../../utils/color";
import { useEffect, useRef } from "react";

type ClickType = "Trend" | "Relation";

interface GlyphProps {
    trends?: Trend[];
    relations?: Relation[];
    allTrends?: Trend[];
    height?: number;
    curTrend?: number;
    curRelation?: number;
    onClick?: (type: ClickType, index: number) => void;
}

const scale = d3.scaleLinear<string>()
    .domain([-90, 90])
    .range(["#00f", "#f00"]);
const getColorFromAngle = (angle: number) => {
    return scale(angle);
};

const getAverageValue = (trend: Trend) => {
    if (!trend) return 0;
    const scope = trend.angle_scope_condition || trend.slope_scope_condition;
    if (!scope) return 0;
    const min = scope.min?.value ?? -90;
    const max = scope.max?.value ?? 90;
    return (min + max) / 2;
};

const comparatorMap = {
    [Comparator.GREATER]: Comparator.LESS,
    [Comparator.LESS]: Comparator.GREATER,
    [Comparator.NO_GREATER]: Comparator.NO_LESS,
    [Comparator.NO_LESS]: Comparator.NO_GREATER,
    [Comparator.EQUAL]: Comparator.EQUAL,
    [Comparator.APPROXIMATELY_EQUAL_TO]: Comparator.APPROXIMATELY_EQUAL_TO
};

const Glyph = ({ trends = [], relations = [], allTrends = [], height = 32, onClick, curTrend, curRelation }: GlyphProps) => {
    const paddingY = 10;
    const paddingX = 4;
    const trendLength = height - paddingY * 1.5;
    const t = deepClone(trends).map((trends, index) => (trends.index = index, trends));

    const getTrend = (trend: Trend, i: number, showIndex = false) => {
        const angle = getAverageValue(trend) || 0;
        const color = getColorFromAngle(angle);
        const x1 = i * (trendLength) + paddingX;
        const x2 = x1 + trendLength;
        const y1 = angle > 0 ? height - paddingY : paddingY;
        const y2 = angle > 0 ? paddingY : height - paddingY;
        const id = Math.random().toString(36).substring(2, 7);

        return (
            <g key={i} onClick={() => onClick?.("Trend", i)}>
                <defs>
                    <marker id={`arrow-${id}-${i}`} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto" markerUnits="strokeWidth">
                        <path d="M4,2 L0,4 M4,2 L0,0" fill="none" stroke={color} strokeWidth="1" />
                    </marker>
                </defs>
                <rect x={x1} y={paddingY} width={trendLength} height={height - paddingY * 2} fill={curTrend === i ? getColor(i) : "#eee0"} opacity={.5}></rect>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.5} markerEnd={`url(#arrow-${id}-${i})`} />
                {showIndex && <text x={angle > 0 ? x2 - 8 - height / 16 : x1 + height / 16} y={angle > 0 ? y1 : y2} fontSize={height / 4} fill="#000c" fontWeight="bold">{i}</text>}
            </g>
        );
    };

    const drawCircle = (x: number, y: number, r: number = 1.5, color: string = "#000") => {
        return (
            <circle cx={x} cy={y} r={r} fill={color} />
        );
    };

    const drawConnect = (x1: number, y1: number, x2: number, y2: number, v: number, index: number, color: string = "#0005", strokeWidth: number = 1) => {
        return (
            <path onClick={() => onClick?.("Relation", index)} d={`M${x1},${y1} V${v} H${x2} V${y2}`} stroke={curRelation === index ? "#000" : color} style={{
                animation: curRelation === index ? "dashFlow 1s linear infinite" : "none"
            }} fill="none" strokeDasharray="2,2" strokeLinecap="round" strokeWidth={strokeWidth} />
        )
    };

    const drawComparator = (x: number, y: number, comparator: Comparator, index: number, reverse: boolean = false, color: string = "#000") => {
        const newComparator = reverse && comparatorMap[comparator] ? comparatorMap[comparator] : comparator;
        return (
            <text onClick={() => onClick?.("Relation", index)} x={x} y={y} fontSize={height / 3} fill={color} fontWeight={700} textAnchor="middle">{newComparator}</text>
        )
    }

    relations.forEach((relation) => {
        let trendIndex1 = t.findIndex(t => t.index === relation.id1);
        let trendIndex2 = t.findIndex(t => t.index === relation.id2);
        if (trendIndex1 === -1 || trendIndex2 === -1) {
            trendIndex1 = allTrends.findIndex(t => t.index === relation.id1);
            trendIndex2 = allTrends.findIndex(t => t.index === relation.id2);
            if (trendIndex1 === -1 || trendIndex2 === -1) return null;
            if (!t.find(t => t.index === allTrends[trendIndex1].index)) {
                t.push(allTrends[trendIndex1]);
            }
            if (!t.find(t => t.index === allTrends[trendIndex2].index)) {
                t.push(allTrends[trendIndex2]);
            }
        }
    })

    const relationLines = relations.map((relation, i) => {
        const trendIndex1 = t.findIndex(t => t.index === relation.id1);
        const trendIndex2 = t.findIndex(t => t.index === relation.id2);

        const trend1 = t[trendIndex1];
        const trend2 = t[trendIndex2];
        const isReverse = trendIndex1 > trendIndex2;

        const isEnd = relation.attribute === Attribute.END_VALUE;
        const isStart = relation.attribute === Attribute.START_VALUE;

        if (isStart || isEnd) {
            const offset = isEnd ? trendLength + paddingX : paddingX;

            const x1 = trendIndex1 * trendLength + offset;
            const x2 = trendIndex2 * trendLength + offset;

            const is1 = isEnd && getAverageValue(trend1) > 0 || isStart && getAverageValue(trend1) < 0;
            const is2 = isEnd && getAverageValue(trend2) > 0 || isStart && getAverageValue(trend2) < 0;

            const y1 = is1 ? paddingY : height - paddingY;
            const y2 = is2 ? paddingY : height - paddingY;

            return (
                <g key={i}>
                    {drawConnect(x1, y1, x2, y2, is1 ? y1 - 6 : y1 + 6, i)}
                    {drawCircle(x1, y1)}
                    {drawCircle(x2, y2)}
                    {drawComparator((x1 + x2) / 2, is1 ? y1 : y1 + height / 4, relation.comparator!, i, isReverse)}
                </g>
            );
        }

        const isAngle = relation.attribute === Attribute.ANGLE;
        const isSlope = relation.attribute === Attribute.SLOPE;

        if (isAngle || isSlope) {
            const angle1 = getAverageValue(trend1);
            const angle2 = getAverageValue(trend2);

            const x1 = trendIndex1 * trendLength + paddingX;
            const x2 = trendIndex2 * trendLength + paddingX;

            const y1 = angle1 > 0 ? height - paddingY : paddingY;
            const y2 = angle2 > 0 ? height - paddingY : paddingY;

            const arcRadius = height / 4;

            const createArc = (angle: number) => d3.arc()
                .innerRadius(0)
                .outerRadius(arcRadius)
                .startAngle(Math.PI / 2)
                .endAngle(Math.PI * (angle < 0 ? 9 / 13 : 4 / 13));

            return (
                <g key={i}>
                    {/* @ts-expect-error null */}
                    <path d={createArc(angle1)()} transform={`translate(${x1},${y1})`} stroke="#0008" fill="none" />
                    {/* @ts-expect-error null */}
                    <path d={createArc(angle2)()} transform={`translate(${x2},${y2})`} stroke="#0008" fill="none" />
                    {drawConnect(x1 + height / 8, y1, x2 + height / 8, y2, paddingY / 2, i)}
                    {drawComparator((x1 + x2) / 2 + 4, paddingY, relation.comparator!, i, isReverse)}
                </g>
            );
        }

        const isSpan = relation.attribute === Attribute.TIME_SPAN;

        if (isSpan) {
            const offset = trendLength;
            const x11 = trendIndex1 * trendLength + paddingX;
            const x12 = x11 + offset;
            const x21 = trendIndex2 * trendLength + paddingX;
            const x22 = x21 + offset;
            const y = height - paddingY;

            return (
                <g key={i}>
                    {drawConnect(x11, y, x12, y, y + 2, -1, "#0008")}
                    {drawConnect(x21, y, x22, y, y + 2, -1, "#0008")}
                    {drawConnect((x12 + x11) / 2, y + 2, (x21 + x22) / 2, y + 2, y + 6, i)}
                    {drawComparator((x12 + x21) / 2, y + height / 4, relation.comparator!, i, isReverse)}
                </g>
            );
        }

        return null;
    });

    const trendLines = t.map((trend, i) => getTrend(trend, i, true));

    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null);
    useEffect(() => {
        if (!svgRef.current || !gRef.current) return;

        const svg = d3.select(svgRef.current);
        const g = d3.select(gRef.current);
        const bbox = g.node()?.getBBox();
        if (!bbox) return;

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        const scale = 1;
        const translateX = (width - bbox.width * scale) / 2 - bbox.x * scale;
        const translateY = (height - bbox.height * scale) / 2 - bbox.y * scale;

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 5])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);
        g.attr("transform", `translate(${translateX}, ${translateY}) scale(${scale})`);
    }, [trends, relations]);

    return (
        <svg width={'100%'} height={'100%'} ref={svgRef}>
            <g ref={gRef}>
                {trendLines}
                {relationLines}
            </g>
        </svg>
    );
};

export default Glyph;