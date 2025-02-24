import { Comparator, GroupRelationWithSource, QuerySpecWithSource, ScopeConditionWithSource, SingleAttribute, SingleRelationWithSource, TargetWithSource, TrendGroupWithSource, TrendWithSource } from "../../../types/QuerySpec";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import type { DefaultArcObject } from "d3-shape";
import { ZoomTransform } from "d3";
import { getColorFromMap } from "../../../utils/color";
import { formatTime } from "../../../utils/time";

type ClickType = "Trend" | "Relation" | "GroupRelation";

const DISABLED_COLOR = "#0001";
const DEFAULT_COLOR = "#0002";

interface GlyphProps {
	targets?: TargetWithSource[];
	trends?: TrendWithSource[];
	trend_groups?: TrendGroupWithSource[];
	single_relations?: SingleRelationWithSource[];
	group_relations?: GroupRelationWithSource[];
	allTrends?: TrendWithSource[];
	height?: number;
	curTrend?: number;
	curRelation?: number;
	colorMap?: Record<string, string>;
	query?: QuerySpecWithSource | null;
	onClick?: (type: ClickType, index: number) => void;
}

const comparatorMap = {
	[Comparator.GREATER]: Comparator.LESS,
	[Comparator.LESS]: Comparator.GREATER,
	[Comparator.NO_GREATER]: Comparator.NO_LESS,
	[Comparator.NO_LESS]: Comparator.NO_GREATER,
	[Comparator.EQUAL]: Comparator.EQUAL,
	[Comparator.APPROXIMATELY_EQUAL_TO]: Comparator.APPROXIMATELY_EQUAL_TO,
};

const getTrendInfo = (trend: TrendWithSource) => {
	if (!trend) return { isFlat: false, isUp: false, isDown: false };
	return {
		isFlat: trend.category.category === "flat",
		isUp: trend.category.category === "up",
		isDown: trend.category.category === "down",
	};
};

const getTextSourceFromQuery = (query: QuerySpecWithSource | null, text_source_id?: number) => {
	if (!query || text_source_id === undefined || text_source_id < 0) return undefined;
	return query.text_sources[text_source_id];
};

const getColorWithDisabled = (colorMap: Record<string, string>, query: QuerySpecWithSource | null, text_source_id?: number) => {
	if (text_source_id === undefined || text_source_id < 0) return "#0008";
	const textSource = getTextSourceFromQuery(query, text_source_id);
	if (!textSource || textSource.disabled) return "#eee";
	return getColorFromMap(colorMap, text_source_id);
};

const getScopeText = (scope: ScopeConditionWithSource, valueFormat: number = 1) => {
	if (!scope) return null;
	const { min, max } = scope;
	if (min && max) {
		return `${min.inclusive ? "[" : "("}${min.value / valueFormat}, ${max.value / valueFormat}${max.inclusive ? "]" : ")"}`;
	} else if (min) {
		return `${min.inclusive ? "≥" : ">"}${min.value / valueFormat}`;
	} else if (max) {
		return `${max.inclusive ? "≤" : "<"}${max.value / valueFormat}`;
	}
	return "";
};

interface TextWithColor {
	text: string;
	color: string;
}

const getSlopeText = (trend: TrendWithSource, colorMap: Record<string, string>, query: QuerySpecWithSource | null) => {
	const { category, ...conditions } = trend;
	if (!Object.keys(conditions).length || !category) return null;
	const texts: Record<string, TextWithColor> = {};
	Object.entries(conditions).forEach(([key, value]) => {
		if (value) {
			texts[key] = {
				text: getScopeText(value) ?? "",
				color: getColorWithDisabled(colorMap, query, value.text_source_id),
			};
		}
	});
	return texts;
};

const hasOverlap = (range1: [number, number], range2: [number, number]) => {
	const [start1, end1] = range1;
	const [start2, end2] = range2;
	const minStart = Math.max(start1, start2);
	const maxEnd = Math.min(end1, end2);
	return minStart < maxEnd;
};

const calculateTimeRangeLevels = (trends: TrendWithSource[], trend_groups: TrendGroupWithSource[], trendLength: number) => {
	const timeRanges: {
		type: "trend" | "group";
		range: [number, number];
		index: number;
		level: number;
	}[] = [];

	trends.forEach((trend, i) => {
		if (trend.time_span_condition) {
			timeRanges.push({
				type: "trend",
				range: [i * trendLength, (i + 1) * trendLength],
				index: i,
				level: 0,
			});
		}
	});

	trend_groups.forEach((group, i) => {
		const startIndex = group.ids[0];
		const endIndex = group.ids[1];
		timeRanges.push({
			type: "group",
			range: [startIndex * trendLength, (endIndex + 1) * trendLength],
			index: i,
			level: 0,
		});
	});

	// 计算每个时间范围的层级
	timeRanges.forEach((range1, i) => {
		for (let j = 0; j < i; j++) {
			const range2 = timeRanges[j];
			if (hasOverlap(range1.range, range2.range)) {
				range1.level = Math.max(range1.level, range2.level + 1);
			}
		}
	});

	return timeRanges;
};


const Glyph = ({ trends = [], trend_groups = [], single_relations = [], group_relations = [], height = 32, onClick, curTrend, curRelation, query, colorMap = {}, targets = [] }: GlyphProps) => {
	const trendLength = height;
	const disabled = curRelation !== -1;
	const width = trends.length * trendLength;
	const levelMap: Record<string, [number, number][]> = {};

	const showTooltip = (texts: Record<string, TextWithColor>, x1: number, y1: number) => {
		const tooltip = d3.select("body").append("div")
			.attr("class", "glyph-tooltip")
			.style("position", "absolute")
			.style("background", "#0008")
			.style("color", "#fff")
			.style("padding", "2px")
			.style("border", "1px solid #ccc")
			.style("border-radius", "6px")
			.style("pointer-events", "none")
			.style("transform", "translate(-50%, -100%)")
			.style("opacity", 0);
		tooltip.transition()
			.duration(200)
			.style("opacity", 1);
		tooltip.html(Object.entries(texts).map(([key, value]) => `<div class="active-component" style="margin:2px;padding: 4px 8px;background-color: ${value.color};">${key}: ${value.text}</div>`).join(""))
			.style("left", `${x1}px`)
			.style("top", `${y1}px`);
	};

	const hideTooltip = () => {
		d3.selectAll(".glyph-tooltip").remove();
	};

	const getLevel = (x1: number, x2: number) => {
		let level = 0;
		const min = Math.min(x1, x2);
		const max = Math.max(x1, x2);
		while (true) {
			if (!levelMap[level]) {
				levelMap[level] = [];
			}
			if (levelMap[level].some((line) => hasOverlap(line, [min, max]))) {
				level++;
			} else {
				break;
			}
		}
		levelMap[level].push([x1, x2]);
		return level;
	};

	const getV = (level: number) => {
		return - (level + 1) * 8;
	};


	const drawTimeIndicator = ({ startX, endX, textY, timeColor, timeText, key, strokeWidth = 1, disabled = false, index }: { startX: number; endX: number; textY: number; timeColor: string; timeText?: string; key?: string, strokeWidth?: number, disabled?: boolean, index?: number }) => {
		const lineHeight = height / 24;
		const fontSize = 6;
		const textWidth = timeText ? timeText.length * fontSize / 2 + fontSize * 2 : 0;
		const isActive = index === curRelation;
		const color = isActive ? timeColor.slice(0, 7) : disabled ? DISABLED_COLOR : timeColor;

		return (
			<g key={key}>
				<line
					x1={startX + strokeWidth / 2}
					y1={textY - lineHeight}
					x2={startX + strokeWidth / 2}
					y2={textY + lineHeight}
					stroke={color}
					strokeWidth={strokeWidth}
				/>
				<line
					x1={endX - strokeWidth / 2}
					y1={textY - lineHeight}
					x2={endX - strokeWidth / 2}
					y2={textY + lineHeight}
					stroke={color}
					strokeWidth={strokeWidth}
				/>
				<text
					x={(startX + endX) / 2}
					y={textY + fontSize / 16}
					fontSize={fontSize}
					fill={color}
					fontWeight={700}
					textAnchor="middle"
					dominantBaseline="middle"
				>
					{timeText}
				</text>
				<line
					x1={startX + strokeWidth}
					y1={textY}
					x2={Math.max(startX, (startX + endX - textWidth) / 2)}
					y2={textY}
					stroke={color}
					strokeWidth={strokeWidth}
				/>
				<line
					x1={Math.min(endX, (startX + endX + textWidth) / 2)}
					y1={textY}
					x2={endX - strokeWidth}
					y2={textY}
					stroke={color}
					strokeWidth={strokeWidth}
				/>
			</g>
		);
	};

	const points = useRef<{ x1: number; y1: number; x2: number; y2: number; isUp: boolean; isDown: boolean }[]>(Array(trends.length).fill(null));
	const getConsecutiveInfo = () => {
		const consecutiveCounts = [];
		let consecutiveCount = 1;
		let count = 0;

		for (let j = 0; j < trends.length; j++) {
			count++;
			const currentTrend = trends[j];
			const nextTrend = trends[j + 1];
			const { isUp: currentIsUp, isDown: currentIsDown } = getTrendInfo(currentTrend);
			const { isUp: nextIsUp, isDown: nextIsDown } = getTrendInfo(nextTrend);
			if ((currentIsDown && nextIsDown) || (currentIsUp && nextIsUp)) {
				consecutiveCount++;
			} else {
				consecutiveCounts.push(...Array(count).fill(consecutiveCount).map((_, i) => (consecutiveCount - i)));
				consecutiveCount = 1;
				count = 0;
			}
		}

		return consecutiveCounts;
	};
	const consecutiveCounts = getConsecutiveInfo();

	const getTrend = (trend: TrendWithSource, i: number, showIndex = false) => {
		if (!query) return null;
		const { isUp, isDown } = getTrendInfo(trend);
		const color = getColorWithDisabled(colorMap, query, trend.category.text_source_id);
		const x1 = i * trendLength;
		const x2 = x1 + trendLength;
		const y = height / 2;
		const prevEndPoint = points.current[i - 1] ?? null;

		const getYPositions = () => {
			if (!prevEndPoint) {
				return {
					y1: isUp ? height : isDown ? 0 : y,
					y2: isUp ? height - height / consecutiveCounts[i] : isDown ? height / consecutiveCounts[i] : y
				};
			}
			if (!isUp && !isDown) {
				return {
					y1: prevEndPoint.y2,
					y2: prevEndPoint.y2
				};
			}
			const step = isUp ? prevEndPoint.y2 / consecutiveCounts[i] : (height - prevEndPoint.y2) / consecutiveCounts[i];
			const startY = prevEndPoint.y2;
			let endY;

			if ((isUp && prevEndPoint.isUp) || (isDown && prevEndPoint.isDown)) {
				endY = isUp ? startY - step : startY + step;
			} else {
				endY = isUp ? height - step : step;
			}

			return { y1: startY, y2: endY };
		};

		const { y1, y2 } = getYPositions();
		const id = Math.random().toString(36).substring(2, 7);

		const getControlPoints = () => {
			const controlPointOffset = 0;
			const cp1x = prevEndPoint ? prevEndPoint.x2 + controlPointOffset : x1 + controlPointOffset;
			const cp1y = prevEndPoint ? prevEndPoint.y2 : y1;
			const cp2x = x2 - controlPointOffset;
			const cp2y = y2;
			return { cp1x, cp1y, cp2x, cp2y };
		};

		const controlPoints = getControlPoints();
		const texts = getSlopeText(trend, colorMap, query) ?? {};
		const currentPoint = { x1: prevEndPoint ? prevEndPoint.x2 : x1, y1: prevEndPoint ? prevEndPoint.y2 : y1, x2, y2, isUp, isDown };
		points.current[i] = currentPoint;
		const arcRadius = height / 6;

		const createArc = () => {
			const arc = d3
				.arc()
				.innerRadius(0)
				.outerRadius(arcRadius)
				.startAngle(Math.PI / 2)
				.endAngle(Math.atan((y2 - y1) / (x2 - x1)) + Math.PI / 2);
			return arc({} as DefaultArcObject) || "";
		};

		return (
			<g
				key={i}
				onClick={() => onClick?.("Trend", i)}
			>
				<defs>
					<marker
						id={`arrow-${id}-${i}`}
						markerWidth="4"
						markerHeight="4"
						refX="3"
						refY="2"
						orient="auto"
						markerUnits="strokeWidth"
					>
						<path
							d="M0,0 L4,2 L0,4"
							fill="none"
							stroke={color}
							strokeWidth="1"
						/>
					</marker>
				</defs>
				<rect
					x={x1}
					y={0}
					width={trendLength}
					height={height}
					fill={curTrend === i ? color : "#eee0"}
					opacity={0.5}
				/>
				<path
					d={`M${currentPoint.x1},${currentPoint.y1} 
						C${controlPoints.cp1x},${controlPoints.cp1y}
						${controlPoints.cp2x},${controlPoints.cp2y} 
						${currentPoint.x2},${currentPoint.y2}`}
					stroke={color}
					strokeWidth={1.5}
					fill="none"
					markerEnd={`url(#arrow-${id}-${i})`}
				/>
				{Object.keys(texts)?.length && <path
					d={createArc()}
					transform={`translate(${x1},${y1})`}
					stroke={color}
					fill={color}
					onMouseEnter={(e) => showTooltip(texts, e.clientX, e.clientY - 20)}
					onMouseLeave={() => hideTooltip()}
				/>}
				{showIndex && (
					<text
						x={x1 + height / 16}
						y={y1}
						fontSize={height / 4}
						fill="#000c"
						fontWeight="bold"
					>
						{i}
					</text>
				)}
			</g>
		);
	};

	const trendLines = trends.map((trend, i) => getTrend(trend, i));

	const drawCircle = (x: number, y: number, r: number = 1.5, color: string = "#000", disabled: boolean = false) => {
		return (
			<circle
				cx={x}
				cy={y}
				r={r}
				fill={disabled ? DISABLED_COLOR : color}
			/>
		);
	};

	const drawConnect = (x1: number, y1: number, x2: number, y2: number, v: number, index: number, color: string = DEFAULT_COLOR, disabled: boolean = false, strokeWidth: number = 1) => {
		const isCurRelation = curRelation === index;
		return (
			<path
				onClick={() => onClick?.("Relation", index)}
				d={`M${x1},${y1} V${v} H${x2} V${y2}`}
				stroke={isCurRelation ? color.slice(0, 7) : disabled ? DISABLED_COLOR : color}
				style={{
					animation: isCurRelation ? "dashFlow 1s linear infinite" : "none",
				}}
				fill="none"
				strokeDasharray={"2,2"}
				strokeLinecap="round"
				strokeWidth={strokeWidth}
			/>
		);
	};

	const drawComparator = (x: number, y: number, comparator: Comparator, index: number, reverse: boolean = false, color: string = "#000", disabled: boolean = false, strokeWidth: number = 1) => {
		if (isNaN(x) || isNaN(y)) return null;
		const newComparator = reverse && comparatorMap[comparator] ? comparatorMap[comparator] : comparator;
		const isCurRelation = curRelation === index;
		return (
			<text
				onClick={() => onClick?.("Relation", index)}
				x={x}
				y={y}
				fontSize={height / 4 * strokeWidth}
				fill={isCurRelation ? color.slice(0, 7) : disabled ? DISABLED_COLOR : color}
				fontWeight={700}
				textAnchor="middle"
				dominantBaseline="middle"
			>
				{newComparator}
			</text>
		);
	};

	const relationLines = single_relations.map((relation, i) => {
		if (!query) return null;
		const trendIndex1 = relation.id1;
		const trendIndex2 = relation.id2;
		const isReverse = trendIndex1 > trendIndex2;
		const isActive = curRelation === i;

		const isEnd = relation.attribute === SingleAttribute.END_VALUE;
		const isStart = relation.attribute === SingleAttribute.START_VALUE;
		const isSpan = relation.attribute === SingleAttribute.TIME_SPAN;

		if (isStart || isEnd) {
			const relationColor = getColorWithDisabled(colorMap, query, relation.text_source_id) || DEFAULT_COLOR;
			const x1 = isStart ? points.current[trendIndex1]?.x1 : points.current[trendIndex1]?.x2;
			const x2 = isStart ? points.current[trendIndex2]?.x1 : points.current[trendIndex2]?.x2;
			const y1 = isStart ? points.current[trendIndex1]?.y1 : points.current[trendIndex1]?.y2;
			const y2 = isStart ? points.current[trendIndex2]?.y1 : points.current[trendIndex2]?.y2;
			const level = getLevel(x1, x2);
			const v = getV(level);

			return (
				<g key={i}>
					{drawConnect(x1, y1, x2, y2, v, i, relationColor, disabled)}
					{drawCircle(x1, y1, 2, relationColor, disabled)}
					{drawCircle(x2, y2, 2, relationColor, disabled)}
					{drawComparator((x1 + x2) / 2, v, relation.comparator, i, isReverse, relationColor, disabled)}
				</g>
			);
		} else if (isSpan) {
			const offset = trendLength;
			const x11 = trendIndex1 * trendLength;
			const x12 = x11 + offset;
			const x21 = trendIndex2 * trendLength;
			const x22 = x21 + offset;
			const y = 0;
			const relationColor = getColorWithDisabled(colorMap, query, relation.text_source_id) || DEFAULT_COLOR;
			const level = getLevel(x11, x22);
			const v = getV(level);
			return (
				<g key={i}>
					{drawTimeIndicator({ startX: x11, endX: x12, textY: y, timeColor: relationColor, disabled, index: i })}
					{drawTimeIndicator({ startX: x21, endX: x22, textY: y, timeColor: relationColor, disabled, index: i })}
					{drawConnect((x12 + x11) / 2, y, (x21 + x22) / 2, y, v, i, relationColor, disabled)}
					{drawComparator((x12 + x21) / 2, v, relation.comparator, i, isReverse, relationColor, disabled)}
				</g>
			);
		} else {
			const { x1: x11, x2: x12, y1: y11, y2: y12 } = points.current[trendIndex1] ?? {};
			const { x1: x21, x2: x22, y1: y21, y2: y22 } = points.current[trendIndex2] ?? {};

			const arcRadius = height / 6;
			const midX = (x11 + x21) / 2 + arcRadius / 2;

			const createArc = (index: number) => {
				const arc = d3
					.arc()
					.innerRadius(0)
					.outerRadius(arcRadius)
					.startAngle(Math.PI / 2)
					.endAngle(index === 0 ? Math.atan((y12 - y11) / (x12 - x11)) + Math.PI / 2 : Math.atan((y22 - y21) / (x22 - x21)) + Math.PI / 2);
				return arc({} as DefaultArcObject) || "";
			};

			const relationColor = getColorWithDisabled(colorMap, query, relation.text_source_id) || DEFAULT_COLOR;
			const level = getLevel(x11, x22);
			const v = getV(level);

			return (
				<g key={i}>
					<path
						d={createArc(0)}
						transform={`translate(${x11},${y11})`}
						stroke={isActive ? relationColor.slice(0, 7) : disabled ? DISABLED_COLOR : relationColor}
						fill="none"
					/>
					<path
						d={createArc(1)}
						transform={`translate(${x21},${y21})`}
						stroke={isActive ? relationColor.slice(0, 7) : disabled ? DISABLED_COLOR : relationColor}
						fill="none"
					/>
					{drawConnect(x11 + arcRadius / 2, y11, x21 + arcRadius / 2, y21, v, i, relationColor, disabled)}
					{drawComparator(midX, v, relation.comparator, i, isReverse, relationColor, disabled)}
				</g>
			);
		}
	});

	const drawGroupRelation = (relation: GroupRelationWithSource, i: number, trendLength: number, trends: TrendWithSource[], strokeWidth: number = 1) => {
		if (!query) return null;
		const getGroupInfo = (ids: [number, number]) => {
			if (ids[0] === undefined || ids[1] === undefined || ids[0] >= trends.length || ids[1] >= trends.length) return null;
			const x1 = ids[0] * trendLength;
			const x2 = ids[1] * trendLength + trendLength;
			return {
				center: (x1 + x2) / 2,
				start: x1,
				end: x2,
			};
		};

		const group1Info = getGroupInfo(relation.group1);
		const group2Info = getGroupInfo(relation.group2);

		if (!group1Info || !group2Info) return null;
		const rangeY = 0;

		const relationColor = getColorWithDisabled(colorMap, query, relation.text_source_id);
		const level = getLevel(group1Info.center, group2Info.center);
		const v = getV(level);
		const index = i + single_relations.length;

		return (
			<g key={`group-${i}`}>
				{drawTimeIndicator({ startX: group1Info.start, endX: group1Info.end, textY: rangeY, timeColor: relationColor, disabled, index })}
				{drawTimeIndicator({ startX: group2Info.start, endX: group2Info.end, textY: rangeY, timeColor: relationColor, disabled, index })}
				{drawConnect(group1Info.center, rangeY, group2Info.center, rangeY, v, index, relationColor, disabled, strokeWidth)}
				{drawComparator((group1Info.center + group2Info.center) / 2, v, relation.comparator, index, false, relationColor, disabled, strokeWidth)}
			</g>
		);
	};

	const groupRelationLines = group_relations.map((relation, i) => drawGroupRelation(relation, i, trendLength, trends));

	const svgRef = useRef<SVGSVGElement>(null);
	const gRef = useRef<SVGGElement>(null);
	const [lastTransform, setLastTransform] = useState<ZoomTransform | null>(null);

	useEffect(() => {
		if (!svgRef.current || !gRef.current) return;

		if (!query) {
			setLastTransform(null);
			return;
		}

		const svg = d3.select(svgRef.current);
		const g = d3.select(gRef.current);
		const bbox = g.node()?.getBBox();
		if (!bbox) return;

		const width = svgRef.current.clientWidth;
		const height = svgRef.current.clientHeight;

		const scale = width / (bbox.width + 20);
		const x = (width - bbox.width * scale) / 2 - bbox.x * scale;
		const y = (height - bbox.height * scale) / 2 - bbox.y * scale;

		const zoom = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([1, 10])
			.on("zoom", (event) => {
				g.attr("transform", event.transform);
				setLastTransform(event.transform);
			});

		svg.call(zoom);

		if (lastTransform) {
			svg.call(zoom.transform, lastTransform);
		} else {
			svg.call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
		}

		return () => {
			svg.on("zoom", null);
		};
	}, [trends, single_relations, group_relations, lastTransform, query]);

	const drawTimeRangeIndicator = (params: {
		type: 'trend' | 'group' | 'global';
		index: number;
		level: number;
		condition?: ScopeConditionWithSource;
		ids?: [number, number];
	}) => {
		const { type, index, level, condition, ids } = params;
		if (!condition || !query) return null;
		let startX: number, endX: number;
		switch (type) {
			case 'trend':
				startX = index * trendLength;
				endX = startX + trendLength;
				break;
			case 'group':
				if (!ids) return null;
				startX = ids[0] * trendLength;
				endX = ids[1] * trendLength + trendLength;
				break;
			case 'global':
				startX = 0;
				endX = (trends.length - 1) * trendLength + trendLength;
				break;
		}

		const textY = height + (type === 'global' ? (level + 1) : level) * 5 + 3;
		const timeColor = getColorWithDisabled(colorMap, query, condition.text_source_id);
		const timeText = getScopeText(condition, 86400);

		if (!timeText) return null;

		return drawTimeIndicator({
			startX,
			endX,
			textY,
			timeColor,
			timeText: `${timeText} days`,
			key: `${type}-time-${index}`,
		});
	};

	const timeIndicators = () => {
		const timeRangeLevels = calculateTimeRangeLevels(trends, trend_groups, trendLength);
		const maxLevel = Math.max(0, ...timeRangeLevels.map(item => item.level));

		return (
			<>
				{trends.map((trend, i) => trend.time_span_condition &&
					drawTimeRangeIndicator({
						type: 'trend',
						index: i,
						level: timeRangeLevels.find(item => item.type === 'trend' && item.index === i)?.level || 0,
						condition: trend.time_span_condition
					})
				)}
				{trend_groups.map((group, i) => group.time_span_condition &&
					drawTimeRangeIndicator({
						type: 'group',
						index: i,
						level: timeRangeLevels.find(item => item.type === 'group' && item.index === i)?.level || 0,
						condition: group.time_span_condition,
						ids: group.ids
					})
				)}
				{query?.time_span_condition &&
					drawTimeRangeIndicator({
						type: 'global',
						index: 0,
						level: maxLevel,
						condition: query.time_span_condition
					})
				}
			</>
		);
	};

	const drawTarget = (targets: TargetWithSource[]) => {
		if (!targets.length) return null;
		if (!query) return null;

		const text = targets.map((target, index) => {
			const targetColor = getColorWithDisabled(colorMap, query, target.text_source_id);
			return (
				<tspan key={`${target}-${index}`} fill={targetColor}> {target.target} </tspan>
			)
		})

		return (
			<g>
				<text
					x={10}
					y={10}
					fontSize={20}
					dominantBaseline="hanging"
					textAnchor="start"
					style={{ pointerEvents: "none" }}
				>
					{text}
				</text>
			</g>
		);
	};

	const timeScopeCondition = query?.time_scope_condition ?? null;
	const maxScopeCondition = query?.max_value_scope_condition ?? null;
	const minScopeCondition = query?.min_value_scope_condition ?? null;

	const drawTimeScopeCondition = () => {
		if (!timeScopeCondition || !query) return null;
		const fontSize = 6;
		const color = getColorWithDisabled(colorMap, query, timeScopeCondition.text_source_id);
		const minText = timeScopeCondition.min?.value ? formatTime(timeScopeCondition.min.value * 1000) : null;
		const maxText = timeScopeCondition.max?.value ? formatTime(timeScopeCondition.max.value * 1000) : null;
		return (
			<>
				{minText && <text x={0} y={height / 2} fontSize={fontSize} fill={color} fontWeight={700} dominantBaseline="middle" textAnchor="end">
					{minText}
				</text>}
				{maxText && <text x={width} y={height / 2} fontSize={fontSize} fill={color} fontWeight={700} dominantBaseline="middle" textAnchor="start">
					{maxText}
				</text>}
			</>
		);
	}

	const drawYValueScopeCondition = (x: number, y: number, scopeCondition: ScopeConditionWithSource | null) => {
		if (!scopeCondition || !query) return null;
		const text = getScopeText(scopeCondition);
		if (!text) return null;

		const fontSize = 6;
		const color = getColorWithDisabled(colorMap, query, scopeCondition.text_source_id);
		const strokeWidth = 1;
		const lineHeight = 3;
		return (
			<g transform={`translate(${x - fontSize / 2}, 0)`}>
				<line
					x1={x + strokeWidth}
					y1={y - lineHeight}
					x2={x - strokeWidth}
					y2={y - lineHeight}
					stroke={color}
					strokeWidth={strokeWidth}
				/>
				<line
					x1={x}
					y1={y - lineHeight}
					x2={x}
					y2={y}
					stroke={color}
					strokeWidth={strokeWidth}
				/>
				<text
					x={x - strokeWidth * 2}
					y={y + strokeWidth / 4}
					fontSize={fontSize}
					fill={color}
					fontWeight={700}
					textAnchor="end"
					dominantBaseline="middle"
				>
					{text}
				</text>
				<line
					x1={x}
					y1={y}
					x2={x}
					y2={y + lineHeight}
					stroke={color}
					strokeWidth={strokeWidth}
				/>
				<line
					x1={x - strokeWidth}
					y1={y + lineHeight}
					x2={x + strokeWidth}
					y2={y + lineHeight}
					stroke={color}
					strokeWidth={strokeWidth}
				/>
			</g>
		)
	}

	return (
		<svg
			ref={svgRef}
			width="100%"
			height="100%"
		>
			{drawTarget(targets)}
			<g ref={gRef}>
				{trendLines}
				{relationLines}
				{timeIndicators()}
				{drawTimeScopeCondition()}
				{drawYValueScopeCondition(0, 0, maxScopeCondition)}
				{drawYValueScopeCondition(0, height, minScopeCondition)}
				{groupRelationLines}
			</g>
		</svg>
	);
};

export default Glyph;
