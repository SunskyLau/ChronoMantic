import { Comparator, GroupRelationWithSource, QuerySpecWithSource, SingleAttribute, SingleRelationWithSource, TargetWithSource, TextSource, TrendGroupWithSource, TrendWithSource } from "../../../types/QuerySpec";
import * as d3 from "d3";
import { deepClone } from "../../../utils/deepclone";
import { useEffect, useRef, useState } from "react";
import type { DefaultArcObject } from "d3-shape";
import { ZoomTransform } from "d3";
import { getColorFromMap } from "../../../utils/color";

type ClickType = "Trend" | "Relation" | "GroupRelation";

interface GlyphProps {
	target?: TargetWithSource;
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

const getAverageValue = (trend: TrendWithSource) => {
	if (!trend) return 0;
	const scope = trend.category.category === "up" ? 1 : trend.category.category === "down" ? -1 : 0;
	return scope;
};

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

// 检查两个区间是否真正重叠（交叉）
const isOverlapping = (start1: number, end1: number, start2: number, end2: number) => {
	// 如果一个区间的结束点是另一个区间的开始点，不算重叠
	if (end1 === start2 || end2 === start1) return false;
	return Math.max(start1, start2) < Math.min(end1, end2);
};

// 获取关系线的区间
const getRelationRange = (relation: SingleRelationWithSource) => {
	const start = Math.min(relation.id1, relation.id2);
	const end = Math.max(relation.id1, relation.id2);
	return { start, end };
};

// 计算每条关系线需要的偏移层级
const calculateOffsets = (relations: SingleRelationWithSource[]) => {
	const offsets: number[] = new Array(relations.length).fill(0);

	relations.forEach((relation1, i) => {
		const range1 = getRelationRange(relation1);

		// 检查当前关系线与之前的所有关系线
		for (let j = 0; j < i; j++) {
			const range2 = getRelationRange(relations[j]);

			// 只有真正交叉的线才需要不同层级
			if (isOverlapping(range1.start, range1.end, range2.start, range2.end)) {
				offsets[i] = Math.max(offsets[i], offsets[j] + 1);
			}
		}
	});

	return offsets;
};

// 在文件顶部添加 getColorWithDisabled 函数
const getColorWithDisabled = (colorMap: Record<string, string>, textSource?: TextSource) => {
	if (!textSource) return "#0008";
	if (textSource.disabled) return "#eee";
	return getColorFromMap(colorMap, textSource);
};

// 修改 getSlopeText 函数
const getSlopeText = (trend: TrendWithSource, colorMap: Record<string, string>) => {
	const condition = trend.daily_average_delta_percentage_scope_condition;
	if (!condition || condition.text_source?.disabled) return null;

	const { min, max } = condition;
	const color = getColorWithDisabled(colorMap, condition.text_source);
	const minColor = getColorFromMap(colorMap, condition.min?.text_source);
	const maxColor = getColorFromMap(colorMap, condition.max?.text_source);

	if (min && max) {
		return {
			leftPart: {
				text: min.inclusive ? "[" : "(",
				color: color || minColor,
			},
			minValue: {
				text: `${min.value}%/day`,
				color: color || minColor,
			},
			separator: ", ",
			maxValue: {
				text: `${max.value}%/day`,
				color: color || maxColor,
			},
			rightPart: {
				text: max.inclusive ? "]" : ")",
				color: color || maxColor,
			},
		};
	} else if (min) {
		return {
			text: `${min.inclusive ? "≥" : ">"}${min.value}%/day`,
			color: color || minColor,
		};
	} else if (max) {
		return {
			text: `${max.inclusive ? "≤" : "<"}${max.value}%/day`,
			color: color || maxColor,
		};
	}

	return null;
};

// 修改getGlobalTimeRangeText函数，将秒转换为天
const getGlobalTimeRangeText = (query?: QuerySpecWithSource) => {
	if (!query?.time_span_condition) return "";

	const { min, max } = query.time_span_condition;
	const secondsToDay = (seconds: number) => Math.round(seconds / 86400);

	const leftBracket = min?.inclusive ? "[" : "(";
	const rightBracket = max?.inclusive ? "]" : ")";
	return `${leftBracket}${secondsToDay(min?.value || 0)}days, ${secondsToDay(max?.value || 0)}days${rightBracket}`;
};

const Glyph = ({ trends = [], single_relations = [], group_relations = [], height = 32, onClick, curTrend, curRelation, query, colorMap = {}, target }: GlyphProps) => {
	const paddingY = 10;
	const paddingX = 4;
	const trendLength = height - paddingY * 1.5;
	const t = deepClone(trends).map((trend, i) => ({ ...trend, index: i }));

	// 在渲染部分修改文本显示 - 移到这里
	const drawSlopeText = (x: number, y: number, slopeTextInfo: ReturnType<typeof getSlopeText>, textAnchor: string = "middle") => {
		if (!slopeTextInfo) return null;

		return (
			<text
				x={x}
				y={y}
				fontSize={3}
				dominantBaseline="bottom"
				textAnchor={textAnchor}
			>
				{"text" in slopeTextInfo ? (
					<tspan fill={slopeTextInfo.color}>{slopeTextInfo.text}</tspan>
				) : (
					<>
						<tspan fill={slopeTextInfo.leftPart.color}>{slopeTextInfo.leftPart.text}</tspan>
						<tspan fill={slopeTextInfo.minValue.color}>{slopeTextInfo.minValue.text}</tspan>
						<tspan>{slopeTextInfo.separator}</tspan>
						<tspan fill={slopeTextInfo.maxValue.color}>{slopeTextInfo.maxValue.text}</tspan>
						<tspan fill={slopeTextInfo.rightPart.color}>{slopeTextInfo.rightPart.text}</tspan>
					</>
				)}
			</text>
		);
	};

	const getTrend = (trend: TrendWithSource, i: number, showIndex = false) => {
		const { isUp, isDown } = getTrendInfo(trend);
		const textSource = trend.category.text_source;
		const color = getColorWithDisabled(colorMap, textSource);
		const x1 = i * trendLength + paddingX;
		const x2 = x1 + trendLength;
		const y = height / 2;
		const y1 = isUp ? height - paddingY : isDown ? paddingY : y;
		const y2 = isUp ? paddingY : isDown ? height - paddingY : y;
		const id = Math.random().toString(36).substring(2, 7);

		// 获取斜率文本
		const slopeTextInfo = getSlopeText(trend, colorMap);

		// 修改绘制斜率指示器的函数
		const drawSlopeIndicator = () => {
			if (!slopeTextInfo) return null;

			const dashLength = height / 4;
			const textXOffset = dashLength / 2;

			// 获取虚线颜色 - 使用斜率文本的颜色
			const dashColor = "text" in slopeTextInfo ? slopeTextInfo.color : slopeTextInfo.minValue.color;

			if (isUp) {
				return (
					<g>
						<line
							x1={x1}
							y1={y1}
							x2={x1 + dashLength}
							y2={y1}
							stroke={dashColor} // 使用斜率文本的颜色
							strokeWidth={0.5}
							strokeDasharray="1,1"
						/>
						{drawSlopeText(x1 + textXOffset, y1 - 2, slopeTextInfo, "start")}
					</g>
				);
			} else if (isDown) {
				return (
					<g>
						<line
							x1={x2 - dashLength}
							y1={y2}
							x2={x2}
							y2={y2}
							stroke={dashColor} // 使用斜率文本的颜色
							strokeWidth={0.5}
							strokeDasharray="1,1"
						/>
						{drawSlopeText(x2 - textXOffset, y2 - 2, slopeTextInfo, "end")}
					</g>
				);
			}
			return null;
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
							d="M4,2 L0,4 M4,2 L0,0"
							fill="none"
							stroke={color}
							strokeWidth="1"
						/>
					</marker>
				</defs>
				<rect
					x={x1}
					y={paddingY}
					width={trendLength}
					height={height - paddingY * 2}
					fill={curTrend === i ? color : "#eee0"}
					opacity={0.5}
				/>
				<line
					x1={x1}
					y1={y1}
					x2={x2}
					y2={y2}
					stroke={color}
					strokeWidth={1.5}
					markerEnd={`url(#arrow-${id}-${i})`}
				/>
				{drawSlopeIndicator()}
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

	const drawCircle = (x: number, y: number, r: number = 1.5, color: string = "#000") => {
		return (
			<circle
				cx={x}
				cy={y}
				r={r}
				fill={color}
			/>
		);
	};

	const drawConnect = (x1: number, y1: number, x2: number, y2: number, v: number, index: number, color: string = "#0002", strokeWidth: number = 1) => {
		return (
			<path
				onClick={() => onClick?.("Relation", index)}
				d={`M${x1},${y1} V${v} H${x2} V${y2}`}
				stroke={curRelation === index ? color : color}
				style={{
					animation: curRelation === index ? "dashFlow 1s linear infinite" : "none",
				}}
				fill="none"
				strokeDasharray="2,2"
				strokeLinecap="round"
				strokeWidth={strokeWidth}
			/>
		);
	};

	const drawComparator = (x: number, y: number, comparator: Comparator, index: number, reverse: boolean = false, color: string = "#000", strokeWidth: number = 1) => {
		const newComparator = reverse && comparatorMap[comparator] ? comparatorMap[comparator] : comparator;
		return (
			<text
				onClick={() => onClick?.("Relation", index)}
				x={x}
				y={y}
				fontSize={height / 5}
				fill={color}
				fontWeight={strokeWidth < 1 ? 400 : 700}
				textAnchor="middle"
			>
				{newComparator}
			</text>
		);
	};

	const offsets = calculateOffsets(single_relations);
	const getVerticalOffset = (relationIndex: number) => {
		const spacing = 6; // 每条线之间的间距
		return offsets[relationIndex] * spacing;
	};

	const relationLines = single_relations.map((relation, i) => {
		const trendIndex1 = t.findIndex((t) => t.index === relation.id1);
		const trendIndex2 = t.findIndex((t) => t.index === relation.id2);

		const trend1 = t[trendIndex1];
		const trend2 = t[trendIndex2];
		const isReverse = trendIndex1 > trendIndex2;

		const isEnd = relation.attribute === SingleAttribute.END_VALUE;
		const isStart = relation.attribute === SingleAttribute.START_VALUE;
		const isSlope = relation.attribute === SingleAttribute.SLOPE;
		const isSpan = relation.attribute === SingleAttribute.TIME_SPAN;

		if (isStart || isEnd) {
			const offset = isEnd ? trendLength + paddingX : paddingX;
			const x1 = trendIndex1 * trendLength + offset;
			const x2 = trendIndex2 * trendLength + offset;

			const getTrendValueY = (trend: TrendWithSource, isEnd: boolean) => {
				const { isFlat, isUp, isDown } = getTrendInfo(trend);
				if (isFlat) return height / 2;
				if (isEnd) {
					return isUp ? paddingY : isDown ? height - paddingY : height / 2;
				} else {
					return isUp ? height - paddingY : isDown ? paddingY : height / 2;
				}
			};

			const y1 = getTrendValueY(trend1, isEnd);
			const y2 = getTrendValueY(trend2, isEnd);

			const textSource = relation.text_source;
			const relationColor = textSource?.disabled ? "#eee" : getColorWithDisabled(colorMap, textSource) || "#0002";

			const vOffset = getVerticalOffset(i);
			const extraOffset = y2 === height / 2 ? height / 4 : 0;
			const baseY = Math.min(y1, y2) - 10 - extraOffset;

			return (
				<g key={i}>
					{drawConnect(x1, y1, x2, y2, baseY - vOffset, i, relationColor)}
					{drawCircle(x1, y1)}
					{drawCircle(x2, y2)}
					{drawComparator((x1 + x2) / 2, baseY - vOffset, relation.comparator!, i, isReverse, relationColor)}
				</g>
			);
		}

		if (isSlope) {
			const angle1 = getAverageValue(trend1);
			const angle2 = getAverageValue(trend2);

			const x1 = trendIndex1 * trendLength + paddingX;
			const x2 = trendIndex2 * trendLength + paddingX;

			// 根据趋势类型确定y位置
			const getTrendStartY = (trend: TrendWithSource) => {
				const { isFlat, isUp, isDown } = getTrendInfo(trend);
				if (isFlat) return height / 2;
				// 下降趋势从顶部开始，上升趋势从底部开始
				return isDown ? paddingY : isUp ? height - paddingY : height / 2;
			};

			const y1 = getTrendStartY(trend1);
			const y2 = getTrendStartY(trend2);
			const vOffset = getVerticalOffset(i);

			// 计算连线的中点位置
			const midX = (x1 + x2) / 2 + height / 8;
			const baseY = paddingY / 2 + vOffset;

			const arcRadius = height / 6;

			const createArc = (angle: number) => {
				const arc = d3
					.arc()
					.innerRadius(0)
					.outerRadius(arcRadius)
					.startAngle(Math.PI / 2)
					.endAngle(Math.PI * (angle < 0 ? 19 / 26 : 7 / 26));
				return arc({} as DefaultArcObject) || "";
			};

			const textSource = relation.text_source;
			const relationColor = textSource?.disabled ? "#eee" : getColorWithDisabled(colorMap, textSource) || "#0002";

			return (
				<g key={i}>
					<path
						d={createArc(angle1)}
						transform={`translate(${x1},${y1})`}
						stroke={relationColor}
						fill="none"
					/>
					<path
						d={createArc(angle2)}
						transform={`translate(${x2},${y2})`}
						stroke={relationColor}
						fill="none"
					/>
					{drawConnect(x1 + height / 8, y1, x2 + height / 8, y2, baseY, i, relationColor)}
					{drawComparator(midX, baseY, relation.comparator!, i, isReverse, relationColor)}
				</g>
			);
		}

		if (isSpan) {
			const offset = trendLength;
			const x11 = trendIndex1 * trendLength + paddingX;
			const x12 = x11 + offset;
			const x21 = trendIndex2 * trendLength + paddingX;
			const x22 = x21 + offset;
			const y = height - paddingY;

			const textSource = relation.text_source;
			const relationColor = textSource?.disabled ? "#eee" : getColorWithDisabled(colorMap, textSource) || "#0002";

			const vOffset = getVerticalOffset(i);
			const baseY = height - paddingY;
			return (
				<g key={i}>
					{drawConnect(x11, y, x12, y, baseY + 2 + vOffset, -1, relationColor)}
					{drawConnect(x21, y, x22, y, baseY + 2 + vOffset, -1, relationColor)}
					{drawConnect((x12 + x11) / 2, baseY + 2 + vOffset, (x21 + x22) / 2, baseY + 2 + vOffset, baseY + 6 + vOffset, i, relationColor)}
					{drawComparator((x12 + x21) / 2, baseY + 6 + vOffset, relation.comparator!, i, isReverse, relationColor)}
				</g>
			);
		}

		return null;
	});

	const drawGroupRelation = (relation: GroupRelationWithSource, i: number, trendLength: number, height: number, trends: TrendWithSource[], strokeWidth: number = 0.5) => {
		const getGroupInfo = (ids: [number, number]) => {
			if (ids[0] === undefined || ids[1] === undefined || ids[0] >= trends.length || ids[1] >= trends.length) return null;
			const x1 = ids[0] * trendLength + paddingX;
			const x2 = ids[1] * trendLength + trendLength + paddingX;
			return {
				center: (x1 + x2) / 2,
				range: {
					start: x1,
					end: x2,
				},
			};
		};

		const group1Info = getGroupInfo(relation.group1);
		const group2Info = getGroupInfo(relation.group2);

		if (!group1Info || !group2Info) return null;

		// 调整位置到最下方，且避免与整体时间跨度重叠
		const baseY = height + paddingY; // 最底部的基准位置
		const rangeY = baseY - 10; // 范围指示器的位置
		const connectY = baseY - 8; // 连接线的位置
		const comparatorY = baseY - 6; // 比较符号的位置

		const textSource = relation.text_source;
		const relationColor = getColorWithDisabled(colorMap, textSource);

		return (
			<g key={`group-${i}`}>
				{/* 绘制组合1的范围指示器 */}
				<line
					x1={group1Info.range.start}
					y1={rangeY}
					x2={group1Info.range.end}
					y2={rangeY}
					stroke={relationColor}
					strokeWidth={strokeWidth}
				/>
				<line
					x1={group1Info.range.start}
					y1={rangeY - 2}
					x2={group1Info.range.start}
					y2={rangeY + 2}
					stroke={relationColor}
					strokeWidth={strokeWidth}
				/>
				<line
					x1={group1Info.range.end}
					y1={rangeY - 2}
					x2={group1Info.range.end}
					y2={rangeY + 2}
					stroke={relationColor}
					strokeWidth={strokeWidth}
				/>

				{/* 绘制组合2的范围指示器 */}
				<line
					x1={group2Info.range.start}
					y1={rangeY}
					x2={group2Info.range.end}
					y2={rangeY}
					stroke={relationColor}
					strokeWidth={strokeWidth}
				/>
				<line
					x1={group2Info.range.start}
					y1={rangeY - 2}
					x2={group2Info.range.start}
					y2={rangeY + 2}
					stroke={relationColor}
					strokeWidth={strokeWidth}
				/>
				<line
					x1={group2Info.range.end}
					y1={rangeY - 2}
					x2={group2Info.range.end}
					y2={rangeY + 2}
					stroke={relationColor}
					strokeWidth={strokeWidth}
				/>

				{drawConnect(group1Info.center, connectY, group2Info.center, connectY, comparatorY, i, relationColor, strokeWidth)}
				{drawComparator((group1Info.center + group2Info.center) / 2, comparatorY, relation.comparator, i, false, relationColor, strokeWidth)}
			</g>
		);
	};

	const groupRelationLines = group_relations.map((relation, i) => drawGroupRelation(relation, i, trendLength, height, trends));

	const trendLines = t.map((trend, i) => getTrend(trend, i));

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

		const scale = 2;
		const x = (width - bbox.width * scale) / 2 - bbox.x * scale;
		const y = (height - bbox.height * scale) / 2 - bbox.y * scale;

		const zoom = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([1, 5])
			.on("zoom", (event) => {
				g.attr("transform", event.transform);
				setLastTransform(event.transform);
			});

		svg.call(zoom);

		if (lastTransform) {
			svg.call(zoom.transform, lastTransform);
		} else {
			svg.call(zoom.transform, d3.zoomIdentity.translate(x, y));
		}

		return () => {
			svg.on(".zoom", null);
		};
	}, [trends, single_relations, group_relations, lastTransform]);

	// 修改drawGlobalTimeIndicator函数
	const drawGlobalTimeIndicator = () => {
		if (!query?.time_span_condition) return null;

		const getTimeColor = () => {
			const textSource = query.time_span_condition?.text_source;
			return getColorWithDisabled(colorMap, textSource);
		};

		const timeColor = getTimeColor();
		const lineHeight = height / 18;
		const startX = paddingX;
		const endX = (t.length - 1) * trendLength + trendLength + paddingX;
		const textY = height - 6; // 调整整体位置，向下移动
		const arrowSize = 2; // 箭头大小

		const timeText = getGlobalTimeRangeText(query);
		const textWidth = timeText.length * 2.5;

		return (
			<g>
				{/* 左侧垂直线和箭头（朝左） */}
				<line
					x1={startX}
					y1={textY - lineHeight}
					x2={startX}
					y2={textY + lineHeight}
					stroke={timeColor}
					strokeWidth={0.5}
				/>
				<path
					d={`M${startX},${textY} L${startX + arrowSize},${textY - arrowSize} L${startX + arrowSize},${textY + arrowSize}`}
					fill={timeColor}
				/>

				{/* 右侧垂直线和箭头（朝右） */}
				<line
					x1={endX}
					y1={textY - lineHeight}
					x2={endX}
					y2={textY + lineHeight}
					stroke={timeColor}
					strokeWidth={0.5}
				/>
				<path
					d={`M${endX},${textY} L${endX - arrowSize},${textY - arrowSize} L${endX - arrowSize},${textY + arrowSize}`}
					fill={timeColor}
				/>

				{/* 时间范围文本 */}
				<text
					x={(startX + endX) / 2}
					y={textY}
					fontSize={4}
					fill={timeColor}
					textAnchor="middle"
					dominantBaseline="middle"
				>
					{timeText}
				</text>

				{/* 左侧连接线 */}
				<line
					x1={startX}
					y1={textY}
					x2={(startX + endX) / 2 - textWidth / 2}
					y2={textY}
					stroke={timeColor}
					strokeWidth={0.5}
				/>

				{/* 右侧连接线 */}
				<line
					x1={(startX + endX) / 2 + textWidth / 2}
					y1={textY}
					x2={endX}
					y2={textY}
					stroke={timeColor}
					strokeWidth={0.5}
				/>
			</g>
		);
	};

	// 修改 drawTarget 函数
	const drawTarget = (target?: TargetWithSource) => {
		if (!target?.target) return null;

		const textSource = target.text_source;
		const targetColor = getColorWithDisabled(colorMap, textSource);

		return (
			<g>
				<text
					x={paddingX}
					y={paddingY}
					fontSize={20}
					fill={targetColor}
					dominantBaseline="hanging"
					textAnchor="start"
					style={{ pointerEvents: "none" }}
				>
					{target.target}
				</text>
			</g>
		);
	};

	return (
		<svg
			ref={svgRef}
			width="100%"
			height="100%"
		>
			{drawTarget(target)}
			<g ref={gRef}>
				{trendLines}
				{relationLines}
				{groupRelationLines}
				{drawGlobalTimeIndicator()}
			</g>
		</svg>
	);
};

export default Glyph;
