import { Comparator, GroupRelationWithSource, QuerySpecWithSource, ScopeConditionWithSource, ScopeConditionWithSourceWithUnit, SingleAttribute, SingleRelationWithSource, TargetWithSource, TrendGroupWithSource, TrendWithSource } from "../../../types/QuerySpec";
import { TrendTextMap } from "../../../utils/query-spec";
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
	timeStampColumnType?: string;
	timeStampColumnUnit?: number;
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

const getScopeText = (scope: ScopeConditionWithSourceWithUnit, unitFormatter: (unit: string) => string = (unit: string) => unit) => {
	if (!scope) return null;
	const { min, max, unit = "" } = scope;
	if (min && max) {
		return `${min.inclusive ? "[" : "("}${min.value}${unitFormatter(unit)}, ${max.value}${unitFormatter(unit)}${max.inclusive ? "]" : ")"}`;
	} else if (min) {
		return `${min.inclusive ? "[" : "("}${min.value}${unitFormatter(unit)}, +∞)`;
	} else if (max) {
		return `(-∞, ${max.value}${unitFormatter(unit)}${max.inclusive ? "]" : ")"}`;
	}
	return "";
};

interface TextWithColor {
	text: string;
	color: string;
}

const getSlopeText = (trend: TrendWithSource, colorMap: Record<string, string>, query: QuerySpecWithSource | null) => {
	const { ...conditions } = trend;
	if (!Object.keys(conditions).length) return null;
	const texts: Record<string, TextWithColor> = {};
	const map = {
		slope_scope_condition: { key: TrendTextMap["slope_scope_condition"], unitFormatter: (unit: string) => (unit ? `/${unit}` : "") },
		relative_slope_scope_condition: { key: TrendTextMap["relative_slope_scope_condition"], unitFormatter: () => `%` },
	};
	Object.entries(conditions).forEach(([key, value]) => {
		if (key === "duration_condition" || key === "category") return;
		const unit = map[key as keyof typeof map];
		if (value) {
			const text = getScopeText(value, unit.unitFormatter);
			texts[key] = {
				text: text ? unit.key + ": " + text : "",
				color: getColorWithDisabled(colorMap, query, value.text_source_id),
			};
		}
	});
	return texts;
};

const hasOverlap = (range1: [number, number], range2: [number, number]) => {
	if (range1[0] > range1[1]) {
		[range1[0], range1[1]] = [range1[1], range1[0]];
	}
	if (range2[0] > range2[1]) {
		[range2[0], range2[1]] = [range2[1], range2[0]];
	}
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
		if (trend.duration_condition) {
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
	const baseY1 = useRef(0);
	const baseY2 = useRef(height);
	const fontSize = 4;

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
		return baseY1.current - (level + 1) * 12;
	};

	const drawTimeIndicator = ({ startX, endX, textY, timeColor, timeText, key, strokeWidth = 1, disabled = false, index }: { startX: number; endX: number; textY: number; timeColor: string; timeText?: string; key?: string; strokeWidth?: number; disabled?: boolean; index?: number }) => {
		const lineHeight = height / 24;
		const textWidth = timeText ? (timeText.length * fontSize) / 2 + fontSize : 0;
		const isActive = index === curRelation;
		const color = isActive ? timeColor.slice(0, 7) : disabled ? DISABLED_COLOR : timeColor;

		return (
			<g key={key}>
				<line
					x1={startX}
					y1={textY - lineHeight}
					x2={startX}
					y2={textY + lineHeight}
					stroke={color}
					strokeWidth={strokeWidth}
				/>
				<line
					x1={endX}
					y1={textY - lineHeight}
					x2={endX}
					y2={textY + lineHeight}
					stroke={color}
					strokeWidth={strokeWidth}
				/>
				<text
					x={(startX + endX) / 2}
					y={textY + fontSize / 16}
					fontSize={fontSize}
					fill={color}
					textAnchor="middle"
					dominantBaseline="middle"
				>
					{timeText}
				</text>
				<line
					x1={startX + strokeWidth / 2}
					y1={textY}
					x2={Math.max(startX, (startX + endX - textWidth) / 2)}
					y2={textY}
					stroke={color}
					strokeWidth={strokeWidth}
				/>
				<line
					x1={Math.min(endX, (startX + endX + textWidth) / 2)}
					y1={textY}
					x2={endX - strokeWidth / 2}
					y2={textY}
					stroke={color}
					strokeWidth={strokeWidth}
				/>
			</g>
		);
	};

	const points = useRef<{ x1: number; y1: number; x2: number; y2: number; isUp: boolean; isDown: boolean }[]>(Array(trends.length).fill(null));

	useEffect(() => {
		points.current = Array(trends.length).fill(null);
	}, [trends]);

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
					y2: isUp ? 0 : isDown ? height : y,
				};
			}
			if (!isUp && !isDown) {
				return {
					y1: prevEndPoint.y2,
					y2: prevEndPoint.y2,
				};
			}
			const step = height;
			const startY = prevEndPoint.y2;
			const endY = isUp ? startY - step : startY + step;
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
		const fontSize = (trendLength / (Math.max(...Object.values(texts).map((text) => text.text.length)) + 1)) * 2;
		points.current[i] = currentPoint;

		return (
			<g
				key={i}
				onClick={() => onClick?.("Trend", i)}
			>
				<rect
					x={x1}
					y={Math.min(currentPoint.y1, currentPoint.y2)}
					width={currentPoint.x2 - currentPoint.x1}
					height={Math.abs(currentPoint.y2 - currentPoint.y1)}
					fill={curTrend === i ? color : "#0000"}
					fillOpacity={0.3}
				/>
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
				{Object.entries(texts).map(([key, text], index) => {
					const lineHeight = fontSize * 1.5;
					const textY = isUp ? y1 - index * lineHeight - fontSize / 2 : y1 + index * lineHeight + fontSize / 2;
					return (
						<text
							key={key}
							x={x1 + fontSize / 2}
							y={textY}
							fontSize={fontSize}
							fill={text.color}
							textAnchor="start"
						>
							{text.text}
						</text>
					);
				})}
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

	baseY1.current = Math.min(...points.current.map((point) => point?.y1 ?? 0), ...points.current.map((point) => point?.y2 ?? 0));
	baseY2.current = Math.max(...points.current.map((point) => point?.y1 ?? 0), ...points.current.map((point) => point?.y2 ?? 0));

	useEffect(() => {
		baseY1.current = Math.min(...points.current.map((point) => point?.y1 ?? 0), ...points.current.map((point) => point?.y2 ?? 0));
		baseY2.current = Math.max(...points.current.map((point) => point?.y1 ?? 0), ...points.current.map((point) => point?.y2 ?? 0));
	}, [trends]);

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

	const drawConnect = (x1: number, y1: number, x2: number, y2: number, v: number, index: number, text?: Comparator, reverse: boolean = false, color: string = DEFAULT_COLOR, strokeWidth: number = 1) => {
		if (x1 > x2) {
			[x1, x2] = [x2, x1];
			[y1, y2] = [y2, y1];
		}
		const isCurRelation = curRelation === index;
		const textWidth = text ? text.length * 12 : 0;
		const midX = (x1 + x2) / 2;

		return (
			<>
				<path
					onClick={() => onClick?.("Relation", index)}
					d={`M${x1},${y1} V${v} H${midX - textWidth / 2}`}
					stroke={isCurRelation ? color.slice(0, 7) : color}
					style={{
						animation: isCurRelation ? "dashFlow 1s linear infinite" : "none",
					}}
					fill="none"
					strokeDasharray={"4,4"}
					strokeLinecap="round"
					strokeWidth={strokeWidth}
				/>
				<path
					onClick={() => onClick?.("Relation", index)}
					d={`M${midX + textWidth / 2},${v} H${x2} V${y2}`}
					stroke={isCurRelation ? color.slice(0, 7) : color}
					style={{
						animation: isCurRelation ? "dashFlow 1s linear infinite" : "none",
					}}
					fill="none"
					strokeDasharray={"4,4"}
					strokeLinecap="round"
					strokeWidth={strokeWidth}
				/>
				{text && drawComparator(midX, v, text, index, reverse, color, strokeWidth)}
			</>
		);
	};

	const drawComparator = (x: number, y: number, comparator: Comparator, index: number, reverse: boolean = false, color: string = "#000", strokeWidth: number = 1) => {
		if (isNaN(x) || isNaN(y)) return null;
		const newComparator = reverse && comparatorMap[comparator] ? comparatorMap[comparator] : comparator;
		const isCurRelation = curRelation === index;
		return (
			<text
				onClick={() => onClick?.("Relation", index)}
				x={x}
				y={y}
				fontSize={(height / 4) * strokeWidth}
				fill={isCurRelation ? color.slice(0, 7) : color}
				fontWeight={700}
				textAnchor="middle"
				dominantBaseline="middle"
			>
				{newComparator}
			</text>
		);
	};

	const relationLines = single_relations.map((relation, i) => {
		if (!query || !relation.attribute || relation.id1 === undefined || relation.id2 === undefined) return null;
		const trendIndex1 = relation.id1;
		const trendIndex2 = relation.id2;
		const isReverse = trendIndex1 > trendIndex2;
		const isActive = curRelation === i;

		const isEnd = relation.attribute === SingleAttribute.END_VALUE;
		const isStart = relation.attribute === SingleAttribute.START_VALUE;
		const isSpan = relation.attribute === SingleAttribute.DURATION;

		if (isStart || isEnd) {
			const relationColor = getColorWithDisabled(colorMap, query, relation.text_source_id) || DEFAULT_COLOR;
			const activeColor = isActive ? relationColor.slice(0, 7) : disabled ? DISABLED_COLOR : relationColor;
			const x1 = isStart ? points.current[trendIndex1]?.x1 : points.current[trendIndex1]?.x2;
			const x2 = isStart ? points.current[trendIndex2]?.x1 : points.current[trendIndex2]?.x2;
			const y1 = isStart ? points.current[trendIndex1]?.y1 : points.current[trendIndex1]?.y2;
			const y2 = isStart ? points.current[trendIndex2]?.y1 : points.current[trendIndex2]?.y2;
			const level = getLevel(x1, x2);
			const v = getV(level);

			return (
				<g key={i}>
					{drawConnect(x1, y1, x2, y2, v, i, relation.comparator, isReverse, relationColor)}
					{drawCircle(x1, y1, 2, activeColor)}
					{drawCircle(x2, y2, 2, activeColor)}
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
					{drawConnect((x12 + x11) / 2, y, (x21 + x22) / 2, y, v, i, relation.comparator, isReverse, relationColor)}
				</g>
			);
		} else {
			const { x1: x11, x2: x12, y1: y11, y2: y12 } = points.current[trendIndex1] ?? {};
			const { x1: x21, x2: x22, y1: y21, y2: y22 } = points.current[trendIndex2] ?? {};

			const arcRadius = height / 6;

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
					{drawConnect(x11 + arcRadius / 2, y11, x21 + arcRadius / 2, y21, v, i, relation.comparator, isReverse, relationColor)}
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
		const rangeY = baseY1.current;

		const relationColor = getColorWithDisabled(colorMap, query, relation.text_source_id);
		const level = getLevel(group1Info.start, group2Info.end);
		const v = getV(level);
		const index = i + single_relations.length;

		return (
			<g key={`group-${i}`}>
				{drawTimeIndicator({ startX: group1Info.start, endX: group1Info.end, textY: rangeY, timeColor: relationColor, disabled, index })}
				{drawTimeIndicator({ startX: group2Info.start, endX: group2Info.end, textY: rangeY, timeColor: relationColor, disabled, index })}
				{drawConnect(group1Info.center, rangeY, group2Info.center, rangeY, v, index, relation.comparator, false, relationColor, strokeWidth)}
			</g>
		);
	};

	const groupRelationLines = group_relations.map((relation, i) => drawGroupRelation(relation, i, trendLength, trends));

	const svgRef = useRef<SVGSVGElement>(null);
	const gRef = useRef<SVGGElement>(null);
	const [lastTransform, setLastTransform] = useState<ZoomTransform | null>(null);

	useEffect(() => {
		if (!svgRef.current || !gRef.current) return;

		const svg = d3.select(svgRef.current);
		const g = d3.select(gRef.current);
		const bbox = g.node()?.getBBox();
		if (!bbox) return;

		const width = svgRef.current.clientWidth;
		const height = svgRef.current.clientHeight;

		const scale = Math.min(width / (bbox.width + 20), height / (bbox.height + 20));
		const x = (width - bbox.width * scale) / 2 - bbox.x * scale;
		const y = (height - bbox.height * scale) / 2 - bbox.y * scale;

		const zoom = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([1, 10])
			.on("zoom", (event) => {
				if (!event.transform) return;
				g.attr("transform", event.transform);
				if (event.sourceEvent) {
					setLastTransform(event.transform);
				}
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
	}, [trends, single_relations, group_relations, lastTransform]);

	useEffect(() => {
		if (!query) {
			setLastTransform(null);
		}
	}, [query]);

	const drawTimeRangeIndicator = (params: { type: "trend" | "group" | "global"; index: number; level: number; condition?: ScopeConditionWithSourceWithUnit; ids?: [number, number] }) => {
		const { type, index, level, condition, ids } = params;
		if (!condition || !query) return null;
		let startX: number, endX: number;
		switch (type) {
			case "trend":
				startX = index * trendLength;
				endX = startX + trendLength;
				break;
			case "group":
				if (!ids) return null;
				startX = ids[0] * trendLength;
				endX = ids[1] * trendLength + trendLength;
				break;
			case "global":
				startX = 0;
				endX = (trends.length - 1) * trendLength + trendLength;
				break;
		}

		const textY = baseY2.current + (type === "global" ? level + 1 : level) * 5 + 3;
		const timeColor = getColorWithDisabled(colorMap, query, condition.text_source_id);
		const timeText = getScopeText(condition);

		if (!timeText) return null;

		return drawTimeIndicator({
			startX,
			endX,
			textY,
			timeColor,
			timeText,
			key: `${type}-time-${index}`,
		});
	};

	const timeIndicators = () => {
		const timeRangeLevels = calculateTimeRangeLevels(trends, trend_groups, trendLength);
		const maxLevel = Math.max(0, ...timeRangeLevels.map((item) => item.level));

		return (
			<>
				{trends.map(
					(trend, i) =>
						trend.duration_condition &&
						drawTimeRangeIndicator({
							type: "trend",
							index: i,
							level: timeRangeLevels.find((item) => item.type === "trend" && item.index === i)?.level || 0,
							condition: trend.duration_condition,
						})
				)}
				{trend_groups.map(
					(group, i) =>
						group.duration_condition &&
						drawTimeRangeIndicator({
							type: "group",
							index: i,
							level: timeRangeLevels.find((item) => item.type === "group" && item.index === i)?.level || 0,
							condition: group.duration_condition,
							ids: group.ids,
						})
				)}
				{query?.duration_condition &&
					drawTimeRangeIndicator({
						type: "global",
						index: 0,
						level: maxLevel,
						condition: query.duration_condition,
					})}
			</>
		);
	};

	const drawTarget = (targets: TargetWithSource[]) => {
		if (!targets.length) return null;
		if (!query) return null;

		const text = targets.map((target, index) => {
			const targetColor = getColorWithDisabled(colorMap, query, target.text_source_id);
			return (
				<tspan
					key={`${target}-${index}`}
					fill={targetColor}
				>
					{" "}
					{target.target}{" "}
				</tspan>
			);
		});

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
		const color = getColorWithDisabled(colorMap, query, timeScopeCondition.text_source_id);
		const minText = timeScopeCondition.min?.value ? formatTime(timeScopeCondition.min.value * 1000) : null;
		const maxText = timeScopeCondition.max?.value ? formatTime(timeScopeCondition.max.value * 1000) : null;
		const height = (baseY1.current + baseY2.current) / 2;
		return (
			<>
				{minText && (
					<text
						x={-10}
						y={height}
						fontSize={fontSize}
						fill={color}
						fontWeight={700}
						dominantBaseline="middle"
						textAnchor="end"
					>
						{minText}
					</text>
				)}
				{maxText && (
					<text
						x={width + 10}
						y={height}
						fontSize={fontSize}
						fill={color}
						fontWeight={700}
						dominantBaseline="middle"
						textAnchor="start"
					>
						{maxText}
					</text>
				)}
			</>
		);
	};

	const drawYValueScopeCondition = (x: number, y: number, scopeCondition: ScopeConditionWithSource | null) => {
		if (!scopeCondition || !query) return null;
		const text = getScopeText(scopeCondition);
		if (!text) return null;

		const color = getColorWithDisabled(colorMap, query, scopeCondition.text_source_id);
		const strokeWidth = 1;
		const lineHeight = 3;
		return (
			<g transform={`translate(${x - fontSize}, 0)`}>
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
		);
	};

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
				{drawYValueScopeCondition(0, baseY1.current, maxScopeCondition)}
				{drawYValueScopeCondition(0, baseY2.current, minScopeCondition)}
				{groupRelationLines}
			</g>
		</svg>
	);
};

export default Glyph;
