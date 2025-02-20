import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { deepClone, deepEqual } from "../../utils/deepclone";
import { Popover, Checkbox, Space, Button, Flex, Typography } from "antd";
import { GroupChoice, Intentions, SingleChoice } from "../../types/QuerySpec";
import { flushSync } from "react-dom";

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
	resultsSplit?: {
		segments: [number, number][][];
		colors: string[];
	};
	selectedSplits?: number[];
	defaultSplits?: number[];
	onSplitSelect?: (splits: number[]) => void;
	onSubmitIntentions?: (intentions: Intentions) => void;
}

interface PopoverPosition {
	x: number;
	y: number;
	type: "SingleSegment" | "SegmentGroup" | "SingleRelation" | "GroupRelation";
	ranges: [number, number][];
	rectWidth: number;
	rectHeight: number;
}

interface IntentionLine {
	type: "SingleSegment" | "SegmentGroup" | "SingleRelation" | "GroupRelation";
	level: number;
	ranges: [number, number][];
	choices: (SingleChoice | GroupChoice)[];
}

function LineChart({ xData, yData, ratio, title = "", isXAxisVisible = false, isYAxisVisible = false, isXAxisTextVisible = false, isYAxisTextVisible = false, isBrush = false, isFill = false, onBrush, onBrushEnd, range, height, split, isSplitMask = false, brushPosition, isExpand = true, isShowRange = true, isActive, children, onScroll, onContextMenu, xAxisColor = "#C5C5C5", yAxisColor = "#C5C5C5", lineColor = "#A6A6A6", textColor = "#C5C5C5", xAxisFormatter = (date: Date) => date.getFullYear().toString(), brushColor = "#546BB633", resultsSplit, selectedSplits, defaultSplits = [], onSplitSelect, onSubmitIntentions }: LineChartProps) {
	const svgRef = useRef<SVGSVGElement>(null);
	const id = useId();
	const [popoverPosition, setPopoverPosition] = useState<PopoverPosition | null>(null);
	const [selectedChoices, setSelectedChoices] = useState<SingleChoice[]>([]);
	const [selectedGroups, setSelectedGroups] = useState<GroupChoice[]>([]);
	const [dragStart, setDragStart] = useState<[number, number] | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [intentions, setIntentions] = useState<Intentions>({
		single_segment_intentions: [],
		segment_group_intentions: [],
		single_relation_intentions: [],
		group_relation_intentions: [],
	});

	const handleScroll = useCallback(
		(event: WheelEvent) => {
			if (!onScroll) return;
			event.preventDefault();
			const total = range ? range?.[1] - range?.[0] : xData.length;
			const step = Math.max(1, Math.round(total / 10));
			onScroll(event.deltaY > 0 ? step : -step);
		},
		[onScroll, range, xData.length]
	);

	useEffect(() => {
		if (!svgRef.current) return;
		const svg = svgRef.current;
		svg.addEventListener("wheel", handleScroll);
		return () => {
			svg?.removeEventListener("wheel", handleScroll);
		};
	}, [handleScroll]);

	const handleContextMenu = useCallback(
		(event: MouseEvent) => {
			event.preventDefault();
			onContextMenu?.(event);
		},
		[onContextMenu]
	);

	useEffect(() => {
		if (!svgRef.current) return;
		const svg = svgRef.current;
		svg.addEventListener("contextmenu", handleContextMenu);
		return () => {
			svg?.removeEventListener("contextmenu", handleContextMenu);
		};
	}, [handleContextMenu]);

	useEffect(() => {
		if (!defaultSplits?.length) return;
		setIntentions({
			single_segment_intentions: [],
			segment_group_intentions: [],
			single_relation_intentions: [],
			group_relation_intentions: [],
		});
	}, [defaultSplits]);

	const handleChoicesChange = useCallback((choice: SingleChoice) => {
		setSelectedChoices((prev) => {
			if (prev.includes(choice)) {
				return prev.filter((c) => c !== choice);
			}
			return [...prev, choice];
		});
	}, []);

	const handleGroupChoicesChange = useCallback((choice: GroupChoice) => {
		setSelectedGroups((prev) => {
			if (prev.includes(choice)) {
				return prev.filter((c) => c !== choice);
			}
			return [...prev, choice];
		});
	}, []);

	const handlePopoverClose = useCallback(() => {
		setPopoverPosition(null);
	}, []);

	const createIntention = useMemo(
		() => ({
			SingleSegment: (ranges: [number, number][], choices: SingleChoice[]) => ({
				id: selectedSplits?.findIndex((split) => split === ranges[0][0]) ?? -1,
				single_choices: choices,
			}),
			SegmentGroup: (ranges: [number, number][], choices: GroupChoice[]) => ({
				ids: [selectedSplits?.findIndex((split) => split === ranges[0][0]) ?? -1, selectedSplits?.findIndex((split) => split === ranges[ranges.length - 1][0]) ?? -1] as [number, number],
				group_choices: choices,
			}),
		}),
		[selectedSplits]
	);

	const handleConfirm = useCallback(() => {
		if (!popoverPosition) return;

		const { type, ranges } = popoverPosition;
		const newIntentions = deepClone(intentions);

		switch (type) {
			case "SingleSegment": {
				if (selectedChoices.length === 0) return;
				const existingIndex = newIntentions.single_segment_intentions.findIndex((intention) => deepEqual([[selectedSplits?.[intention.id], selectedSplits?.[intention.id + 1]]], ranges));

				if (existingIndex !== -1) {
					newIntentions.single_segment_intentions[existingIndex] = {
						...newIntentions.single_segment_intentions[existingIndex],
						single_choices: selectedChoices,
					};
				} else {
					newIntentions.single_segment_intentions.push(createIntention.SingleSegment(ranges, selectedChoices));
				}
				break;
			}

			case "SegmentGroup": {
				if (selectedGroups.length === 0) return;

				const existingIndex = newIntentions.segment_group_intentions.findIndex((intention) => deepEqual([[selectedSplits?.[intention.ids[0]], selectedSplits?.[intention.ids[1] + 1]]], ranges));

				if (existingIndex !== -1) {
					newIntentions.segment_group_intentions[existingIndex] = {
						...newIntentions.segment_group_intentions[existingIndex],
						group_choices: selectedGroups,
					};
				} else {
					newIntentions.segment_group_intentions.push(createIntention.SegmentGroup(ranges, selectedGroups));
				}
				break;
			}

			default:
				return;
		}

		setIntentions(newIntentions);
		handlePopoverClose();
		setSelectedChoices([]);
		setSelectedGroups([]);
	}, [popoverPosition, intentions, selectedChoices, selectedGroups, createIntention, handlePopoverClose, selectedSplits]);

	const handleSplitClick = useCallback(
		(event: MouseEvent, clickRange: [number, number]) => {
			if (!onSplitSelect || !split || !selectedSplits || !defaultSplits) return;
			const [start, end] = clickRange;

			const minSplit = Math.min(...selectedSplits);
			const maxSplit = Math.max(...selectedSplits);

			if (event.button === 0) {
				if (start >= minSplit && end <= maxSplit) {
					setDragStart(clickRange);
					setIsDragging(true);
					return;
				}

				const left = Math.min(start, minSplit);
				const right = Math.max(end, maxSplit);
				if (popoverPosition && (popoverPosition.ranges[0][0] < left || popoverPosition.ranges[popoverPosition.ranges.length - 1][1] > right)) {
					flushSync(() => setPopoverPosition(null));
				}
				onSplitSelect(split.filter((point) => point >= left && point <= right));
			} else if (event.button === 2) {
				const defaultMaxSplit = Math.max(...defaultSplits);
				const defaultMinSplit = Math.min(...defaultSplits);
				if (start >= defaultMaxSplit) {
					const left = Math.min(defaultMinSplit, minSplit);
					const right = start;
					const newSelectedSplits = selectedSplits.filter((point) => point <= right && point >= left);
					if (popoverPosition && (popoverPosition.ranges[0][0] < left || popoverPosition.ranges[popoverPosition.ranges.length - 1][1] > right)) {
						flushSync(() => setPopoverPosition(null));
					}
					onSplitSelect(newSelectedSplits);
				} else if (end <= defaultMinSplit) {
					const left = end;
					const right = Math.max(defaultMaxSplit, maxSplit);
					const newSelectedSplits = selectedSplits.filter((point) => point >= left && point <= right);
					if (popoverPosition && (popoverPosition.ranges[0][0] < left || popoverPosition.ranges[popoverPosition.ranges.length - 1][1] > right)) {
						flushSync(() => setPopoverPosition(null));
					}
					onSplitSelect(newSelectedSplits);
				}
			}
		},
		[split, selectedSplits, defaultSplits, onSplitSelect, popoverPosition]
	);

	const handleMouseMove = useCallback(
		(event: MouseEvent) => {
			if (!isDragging || !dragStart || !split || !selectedSplits) return;

			const rect = event.target as SVGRectElement;
			const range = rect.getAttribute("data-range");
			if (!range) return;

			const currentRange = JSON.parse(range) as [number, number];
			const ranges: [number, number][] = [];

			const minSplit = Math.min(...selectedSplits);
			const maxSplit = Math.max(...selectedSplits);

			const startIdx = Math.max(minSplit, Math.min(dragStart[0], currentRange[0]));
			const endIdx = Math.min(maxSplit, Math.max(dragStart[1], currentRange[1]));

			for (let i = 0; i < split.length - 1; i++) {
				if (split[i] >= startIdx && split[i + 1] <= endIdx && split[i] >= minSplit && split[i + 1] <= maxSplit) {
					ranges.push([split[i], split[i + 1]]);
				}
			}

			d3.selectAll(".split-interaction rect").attr("fill", function () {
				const rangeAttr = (this as SVGRectElement)?.getAttribute?.("data-range");
				if (!rangeAttr) return "transparent";
				const [s, e] = JSON.parse(rangeAttr);
				return s >= startIdx && e <= endIdx && s >= minSplit && e <= maxSplit ? "#1890ff33" : selectedSplits.includes(s) && selectedSplits.includes(e) ? "#3331" : "transparent";
			});
		},
		[isDragging, dragStart, split, selectedSplits]
	);

	const handleMouseUp = useCallback(
		(event: MouseEvent) => {
			if (!isDragging || !dragStart || !split || !selectedSplits) return;

			const rect = event.target as SVGRectElement;
			const range = rect.getAttribute("data-range");
			if (!range) return;

			const currentRange = JSON.parse(range) as [number, number];
			const ranges: [number, number][] = [];

			const minSplit = Math.min(...selectedSplits);
			const maxSplit = Math.max(...selectedSplits);

			const startIdx = Math.max(minSplit, Math.min(dragStart[0], currentRange[0]));
			const endIdx = Math.min(maxSplit, Math.max(dragStart[1], currentRange[1]));

			for (let i = 0; i < split.length - 1; i++) {
				if (split[i] >= startIdx && split[i + 1] <= endIdx && split[i] >= minSplit && split[i + 1] <= maxSplit) {
					ranges.push([split[i], split[i + 1]]);
				}
			}

			if (ranges.length > 0) {
				const highlightedRects = Array.from(d3.selectAll(".split-interaction rect").nodes()).filter((node) => {
					const rangeAttr = (node as SVGRectElement).getAttribute("data-range");
					if (!rangeAttr) return false;
					const [s, e] = JSON.parse(rangeAttr);
					return s >= startIdx && e <= endIdx && s >= minSplit && e <= maxSplit;
				}) as SVGRectElement[];

				const svgRect = svgRef.current?.getBoundingClientRect();
				if (svgRect && highlightedRects.length > 0) {
					const bounds = highlightedRects.reduce(
						(acc, rect) => {
							const rectBounds = rect.getBoundingClientRect();
							return {
								left: Math.min(acc.left, rectBounds.left),
								right: Math.max(acc.right, rectBounds.right),
								top: Math.min(acc.top, rectBounds.top),
								bottom: Math.max(acc.bottom, rectBounds.bottom),
							};
						},
						{
							left: Infinity,
							right: -Infinity,
							top: Infinity,
							bottom: -Infinity,
						}
					);

					const centerX = (bounds.left + bounds.right) / 2;
					const centerY = bounds.top;

					flushSync(() => setPopoverPosition(null));

					// 检查是否存在相同范围的意图
					const existingIntentions = intentions.single_segment_intentions.filter((intention) => ranges[0][0] === selectedSplits[intention.id] && ranges[ranges.length - 1][1] === selectedSplits[intention.id + 1]);
					const existingGroups = intentions.segment_group_intentions.filter((intention) => ranges[0][0] === selectedSplits[intention.ids[0]] && ranges[ranges.length - 1][0] === selectedSplits[intention.ids[1]]);

					// 设置已存在的选项
					setSelectedChoices(existingIntentions.flatMap((intention) => intention.single_choices));
					setSelectedGroups(existingGroups.flatMap((intention) => intention.group_choices));

					setPopoverPosition({
						x: centerX - svgRect.left,
						y: centerY - svgRect.top,
						type: ranges.length > 1 ? "SegmentGroup" : "SingleSegment",
						ranges,
						rectWidth: bounds.right - bounds.left,
						rectHeight: bounds.bottom - bounds.top,
					});
				}
			}

			setIsDragging(false);
			setDragStart(null);
		},
		[isDragging, dragStart, split, selectedSplits, intentions]
	);

	const handleDelete = useCallback(() => {
		if (!popoverPosition) return;
		const { type, ranges } = popoverPosition;
		const newIntentions = deepClone(intentions);

		switch (type) {
			case "SingleSegment": {
				const existingIndex = newIntentions.single_segment_intentions.findIndex((intention) => deepEqual([[selectedSplits?.[intention.id], selectedSplits?.[intention.id + 1]]], ranges));
				if (existingIndex !== -1) {
					newIntentions.single_segment_intentions.splice(existingIndex, 1);
				}
				break;
			}
			case "SegmentGroup": {
				const existingIndex = newIntentions.segment_group_intentions.findIndex((intention) => ranges[0][0] === selectedSplits?.[intention.ids[0]] && ranges[ranges.length - 1][0] === selectedSplits?.[intention.ids[1]]);
				if (existingIndex !== -1) {
					newIntentions.segment_group_intentions.splice(existingIndex, 1);
				}
				break;
			}
		}

		setIntentions(newIntentions);
		handlePopoverClose();
	}, [popoverPosition, intentions, selectedSplits, handlePopoverClose]);

	const draw = useCallback(() => {
		if (!svgRef.current || xData.length === 0 || yData.length === 0) return;

		let start = range?.[0] ?? 0;
		let end = range?.[1] ? range[1] + 1 : xData.length;
		const timeStampData = xData.every((x) => typeof x === "string") ? xData.map((d) => new Date(d).getTime()) : xData.slice();
		let keyData = range ? timeStampData.slice(start, end) : timeStampData.slice();
		let valueData = range ? yData.slice(start, end) : yData.slice();
		let data = keyData.map((x, i) => [x, valueData[i]] as [number, number]);

		const isMargin = isXAxisVisible || isXAxisTextVisible || isYAxisVisible || isYAxisTextVisible;
		const margin = { top: isMargin ? 30 : 0, right: isMargin ? 40 : 0, bottom: isMargin ? 30 : 0, left: isMargin ? 30 : 0 };
		const svg = d3.select(svgRef.current);
		svg.attr("width", "100%");
		svg.attr("height", "100%");
		const width = Math.max(10, svgRef.current.clientWidth - margin.left - margin.right);
		let iHeight: number = typeof height === "string" ? (svgRef.current.clientHeight * parseFloat(height)) / 100 : height ?? 200;
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
			innerWidth = (xUnitPixel * xRange) / 1000;
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

		svg.attr("height", outerHeight);

		const x = d3
			.scaleTime()
			.domain(xScale.map((d) => new Date(d)))
			.range([0, innerWidth]);

		const y = d3.scaleLinear().domain(yScale).range([innerHeight, 0]);

		const lineGenerator = d3
			.line<[number, number]>()
			.x((d) => x(new Date(d[0]))!)
			.y((d) => y(d[1]));

		svg.selectAll("*").remove();

		svg.append("defs").append("clipPath").attr("id", `clip-path-${id}`).append("rect").attr("x", 0).attr("y", 0).attr("width", innerWidth).attr("height", innerHeight);

		const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

		if (isActive) {
			svg.append("rect").attr("x", 0).attr("y", 0).attr("width", outerWidth).attr("height", outerHeight).attr("fill", "#82C4FF33");
		}

		g.append("text").attr("x", 20).attr("text-anchor", "end").attr("font-size", "16px").attr("fill", textColor).attr("writing-mode", "sideways-lr").text(title);

		svg.append("defs").append("marker").attr("id", `arrow-${id}`).attr("viewBox", "0 -5 10 10").attr("refX", 8).attr("refY", 0).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto").append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", xAxisColor);

		if (isXAxisVisible) {
			const xAxis = d3
				.axisBottom(x)
				.tickValues([...new Set([xMin, xMax, ...xScale])])
				.tickFormat((d) => xAxisFormatter(new Date(d as number)))
				.tickSize(isXAxisTextVisible ? 6 : 0);

			const xAxisG = g
				.append("g")
				.attr("transform", `translate(0,${innerHeight})`)
				.call(xAxis)
				.call((g) => {
					g.selectAll("path, line").attr("stroke", xAxisColor);
					g.selectAll("text")
						.attr("fill", xAxisColor)
						.style("display", isXAxisTextVisible ? "block" : "none");
				});

			xAxisG
				.append("line")
				.attr("x1", innerWidth)
				.attr("y1", 0)
				.attr("x2", innerWidth + 10)
				.attr("y2", 0)
				.attr("stroke", xAxisColor)
				.attr("marker-end", `url(#arrow-${id})`);
		}

		if (isYAxisVisible) {
			const yAxis = d3
				.axisLeft(y)
				.tickValues([...new Set([yMin, yMax, ...yScale])])
				.tickSize(isYAxisTextVisible ? 6 : 0);

			const yAxisG = g
				.append("g")
				.call(yAxis)
				.call((g) => {
					g.selectAll("path, line").attr("stroke", yAxisColor);
					g.selectAll("text")
						.attr("fill", yAxisColor)
						.style("display", isYAxisTextVisible ? "block" : "none");
				});

			yAxisG.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", -10).attr("stroke", yAxisColor).attr("marker-end", `url(#arrow-${id})`);
		}

		if ((range && range[0] !== range[1]) || !range) {
			g.append("path")
				.datum(keyData.map((t, i) => [t, valueData[i]] as [number, number]))
				.attr("d", lineGenerator)
				.attr("fill", "none")
				.attr("stroke", lineColor)
				.attr("stroke-opacity", "0.7")
				.attr("clip-path", `url(#clip-path-${id})`)
				.attr("stroke-width", 1);
		}

		if (split && keyData.length > 2) {
			const splitLinesG = g
				.append("g")
				.attr("class", "split-lines")
				.attr("clip-path", isSplitMask ? `url(#clip-path-${id})` : null);

			const splitInteractionG = g
				.append("g")
				.attr("class", "split-interaction")
				.attr("clip-path", isSplitMask ? `url(#clip-path-${id})` : null)
				.style("pointer-events", "all")
				.raise();

			const color = d3.color(lineColor);
			const darkerColor = color ? d3.hsl(color).darker(10).toString() : lineColor;

			for (let i = 0; i < split.length - 1; i++) {
				const x1 = x(timeStampData[split[i]]);
				const x2 = x(timeStampData[split[i + 1]]);
				const y1 = y(yData[split[i]]);
				const y2 = y(yData[split[i + 1]]);

				splitLinesG.append("line").attr("class", "split-line").attr("x1", x1).attr("x2", x2).attr("y1", y1).attr("y2", y2).attr("stroke", darkerColor).attr("stroke-opacity", "0.5").attr("stroke-width", 2).attr("pointer-events", "none");

				if (defaultSplits && selectedSplits) {
					splitInteractionG
						.append("rect")
						.attr("x", x1)
						.attr("y", 0)
						.attr("width", x2 - x1)
						.attr("height", innerHeight)
						.attr("fill", popoverPosition?.ranges.some(([s, e]) => s === split[i] && e === split[i + 1]) ? "#1890ff33" : selectedSplits?.includes(split[i]) && selectedSplits?.includes(split[i + 1]) ? "#3331" : "transparent")
						.attr("cursor", "pointer")
						.attr("data-range", JSON.stringify([split[i], split[i + 1]]))
						.style("pointer-events", "all")
						.on("pointerdown", function (event) {
							handleSplitClick(event, [split[i], split[i + 1]]);
						})
						.on("mousemove", handleMouseMove)
						.on("mouseup", handleMouseUp);
				}
			}
		}

		if (range && isShowRange) {
			g.append("rect")
				.attr("x", x(xMin))
				.attr("y", 0)
				.attr("width", x(xMax) - x(xMin))
				.attr("height", innerHeight)
				.attr("fill", "#3331");
		}

		const areaGenerator = d3
			.area<[number, number]>()
			.x((d) => x(d[0]))
			.y0(y(yMin))
			.y1((d) => y(d[1]));

		if (isFill) {
			g.append("path").datum(data).attr("d", areaGenerator).attr("fill", "#82C4FF99");
		}

		if (resultsSplit && keyData.length > 2) {
			const resultsG = g.append("g").attr("class", "results-split-line");

			for (let i = 0; i < resultsSplit.segments.length; i++) {
				for (let j = 0; j < resultsSplit.segments[i].length; j++) {
					const x1 = x(timeStampData[resultsSplit.segments[i][j][0]]);
					const x2 = x(timeStampData[resultsSplit.segments[i][j][1]]);
					const y1 = y(yData[resultsSplit.segments[i][j][0]]);
					const y2 = y(yData[resultsSplit.segments[i][j][1]]);
					resultsG
						.append("line")
						.attr("class", "results-split-line")
						.attr("x1", x1)
						.attr("x2", x2)
						.attr("y1", y1)
						.attr("y2", y2)
						.attr("clip-path", `url(#clip-path-${id})`)
						.attr("stroke", resultsSplit.colors[j] || "#666")
						.attr("stroke-opacity", "0.8")
						.attr("stroke-width", 4);
				}
			}
		}

		if (split && intentions && defaultSplits && selectedSplits) {
			const intentionLinesG = svg.append("g").attr("class", "intention-lines").attr("transform", `translate(${margin.left},0)`);
			const lines: Record<number, IntentionLine[]> = {};

			intentions.single_segment_intentions.forEach((intention) => {
				const range = [selectedSplits[intention.id], selectedSplits[intention.id + 1]] as [number, number];
				let level = 0;
				while (true) {
					if (!lines[level]) {
						lines[level] = [];
					}
					if (lines[level].some((line) => hasOverlap(line.ranges, [range]))) {
						level++;
					} else {
						break;
					}
				}
				lines[level].push({
					type: "SingleSegment",
					ranges: [range],
					choices: intention.single_choices,
					level,
				});
			});

			function hasOverlap(ranges1: [number, number][], ranges2: [number, number][]) {
				const [start1, end1] = [ranges1[0][0], ranges1[ranges1.length - 1][1]];
				const [start2, end2] = [ranges2[0][0], ranges2[ranges2.length - 1][1]];
				const minStart = Math.max(start1, start2);
				const maxEnd = Math.min(end1, end2);
				return minStart < maxEnd;
			}

			intentions.segment_group_intentions.forEach((intention) => {
				const ranges: [number, number][] = [];
				for (let i = intention.ids[0]; i <= intention.ids[1]; i++) {
					ranges.push([selectedSplits[i], selectedSplits[i + 1]]);
				}
				let level = 0;
				while (true) {
					if (!lines[level]) {
						lines[level] = [];
					}
					if (lines[level].some((line) => hasOverlap(line.ranges, ranges))) {
						level++;
					} else {
						break;
					}
				}
				lines[level].push({
					type: "SegmentGroup",
					ranges,
					choices: intention.group_choices,
					level,
				});
			});

			Object.values(lines)
				.flat()
				.forEach((intention) => {
					const startX = x(timeStampData[intention.ranges[0][0]]);
					const endX = x(timeStampData[intention.ranges[intention.ranges.length - 1][1]]);

					const y = margin.top - intention.level * 10 - 4;

					const line = intentionLinesG.append("g").attr("class", "intention-line").style("cursor", "pointer");

					line.append("line").attr("x1", startX).attr("x2", endX).attr("y1", y).attr("y2", y).attr("stroke", "#1890ff").attr("stroke-width", 4);

					line.append("line")
						.attr("x1", startX)
						.attr("x2", startX)
						.attr("y1", y - 3)
						.attr("y2", y + 3)
						.attr("stroke", "#1890ff")
						.attr("stroke-width", 2);

					line.append("line")
						.attr("x1", endX)
						.attr("x2", endX)
						.attr("y1", y - 3)
						.attr("y2", y + 3)
						.attr("stroke", "#1890ff")
						.attr("stroke-width", 2);

					line.on("click", () => {
						if (popoverPosition) {
							flushSync(() => setPopoverPosition(null));
							setSelectedChoices([]);
							setSelectedGroups([]);
						}
						setPopoverPosition({
							x: (startX + endX) / 2 + (endX - startX),
							y: y,
							type: intention.type,
							ranges: intention.ranges,
							rectWidth: endX - startX,
							rectHeight: 10,
						});

						if (intention.type === "SingleSegment") {
							setSelectedChoices(intention.choices as SingleChoice[]);
						} else {
							setSelectedGroups(intention.choices as GroupChoice[]);
						}
					});
				});

			const submitButton = intentionLinesG
				.append("g")
				.attr("class", "submit-button")
				.attr("transform", `translate(${innerWidth - 20}, 0)`)
				.style("cursor", "pointer");

			submitButton.append("rect").attr("width", 60).attr("height", 24).attr("rx", 4).attr("fill", "#1890ff");

			submitButton.append("text").attr("x", 30).attr("y", 16).attr("text-anchor", "middle").attr("fill", "white").attr("font-size", "12px").text("Submit");

			submitButton
				.on("click", () => {
					if (onSubmitIntentions) {
						onSubmitIntentions(intentions);
					}
				})
				.on("mouseenter", function () {
					d3.select(this).select("rect").transition().duration(200).attr("fill", "#40a9ff");
				})
				.on("mouseleave", function () {
					d3.select(this).select("rect").transition().duration(200).attr("fill", "#1890ff");
				});
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

			const brush = d3.brushX().extent([
				[0, 0],
				[innerWidth, innerHeight],
			]);

			const brushG = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`).attr("class", "brush").call(brush);

			function getFilteredIndices(selection: [Date, Date]) {
				const [minX, maxX] = selection;
				return data
					.map((d, i) => ({ index: i, value: d }))
					.filter((d) => d.value[0] >= minX.getTime() && d.value[0] <= maxX.getTime())
					.map((d) => d.index);
			}

			function highlightBrush(selection: [Date, Date]) {
				g.selectAll(".area").remove();
				const filteredIndices = getFilteredIndices(selection);
				g.append("path")
					.attr("class", "area")
					.datum(filteredIndices.map((i) => data[i]))
					.attr("d", areaGenerator)
					.attr("fill", "#82C4FF99");
			}

			if (brushPosition) {
				brushG.call(brush.move!, [x(timeStampData[brushPosition[0]]), x(timeStampData[brushPosition[1]])]);
				const minX = new Date(timeStampData[brushPosition[0]]);
				const maxX = new Date(timeStampData[brushPosition[1]]);
				if (isFill) highlightBrush([minX, maxX]);
			}

			brush
				.on("brush", (event) => brushFn(event))
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

			brushG.select(".selection").attr("fill", brushColor).attr("clip-path", `url(#clip-path-${id})`).attr("stroke", "none").style("pointer-events", "all");

			return () => {
				brush.on("brush", null).on("end", null);
				svg.selectAll("*").remove();
			};
		}
	}, [xData, yData, ratio, title, isXAxisVisible, isYAxisVisible, isXAxisTextVisible, isYAxisTextVisible, isBrush, onBrush, isFill, range, height, split, isSplitMask, brushPosition, isExpand, isShowRange, id, onBrushEnd, isActive, xAxisColor, yAxisColor, lineColor, textColor, xAxisFormatter, brushColor, resultsSplit, handleSplitClick, selectedSplits, popoverPosition, handleMouseMove, handleMouseUp, intentions, defaultSplits, onSubmitIntentions]);

	useEffect(() => {
		const cancle = draw();
		window.addEventListener("resize", draw);
		return () => {
			window.removeEventListener("resize", draw);
			cancle?.();
		};
	}, [draw]);

	useEffect(() => {
		if (!isDragging) return;

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, handleMouseMove, handleMouseUp]);

	const popoverContent = useMemo(() => {
		if (!popoverPosition) return null;

		const isExisting = popoverPosition.type === "SingleSegment" ? intentions.single_segment_intentions.some((intention) => deepEqual([[selectedSplits?.[intention.id], selectedSplits?.[intention.id + 1]]], popoverPosition.ranges)) : intentions.segment_group_intentions.some((intention) => popoverPosition.ranges[0][0] === selectedSplits?.[intention.ids[0]] && popoverPosition.ranges[popoverPosition.ranges.length - 1][0] === selectedSplits?.[intention.ids[1]]);

		return popoverPosition.type === "SingleSegment" ? (
			<IntentionPopover
				type="single"
				choices={Object.values(SingleChoice)}
				selected={selectedChoices}
				onChange={handleChoicesChange}
				onCancel={handlePopoverClose}
				onConfirm={handleConfirm}
				onDelete={handleDelete}
				isExisting={isExisting}
			/>
		) : (
			<IntentionPopover
				type="group"
				choices={Object.values(GroupChoice)}
				selected={selectedGroups}
				onChange={handleGroupChoicesChange}
				onCancel={handlePopoverClose}
				onConfirm={handleConfirm}
				onDelete={handleDelete}
				isExisting={isExisting}
			/>
		);
	}, [popoverPosition, intentions, selectedSplits, selectedChoices, selectedGroups, handleChoicesChange, handleGroupChoicesChange, handlePopoverClose, handleConfirm, handleDelete]);

	return (
		<>
			<svg
				ref={svgRef}
				width="100%"
				height="100%"
			></svg>
			{children}
			{popoverPosition && (
				<Popover
					open={!!popoverPosition}
					content={popoverContent}
					trigger="click"
				>
					<div style={{ width: "0", height: "0", position: "absolute", left: `${popoverPosition.x - popoverPosition.rectWidth / 2}px`, top: `${popoverPosition.y}px` }}></div>
				</Popover>
			)}
		</>
	);
}

interface IntentionPopoverProps<T extends SingleChoice | GroupChoice> {
	type: "single" | "group";
	choices: T[];
	selected: T[];
	onChange: (choice: T) => void;
	onCancel: () => void;
	onConfirm: () => void;
	onDelete?: () => void;
	isExisting?: boolean;
}

function IntentionPopover<T extends SingleChoice | GroupChoice>({ type, choices, selected, onChange, onCancel, onConfirm, onDelete, isExisting }: IntentionPopoverProps<T>) {
	return (
		<div>
			<Flex
				justify="space-between"
				align="center"
			>
				<Typography.Paragraph keyboard>{type}</Typography.Paragraph>
				{isExisting && (
					<Button
						danger
						type="text"
						onClick={onDelete}
						style={{ marginLeft: 8 }}
					>
						Delete
					</Button>
				)}
			</Flex>
			<Space direction="vertical">
				{choices.map((choice) => (
					<Checkbox
						key={choice}
						checked={selected.includes(choice)}
						onChange={() => onChange(choice)}
					>
						{choice}
					</Checkbox>
				))}
			</Space>
			<Flex
				justify="flex-end"
				gap={8}
				style={{ marginTop: 16 }}
			>
				<Button onClick={onCancel}>Cancel</Button>
				<Button
					type="primary"
					onClick={onConfirm}
					disabled={selected.length === 0}
				>
					Confirm
				</Button>
			</Flex>
		</div>
	);
}

export default memo(LineChart, (prevProps, nextProps) => {
	return Object.keys(prevProps).every((key) => {
		const k = key as keyof LineChartProps;
		if (k === "children") return false;
		return deepEqual(prevProps[k], nextProps[k]);
	});
});
