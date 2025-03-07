import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { deepClone, deepEqual } from "../../utils/deepclone";
import { Popover } from "antd";
import { GroupChoice, GroupRelationChoice, Intentions, SingleChoice, SingleRelationChoice } from "../../types/QuerySpec";
import { flushSync } from "react-dom";
import { formatTime } from "../../utils/time";
import IntentionPopover from "./IntentionPopover";
import { IntentionLine, LineChartProps, PopoverPosition } from "./types";
import { generateId } from "../../utils/id";

function LineChart({ xData, yData, ratio, isFill = false, title = "", isXAxisVisible = false, isYAxisVisible = false, isXAxisTextVisible = false, isYAxisTextVisible = false, isBrush = false, onBrush, onBrushEnd, range, height, split, isSplitMask = false, brushPosition, isExpand = true, isShowRange = true, isActive, children, onScroll, onContextMenu, xAxisColor = "#C5C5C5", yAxisColor = "#C5C5C5", lineColor = "#A6A6A6", textColor = "#C5C5C5", xAxisFormatter = (date: Date) => formatTime(date, xDataType === "number" ? undefined : xDataType), brushColor = "#546BB633", resultsSplit, selectedSplits, defaultSplits = [], isSelectable = false, onSplitSelect, onSubmitIntentions, margin, isHoverable = false, xDataType = "number", isRequesting = false, onCancelSplit }: LineChartProps) {
	const svgRef = useRef<SVGSVGElement>(null);
	const id = generateId();
	const isTime = useMemo(() => xDataType !== "number", [xDataType]);
	const [userSplits, setUserSplits] = useState<number[]>([]);

	useEffect(() => {
		setUserSplits([]);
	}, [xData, yData]);

	const splits = useMemo(() => (defaultSplits?.length ? defaultSplits : userSplits), [defaultSplits, userSplits]);
	const [popoverPosition, setPopoverPosition] = useState<PopoverPosition | null>(null);
	const [selectedChoices, setSelectedChoices] = useState<SingleChoice[]>([]);
	const [selectedGroups, setSelectedGroups] = useState<GroupChoice[]>([]);
	const [selectedRelations, setSelectedRelations] = useState<SingleRelationChoice[]>([]);
	const [selectedGroupRelations, setSelectedGroupRelations] = useState<GroupRelationChoice[]>([]);
	const [dragStart, setDragStart] = useState<[number, number] | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [relationIds, setRelationIds] = useState<number[][]>([]);
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
			const rect = svgRef.current?.getBoundingClientRect();
			if (!rect) return;
			const relativeX = (event.clientX - rect.left) / rect.width;
			const normalizedPosition = (relativeX * 2) - 1;
			const total = range ? range?.[1] - range?.[0] : xData.length;
			const step = Math.max(1, Math.round(total / 10));
			onScroll(event.deltaY > 0 ? step : -step, normalizedPosition);
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
			if (!onContextMenu) return;
			event.preventDefault();
			onContextMenu(event);
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
		setPopoverPosition(null);
		setIntentions({
			single_segment_intentions: [],
			segment_group_intentions: [],
			single_relation_intentions: [],
			group_relation_intentions: [],
		});
	}, [splits, selectedSplits, xData, yData, split]);

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

	const handleRelationsChange = useCallback((choice: SingleRelationChoice) => {
		setSelectedRelations((prev) => {
			if (prev.includes(choice)) {
				return prev.filter((c) => c !== choice);
			}
			return [...prev, choice];
		});
	}, []);

	const handleGroupRelationsChange = useCallback((choice: GroupRelationChoice) => {
		setSelectedGroupRelations((prev) => {
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

		const { type, ranges, groups } = popoverPosition;
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
			case "SingleRelation": {
				if (selectedRelations.length === 0) return;
				const id1 = selectedSplits?.findIndex((split) => split === ranges[0][0]);
				const id2 = selectedSplits?.findIndex((split) => split === ranges[1][0]);
				if (id1 === undefined || id2 === undefined) return;
				const is1 = id1 < id2;
				const existingIndex = newIntentions.single_relation_intentions.findIndex((intention) => intention.id1 === (is1 ? id1 : id2) && intention.id2 === (is1 ? id2 : id1));

				if (existingIndex !== -1) {
					newIntentions.single_relation_intentions[existingIndex] = {
						...newIntentions.single_relation_intentions[existingIndex],
						relation_choices: selectedRelations,
					};
				} else {
					newIntentions.single_relation_intentions.push({
						id1: is1 ? id1 : id2,
						id2: is1 ? id2 : id1,
						relation_choices: selectedRelations,
					});
				}
				break;
			}
			case "GroupRelation": {
				if (selectedGroupRelations.length === 0 || !groups?.length) return;
				const [range1, range2] = groups;
				const range1Id1 = selectedSplits?.findIndex((split) => deepEqual(split, range1[0][0]));
				const range1Id2 = selectedSplits?.findIndex((split) => deepEqual(split, range1[range1.length - 1][0]));
				const range2Id1 = selectedSplits?.findIndex((split) => deepEqual(split, range2[0][0]));
				const range2Id2 = selectedSplits?.findIndex((split) => deepEqual(split, range2[range2.length - 1][0]));
				if (range1Id1 === undefined || range1Id2 === undefined || range2Id1 === undefined || range2Id2 === undefined) return;
				const is1 = range1Id1 < range2Id1;
				const existingIndex = newIntentions.group_relation_intentions.findIndex((intention) => intention.group1[0] === (is1 ? range1Id1 : range2Id1) && intention.group1[1] === (is1 ? range1Id2 : range2Id2) && intention.group2[0] === (is1 ? range2Id1 : range1Id1) && intention.group2[1] === (is1 ? range2Id2 : range1Id2));
				if (existingIndex !== -1) {
					newIntentions.group_relation_intentions[existingIndex] = {
						...newIntentions.group_relation_intentions[existingIndex],
						relation_choices: selectedGroupRelations,
					};
				} else {
					newIntentions.group_relation_intentions.push({
						group1: is1 ? [range1Id1, range1Id2] : [range2Id1, range2Id2],
						group2: is1 ? [range2Id1, range2Id2] : [range1Id1, range1Id2],
						relation_choices: selectedGroupRelations,
					});
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
		setSelectedRelations([]);
		setSelectedGroupRelations([]);
		setRelationIds([]);
	}, [popoverPosition, intentions, selectedChoices, selectedGroups, createIntention, handlePopoverClose, selectedSplits, selectedRelations, selectedGroupRelations]);

	const handleSplitClick = useCallback(
		(event: MouseEvent, clickRange: [number, number]) => {
			if (!onSplitSelect || !split) return;
			const [start, end] = clickRange;

			if (!splits.length) {
				setDragStart(clickRange);
				setIsDragging(true);
				return;
			}

			if (!selectedSplits) return;
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
					setPopoverPosition(null);
				}
				onSplitSelect(split.filter((point) => point >= left && point <= right));
			} else if (event.button === 2) {
				const defaultMaxSplit = Math.max(...splits);
				const defaultMinSplit = Math.min(...splits);
				if (start >= defaultMaxSplit) {
					const left = Math.min(defaultMinSplit, minSplit);
					const right = start;
					const newSelectedSplits = selectedSplits.filter((point) => point <= right && point >= left);
					if (popoverPosition && (popoverPosition.ranges[0][0] < left || popoverPosition.ranges[popoverPosition.ranges.length - 1][1] > right)) {
						setPopoverPosition(null);
					}
					onSplitSelect(newSelectedSplits);
				} else if (end <= defaultMinSplit) {
					const left = end;
					const right = Math.max(defaultMaxSplit, maxSplit);
					const newSelectedSplits = selectedSplits.filter((point) => point >= left && point <= right);
					if (popoverPosition && (popoverPosition.ranges[0][0] < left || popoverPosition.ranges[popoverPosition.ranges.length - 1][1] > right)) {
						setPopoverPosition(null);
					}
					onSplitSelect(newSelectedSplits);
				}
			}
		},
		[split, selectedSplits, splits, onSplitSelect, popoverPosition]
	);

	const handleMouseMove = useCallback(
		(event: MouseEvent) => {
			if (!isDragging || !dragStart || !split) return;

			const rect = event.target as SVGRectElement;
			const range = rect.getAttribute("data-range");
			if (!range) return;

			const currentRange = JSON.parse(range) as [number, number];
			
			const startIdx = Math.min(dragStart[0], currentRange[0]);
			const endIdx = Math.max(dragStart[1], currentRange[1]);

			if (!splits.length) {
				d3.selectAll(".split-interaction rect").attr("fill", function () {
					const rangeAttr = (this as SVGRectElement)?.getAttribute?.("data-range");
					if (!rangeAttr) return "transparent";
					const [s, e] = JSON.parse(rangeAttr);
					return s >= startIdx && e <= endIdx ? "#3331" : "transparent";
				});
				return;
			}

			const minSplit = Math.min(...selectedSplits!);
			const maxSplit = Math.max(...selectedSplits!);
			
			d3.selectAll(".split-interaction rect").attr("fill", function () {
				const rangeAttr = (this as SVGRectElement)?.getAttribute?.("data-range");
				if (!rangeAttr) return "transparent";
				const [s, e] = JSON.parse(rangeAttr);
				return s >= startIdx && e <= endIdx && s >= minSplit && e <= maxSplit 
					? (event.shiftKey || event.ctrlKey ? "#00800033" : "#1890ff33") 
					: selectedSplits?.includes(s) && selectedSplits?.includes(e) 
						? "#3331" 
						: "transparent";
			});
		},
		[isDragging, dragStart, split, selectedSplits, splits]
	);

	const handleMouseUp = useCallback(
		(event: MouseEvent) => {
			if (!isDragging || !dragStart || !split) return;
			const isRelation = event.shiftKey || event.ctrlKey;

			const rect = event.target as SVGRectElement;
			const range = rect.getAttribute("data-range");
			if (!range) return;

			const currentRange = JSON.parse(range) as [number, number];
			
			if (!splits.length) {
				const startIdx = Math.min(dragStart[0], currentRange[0]);
				const endIdx = Math.max(dragStart[1], currentRange[1]);
				const splits = split.filter((s) => s >= startIdx && s <= endIdx);
				setUserSplits(splits);
				onSplitSelect?.(splits);
				setIsDragging(false);
				setDragStart(null);
				return;
			}

			if (!selectedSplits) return;
			const ranges: [number, number][] = [];
			const minSplit = Math.min(...selectedSplits!);
			const maxSplit = Math.max(...selectedSplits!);
			const startIdx = Math.max(minSplit, Math.min(dragStart[0], currentRange[0]));
			const endIdx = Math.min(maxSplit, Math.max(dragStart[1], currentRange[1]));

			for (let i = 0; i < split.length - 1; i++) {
				if (split[i] >= startIdx && split[i + 1] <= endIdx && split[i] >= minSplit && split[i + 1] <= maxSplit) {
					ranges.push([split[i], split[i + 1]]);
				}
			}

			if (ranges.length > 0) {
				if (isRelation) {
					if (relationIds.length === 0) {
						setPopoverPosition(null);
						setRelationIds([...ranges]);
					} else {
						const allRanges = [[...relationIds], [...ranges]].sort((a, b) => a[0][0] - b[0][0]);
						const isGroupRelation = allRanges.some((group) => group.length > 1);

						const highlightedRects = Array.from(d3.selectAll(".split-interaction rect").nodes()).filter((node) => {
							const rangeAttr = (node as SVGRectElement).getAttribute("data-range");
							if (!rangeAttr) return false;
							const [s, e] = JSON.parse(rangeAttr);
							return allRanges.some((group) => group.some(([rs, re]) => s === rs && e === re));
						}) as SVGRectElement[];

						if (highlightedRects.length > 0) {
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

							const svgRect = svgRef.current?.getBoundingClientRect();
							if (svgRect) {
								const centerX = (bounds.left + bounds.right) / 2;
								const centerY = bounds.top;

								setPopoverPosition(null);

								const existingRelations = intentions.single_relation_intentions.filter((intention) => allRanges?.[0][0][0] === selectedSplits?.[intention.id1] && allRanges?.[1][0][0] === selectedSplits?.[intention.id2]);
								const existingGroupRelations = intentions.group_relation_intentions.filter((intention) => allRanges?.[0][0][0] === selectedSplits?.[intention.group1[0]] && allRanges?.[0][allRanges[0].length - 1][0] === selectedSplits?.[intention.group1[1]] && allRanges?.[1][0][0] === selectedSplits?.[intention.group2[0]] && allRanges?.[1][allRanges[1].length - 1][0] === selectedSplits?.[intention.group2[1]]);

								setSelectedRelations(existingRelations.flatMap((intention) => intention.relation_choices));
								setSelectedGroupRelations(existingGroupRelations.flatMap((intention) => intention.relation_choices));

								setPopoverPosition({
									x: centerX - svgRect.left,
									y: centerY - svgRect.top,
									type: isGroupRelation ? "GroupRelation" : "SingleRelation",
									ranges: allRanges.flat() as [number, number][],
									groups: allRanges as [[number, number][], [number, number][]],
									rectWidth: bounds.right - bounds.left,
									rectHeight: bounds.bottom - bounds.top,
								});
								setRelationIds([]);
							}
						}
					}
				} else {
					setRelationIds([]);
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

						const existingIntentions = intentions.single_segment_intentions.filter((intention) => ranges[0][0] === selectedSplits[intention.id] && ranges[ranges.length - 1][1] === selectedSplits[intention.id + 1]);
						const existingGroups = intentions.segment_group_intentions.filter((intention) => ranges[0][0] === selectedSplits[intention.ids[0]] && ranges[ranges.length - 1][0] === selectedSplits[intention.ids[1]]);

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
			}

			setIsDragging(false);
			setDragStart(null);
		},
		[isDragging, dragStart, split, selectedSplits, relationIds, svgRef, intentions, splits, onSplitSelect]
	);

	const handleDelete = useCallback(() => {
		if (!popoverPosition) return;
		const { type, ranges, groups } = popoverPosition;
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
			case "SingleRelation": {
				const existingIndex = newIntentions.single_relation_intentions.findIndex((intention) => groups?.[0][0][0] === selectedSplits?.[intention.id1] && groups?.[1][0][0] === selectedSplits?.[intention.id2]);
				if (existingIndex !== -1) {
					newIntentions.single_relation_intentions.splice(existingIndex, 1);
				}
				break;
			}
			case "GroupRelation": {
				const existingIndex = newIntentions.group_relation_intentions.findIndex((intention) => groups?.[0][0][0] === selectedSplits?.[intention.group1[0]] && groups?.[0][groups[0].length - 1][0] === selectedSplits?.[intention.group1[1]] && groups?.[1][0][0] === selectedSplits?.[intention.group2[0]] && groups?.[1][groups[1].length - 1][0] === selectedSplits?.[intention.group2[1]]);
				if (existingIndex !== -1) {
					newIntentions.group_relation_intentions.splice(existingIndex, 1);
				}
				break;
			}
		}

		setIntentions(newIntentions);
		handlePopoverClose();
	}, [popoverPosition, intentions, selectedSplits, handlePopoverClose]);

	const isMargin = useMemo(() => isXAxisVisible || isXAxisTextVisible || isYAxisVisible || isYAxisTextVisible, [isXAxisVisible, isXAxisTextVisible, isYAxisVisible, isYAxisTextVisible]);
	const timeStampData = useMemo(() => (xData.every((x) => typeof x === "string") ? xData.map((d) => new Date(d).getTime()) : xData.slice()), [xData]);
	const computedMargin = useMemo(() => ({ top: isMargin ? margin?.top ?? 30 : 0, right: isMargin ? margin?.right ?? 40 : 0, bottom: isMargin ? margin?.bottom ?? 30 : 0, left: isMargin ? margin?.left ?? 40 : 0 }), [isMargin, margin]);

	const draw = useCallback(() => {
		if (!svgRef.current || xData?.length === 0 || yData?.length === 0) return;

		let start = range?.[0] ?? 0;
		let end = range?.[1] ? range[1] + 1 : xData.length;
		let keyData = range ? timeStampData.slice(start, end) : timeStampData.slice();
		let valueData = range ? yData.slice(start, end) : yData.slice();
		let data = keyData.map((x, i) => [x, valueData[i]] as [number, number]);

		const svg = d3.select(svgRef.current);
		svg.attr("width", "100%");
		svg.attr("height", "100%");
		const width = Math.max(10, svgRef.current.clientWidth - computedMargin.left - computedMargin.right);
		let iHeight: number = typeof height === "string" ? (svgRef.current.clientHeight * parseFloat(height)) / 100 : height ?? 200;
		iHeight -= computedMargin.top + computedMargin.bottom;
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
			svg.attr("width", innerWidth + computedMargin.left + computedMargin.right);
		} else if (ratio) {
			const xUnitPixel = width / xRange;
			const yUnitPixel = xUnitPixel / ratio;
			innerHeight = yRange * yUnitPixel * 1000;
		} else {
			innerHeight = iHeight;
		}
		const outerHeight = innerHeight + computedMargin.top + computedMargin.bottom;

		svg.attr("height", outerHeight);

		const x = isTime
			? d3
					.scaleTime()
					.domain(xScale.map((d) => new Date(d)))
					.range([0, innerWidth])
			: d3.scaleLinear().domain(xScale).range([0, innerWidth]);

		const y = d3.scaleLinear().domain(yScale).range([innerHeight, 0]);

		const lineGenerator = d3
			.line<[number, number]>()
			.x((d) => (isTime ? x(new Date(d[0]))! : x(d[0])!))
			.y((d) => y(d[1]));

		svg.selectAll("*").remove();

		svg.append("defs").append("clipPath").attr("id", `clip-path-${id}`).append("rect").attr("x", 0).attr("y", 0).attr("width", innerWidth).attr("height", innerHeight);

		const g = svg.append("g").attr("transform", `translate(${computedMargin.left},${computedMargin.top})`);
		g.append("rect").attr("x", 0).attr("y", 0).attr("width", innerWidth).attr("height", innerHeight).attr("fill", "transparent");

		if (isActive) {
			svg.append("rect").attr("x", 0).attr("y", 0).attr("width", outerWidth).attr("height", outerHeight).attr("fill", "#82C4FF33");
		}

		g.append("text").attr("x", 5).attr("y", 0).attr("text-anchor", "start").attr("font-size", 12).attr("fill", textColor).text(title);

		svg.append("defs")
			.append("marker")
			.attr("id", `arrow-${id}`)
			.attr("viewBox", "0 -10 20 20")
			.attr("refX", 14)
			.attr("refY", 0)
			.attr("markerWidth", 8)
			.attr("markerHeight", 8)
			.attr("orient", "auto")
			.append("g")
			.call((g) => {
				g.append("path").attr("d", "M0,-10 L18,0 L0,10").attr("fill", "none").attr("stroke", xAxisColor).attr("stroke-width", 1);

				g.append("path").attr("d", "M2,-10 L20,0 L2,10").attr("fill", "none").attr("stroke", xAxisColor).attr("stroke-width", 1);
			});

		if (isXAxisVisible) {
			const xAxis = d3
				.axisBottom(x)
				.tickFormat((d) => (isTime ? xAxisFormatter(new Date(+d)) : String(+d)))
				.tickSize(isXAxisTextVisible ? 6 : 0);

			const sampleText = isTime ? xAxisFormatter(new Date(timeStampData[0])) : String(timeStampData[0]);
			const approximateTextWidth = sampleText.length * 8;
			const maxTicks = Math.floor(innerWidth / (approximateTextWidth * 1.5));
			const tickCount = Math.max(2, Math.min(maxTicks, 10));

			xAxis.ticks(tickCount).tickSize(isXAxisTextVisible ? 6 : 0);

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
			const yAxis = d3.axisLeft(y).tickSize(isYAxisTextVisible ? 6 : 0);

			if (innerHeight < 100) {
				yAxis.tickValues([yMin, yMax]);
			}

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

		if ((range && start !== end) || !range) {
			const pathG = g.append("g").attr("class", "line-path").raise();

			pathG
				.append("path")
				.datum(keyData.map((t, i) => [t, valueData[i]] as [number, number]))
				.attr("d", lineGenerator)
				.attr("fill", "none")
				.attr("stroke", lineColor)
				.attr("stroke-opacity", "0.7")
				.attr("clip-path", `url(#clip-path-${id})`)
				.attr("stroke-width", 1);

			if (isHoverable) {
				const tooltip = d3.select("body").append("div").attr("class", `tooltip-${id}`).style("position", "absolute").style("background", "#000a").style("color", "#fff").style("padding", "5px 10px").style("border", "1px solid #ccc").style("border-radius", "6px").style("pointer-events", "none").style("transform", "translate(-50%, -100%)").style("opacity", 0);

				const hoverLine = pathG.append("line").attr("class", "hover-line").attr("stroke", lineColor).attr("stroke-opacity", 0.7).attr("stroke-width", 1.5).style("opacity", 0);

				const hoverCircle = pathG.append("circle").attr("r", 4).attr("fill", lineColor).style("opacity", 0);

				g.on("mousemove", function (event) {
					const [mouseX] = d3.pointer(event, this);
					const xValue = x.invert(mouseX);
					const closestIndex = d3.bisectCenter(keyData, isTime ? (xValue as Date).getTime() : (xValue as number));
					const closestData = [keyData[closestIndex], valueData[closestIndex]] as [number, number];
					hoverLine
						.attr("x1", x(isTime ? new Date(closestData[0]) : closestData[0]))
						.attr("x2", x(isTime ? new Date(closestData[0]) : closestData[0]))
						.attr("y1", 0)
						.attr("y2", innerHeight)
						.style("opacity", 1);
					hoverCircle
						.attr("cx", x(isTime ? new Date(closestData[0]) : closestData[0]))
						.attr("cy", y(closestData[1]))
						.style("opacity", 1);
					tooltip.transition().duration(100).style("opacity", 0.9);
					const tooltipWidth = tooltip.node()?.getBoundingClientRect().width || 0;
					const tooltipHeight = tooltip.node()?.getBoundingClientRect().height || 0;
					const left = Math.min(Math.max(event.pageX, 0), window.innerWidth - tooltipWidth / 2 - 10);
					const top = Math.min(Math.max(event.pageY - 10, 0), window.innerHeight - tooltipHeight);
					tooltip
						.html(`${isTime ? "Time" : "X"}: ${isTime ? xAxisFormatter(new Date(closestData[0])) : closestData[0]}<br>${isTime ? "Value" : "Y"}: ${closestData[1]}`)
						.style("left", left + "px")
						.style("top", top + "px");
				}).on("mouseleave", function () {
					hoverLine.style("opacity", 0);
					hoverCircle.style("opacity", 0);
					tooltip.transition().duration(500).style("opacity", 0);
				});
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

		if (split && keyData.length > 2) {
			const splitLinesG = g
				.append("g")
				.attr("class", "split-lines")
				.attr("clip-path", isSplitMask ? `url(#clip-path-${id})` : null);

			const splitInteractionG = g
				.append("g")
				.attr("class", "split-interaction")
				.attr("clip-path", isSplitMask ? `url(#clip-path-${id})` : null)
				.style("pointer-events", "all");

			const color = d3.color(lineColor);
			const darkerColor = color ? d3.hsl(color).darker(10).toString() : lineColor;
			for (let i = 0; i < split.length - 1; i++) {
				const x1 = x(timeStampData[split[i]]);
				const x2 = x(timeStampData[split[i + 1]]);
				if (timeStampData[split[i]] > xScale[1] || timeStampData[split[i + 1]] < xScale[0]) {
					continue;
				}
				const y1 = y(yData[split[i]]);
				const y2 = y(yData[split[i + 1]]);

				splitLinesG.append("line").attr("class", "split-line").attr("x1", x1).attr("x2", x2).attr("y1", y1).attr("y2", y2).attr("stroke", darkerColor).attr("stroke-opacity", "0.5").attr("stroke-width", 1).attr("pointer-events", "none");

				if (isSelectable && selectedSplits) {
					splitInteractionG
						.append("rect")
						.attr("x", x1)
						.attr("y", 0)
						.attr("width", x2 - x1)
						.attr("height", innerHeight)
						.attr("fill", popoverPosition?.ranges.some(([s, e]) => s === split[i] && e === split[i + 1]) || relationIds.some(([s, e]) => s === split[i] && e === split[i + 1]) ? (relationIds.length > 0 || popoverPosition?.type === "SingleRelation" || popoverPosition?.type === "GroupRelation" ? "#00800033" : "#1890ff33") : selectedSplits?.includes(split[i]) && selectedSplits?.includes(split[i + 1]) ? "#3331" : "transparent")
						.attr("cursor", "pointer")
						.attr("data-range", JSON.stringify([split[i], split[i + 1]]))
						.style("pointer-events", "all")
						.on("pointerdown", function (event) {
							if (!isRequesting) {
								handleSplitClick(event, [split[i], split[i + 1]]);
							}
						})
						.on("mousemove", handleMouseMove)
						.on("mouseup", handleMouseUp);
				}
			}

			if (resultsSplit && keyData.length > 2) {
				const resultsG = g.append("g").attr("class", "results-split-line");

				for (let i = 0; i < resultsSplit.segments.length; i++) {
					for (let j = 0; j < resultsSplit.segments[i].length; j++) {
						const x1 = x(timeStampData[resultsSplit.segments[i][j][0]]);
						const x2 = x(timeStampData[resultsSplit.segments[i][j][1]]);
						if (timeStampData[resultsSplit.segments[i][j][0]] > xScale[1] || timeStampData[resultsSplit.segments[i][j][1]] < xScale[0]) {
							continue;
						}
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
							.attr("stroke-opacity", defaultSplits.includes(resultsSplit.segments[i][j][0]) && defaultSplits.includes(resultsSplit.segments[i][j][1]) ? "1" : "0.7")
							.attr("stroke-width", defaultSplits.includes(resultsSplit.segments[i][j][0]) && defaultSplits.includes(resultsSplit.segments[i][j][1]) ? 4 : 2);
					}
				}
			}
		}

		const areaGenerator = d3
			.area<[number, number]>()
			.x((d) => x(d[0]))
			.y0(y(yMin))
			.y1((d) => y(d[1]));

		if (isFill) {
			g.append("path").datum(data).attr("d", areaGenerator).attr("fill", "#82C4FF99");
		}

		if (split && intentions && isSelectable && selectedSplits) {
			const intentionLinesG = svg.append("g").attr("class", "intention-lines").attr("transform", `translate(${computedMargin.left},0)`).attr("clip-path", `url(#clip-path-${id})`);
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

			intentions.single_relation_intentions.forEach((intention) => {
				const range = [
					[selectedSplits[intention.id1], selectedSplits[intention.id1 + 1]],
					[selectedSplits[intention.id2], selectedSplits[intention.id2 + 1]],
				] as [[number, number], [number, number]];
				let level = 0;
				while (true) {
					if (!lines[level]) {
						lines[level] = [];
					}
					if (lines[level].some((line) => hasOverlap(line.ranges, range))) {
						level++;
					} else {
						break;
					}
				}
				lines[level].push({
					type: "SingleRelation",
					ranges: range,
					choices: intention.relation_choices,
					level,
				});
			});

			intentions.group_relation_intentions.forEach((intention) => {
				const ranges: [number, number][] = [
					[selectedSplits[intention.group1[0]], selectedSplits[intention.group1[1] + 1]],
					[selectedSplits[intention.group2[0]], selectedSplits[intention.group2[1] + 1]],
				];
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
					type: "GroupRelation",
					ranges,
					choices: intention.relation_choices,
					level,
				});
			});

			Object.values(lines)
				.flat()
				.forEach((intention) => {
					const y = computedMargin.top - intention.level * 8;
					const isRelation = intention.type === "SingleRelation" || intention.type === "GroupRelation";
					const startX1 = x(timeStampData[intention.ranges[0][0]]);
					const endX1 = isRelation ? x(timeStampData[intention.ranges[0][1]]) : x(timeStampData[intention.ranges[intention.ranges.length - 1][1]]);

					const line = intentionLinesG.append("g").attr("class", "intention-line").style("cursor", "pointer");

					line.append("line")
						.attr("x1", startX1)
						.attr("x2", endX1)
						.attr("y1", y)
						.attr("y2", y)
						.attr("stroke", isRelation ? "#008000" : "#1890ff")
						.attr("stroke-width", 2);

					line.append("line")
						.attr("x1", startX1)
						.attr("x2", startX1)
						.attr("y1", y - 3)
						.attr("y2", y + 3)
						.attr("stroke", isRelation ? "#008000" : "#1890ff")
						.attr("stroke-width", 2);

					line.append("line")
						.attr("x1", endX1)
						.attr("x2", endX1)
						.attr("y1", y - 3)
						.attr("y2", y + 3)
						.attr("stroke", isRelation ? "#008000" : "#1890ff")
						.attr("stroke-width", 2);

					if (isRelation) {
						const startX2 = x(timeStampData[intention.ranges[1][0]]);
						const endX2 = x(timeStampData[intention.ranges[1][1]]);
						line.append("line")
							.attr("x1", startX2)
							.attr("x2", endX2)
							.attr("y1", y)
							.attr("y2", y)
							.attr("stroke", isRelation ? "#008000" : "#1890ff")
							.attr("stroke-width", 2);
						line.append("line")
							.attr("x1", startX2)
							.attr("x2", endX1)
							.attr("y1", y)
							.attr("y2", y)
							.attr("stroke", isRelation ? "#008000" : "#1890ff")
							.attr("stroke-width", 2)
							.attr("stroke-dasharray", "4, 4");
						line.append("line")
							.attr("x1", startX2)
							.attr("x2", startX2)
							.attr("y1", y - 3)
							.attr("y2", y + 3)
							.attr("stroke", isRelation ? "#008000" : "#1890ff")
							.attr("stroke-width", 2);

						line.append("line")
							.attr("x1", endX2)
							.attr("x2", endX2)
							.attr("y1", y - 3)
							.attr("y2", y + 3)
							.attr("stroke", isRelation ? "#008000" : "#1890ff")
							.attr("stroke-width", 2);
					}

					line.on("click", () => {
						if (popoverPosition) {
							setPopoverPosition(null);
							setSelectedChoices([]);
							setSelectedGroups([]);
							setSelectedRelations([]);
							setSelectedGroupRelations([]);
						}
						function splitRanges(ranges: [number, number][], selectedSplit: number[]) {
							return ranges.map(([start, end]) => {
								const splitPoints = [start, ...selectedSplit.filter((v) => v > start && v < end), end];
								const result = [];
								for (let i = 0; i < splitPoints.length - 1; i++) {
									result.push([splitPoints[i], splitPoints[i + 1]]);
								}
								return result;
							});
						}

						const groups = splitRanges(intention.ranges, selectedSplits) as [[number, number][], [number, number][]];

						setPopoverPosition({
							x: (startX1 + endX1) / 2 + (endX1 - startX1),
							y: y,
							type: intention.type,
							ranges: intention.ranges.length > 1 ? groups.flat(1) : intention.ranges,
							groups: intention.ranges.length > 1 ? groups : undefined,
							rectWidth: endX1 - startX1,
							rectHeight: 10,
						});

						if (intention.type === "SingleSegment") {
							setSelectedChoices(intention.choices as SingleChoice[]);
						} else if (intention.type === "SegmentGroup") {
							setSelectedGroups(intention.choices as GroupChoice[]);
						} else if (intention.type === "SingleRelation") {
							setSelectedRelations(intention.choices as SingleRelationChoice[]);
						} else if (intention.type === "GroupRelation") {
							setSelectedGroupRelations(intention.choices as GroupRelationChoice[]);
						}
					});
				});

			if (selectedSplits && selectedSplits.length > 0) {
				const buttonX = x(timeStampData[selectedSplits[selectedSplits.length - 1]]) + 10;

				const loadingDefs = svg.append("defs");
				loadingDefs
					.append("linearGradient")
					.attr("id", `loading-gradient-${id}`)
					.attr("gradientUnits", "userSpaceOnUse")
					.selectAll("stop")
					.data([
						{ offset: "0%", color: "#ffffff" },
						{ offset: "100%", color: "#1890ff" },
					])
					.enter()
					.append("stop")
					.attr("offset", (d) => d.offset)
					.attr("stop-color", (d) => d.color);

				const animateRotate = loadingDefs.append("animateTransform").attr("attributeName", "transform").attr("type", "rotate").attr("from", "0 12 12").attr("to", "360 12 12").attr("dur", "1s").attr("repeatCount", "indefinite");

				const submitButton = intentionLinesG
					.append("g")
					.attr("class", "submit-button")
					.attr("transform", `translate(${buttonX}, ${computedMargin.top})`)
					.style("cursor", isRequesting ? "not-allowed" : "pointer");

				submitButton
					.append("rect")
					.attr("width", isRequesting ? 84 : defaultSplits?.length ? 60 : 60)
					.attr("height", 24)
					.attr("rx", 4)
					.attr("fill", isRequesting ? "#1890ff66" : "#1890ff");

				const cancleButton = intentionLinesG
					.append("g")
					.attr("transform", `translate(${buttonX}, ${computedMargin.top + 32})`)
					.attr("class", "cancle-button")
					.style("cursor", isRequesting ? "not-allowed" : "pointer");

				cancleButton
					.append("rect")
					.attr("width", 60)
					.attr("height", 24)
					.attr("rx", 4)
					.attr("fill", isRequesting ? "#ff4d4f66" : "#ff4d4f");

				cancleButton.append("text").attr("x", 30).attr("y", 16).attr("text-anchor", "middle").attr("fill", "white").attr("font-size", "12px").text("Cancle");

				cancleButton.on("click", () => {
					if (isRequesting) return;
					onSplitSelect?.([]);
					onCancelSplit?.();
					setUserSplits([]);
				});

				if (isRequesting) {
					const loadingGroup = submitButton.append("g").attr("transform", "translate(15, 12)");

					loadingGroup
						.append("circle")
						.attr("r", 4)
						.attr("fill", "none")
						.attr("stroke", `url(#loading-gradient-${id})`)
						.attr("stroke-width", 2)
						.attr("stroke-dasharray", "12.5 12.5")
						.attr("transform-origin", "-12px -12px")
						.call((g) => g.node()?.appendChild(animateRotate.node()!.cloneNode()));

					submitButton.append("text").attr("x", 30).attr("y", 16).attr("text-anchor", "start").attr("fill", "white").attr("font-size", "12px").text("Loading");
				} else {
					submitButton
						.append("text")
						.attr("x", 30)
						.attr("y", 16)
						.attr("text-anchor", "middle")
						.attr("fill", "white")
						.attr("font-size", "12px")
						.text(defaultSplits?.length ? "Refine" : "Author");
				}

				submitButton
					.on("click", () => {
						if (!isRequesting && onSubmitIntentions) {
							onSubmitIntentions(intentions);
						}
					})
					.on("mouseenter", function () {
						if (!isRequesting) {
							d3.select(this).select("rect").transition().duration(200).attr("fill", "#40a9ff");
						}
					})
					.on("mouseleave", function () {
						if (!isRequesting) {
							d3.select(this).select("rect").transition().duration(200).attr("fill", "#1890ff");
						}
					});
			}
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

			const brushG = svg.append("g").attr("transform", `translate(${computedMargin.left},${computedMargin.top})`).attr("class", "brush").call(brush);

			function getFilteredIndices(selection: [number | Date, number | Date]) {
				const [minX, maxX] = selection;
				const minValue = minX instanceof Date ? minX.getTime() : minX;
				const maxValue = maxX instanceof Date ? maxX.getTime() : maxX;
				return data
					.map((d, i) => ({ index: i, value: d }))
					.filter((d) => d.value[0] >= minValue && d.value[0] <= maxValue)
					.map((d) => d.index);
			}

			function highlightBrush(selection: [number | Date, number | Date]) {
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
				d3.selectAll(`.tooltip-${id}`).remove();
			};
		}
		return () => {
			svg.selectAll("*").remove();
			d3.selectAll(`.tooltip-${id}`).remove();
		};
	}, [xData, yData, ratio, title, isXAxisVisible, isYAxisVisible, isXAxisTextVisible, isYAxisTextVisible, isBrush, onBrush, isFill, range, height, split, isSplitMask, brushPosition, isExpand, isShowRange, id, onBrushEnd, isActive, xAxisColor, yAxisColor, lineColor, textColor, xAxisFormatter, brushColor, resultsSplit, handleSplitClick, selectedSplits, popoverPosition, handleMouseMove, handleMouseUp, intentions, defaultSplits, onSubmitIntentions, relationIds, computedMargin, isHoverable, timeStampData, isTime, isRequesting, isSelectable, onSplitSelect, onCancelSplit]);

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

	const renderPopover = useCallback(() => {
		if (!popoverPosition) return null;
		let isExisting = false;
		switch (popoverPosition.type) {
			case "SingleSegment":
				isExisting = intentions.single_segment_intentions.some((intention) => deepEqual([[selectedSplits?.[intention.id], selectedSplits?.[intention.id + 1]]], popoverPosition.ranges));
				return (
					<IntentionPopover
						type={popoverPosition.type}
						choices={Object.values(SingleChoice)}
						selected={selectedChoices}
						onChange={handleChoicesChange}
						onCancel={handlePopoverClose}
						onConfirm={handleConfirm}
						onDelete={isExisting ? handleDelete : undefined}
						isExisting={isExisting}
					/>
				);
			case "SegmentGroup":
				isExisting = intentions.segment_group_intentions.some((intention) => popoverPosition.ranges[0][0] === selectedSplits?.[intention.ids[0]] && popoverPosition.ranges[popoverPosition.ranges.length - 1][0] === selectedSplits?.[intention.ids[1]]);
				return (
					<IntentionPopover
						type={popoverPosition.type}
						choices={Object.values(GroupChoice)}
						selected={selectedGroups}
						onChange={handleGroupChoicesChange}
						onCancel={handlePopoverClose}
						onConfirm={handleConfirm}
						onDelete={isExisting ? handleDelete : undefined}
						isExisting={isExisting}
					/>
				);
			case "SingleRelation":
				isExisting = intentions.single_relation_intentions.some((intention) => popoverPosition.ranges[0][0] === selectedSplits?.[intention.id1] && popoverPosition.ranges[popoverPosition.ranges.length - 1][0] === selectedSplits[intention.id2]);
				return (
					<IntentionPopover
						type={popoverPosition.type}
						choices={Object.values(SingleRelationChoice)}
						selected={selectedRelations}
						onChange={handleRelationsChange}
						onCancel={handlePopoverClose}
						onConfirm={handleConfirm}
						onDelete={isExisting ? handleDelete : undefined}
						isExisting={isExisting}
					/>
				);
			case "GroupRelation":
				isExisting = intentions.group_relation_intentions.some((intention) => popoverPosition.groups?.[0][0][0] === selectedSplits?.[intention.group1[0]] && popoverPosition.groups?.[0][popoverPosition.groups[0].length - 1][0] === selectedSplits?.[intention.group1[1]] && popoverPosition.groups?.[1][0][0] === selectedSplits?.[intention.group2[0]] && popoverPosition.groups?.[1][popoverPosition.groups[1].length - 1][0] === selectedSplits?.[intention.group2[1]]);
				return (
					<IntentionPopover
						type={popoverPosition.type}
						choices={Object.values(GroupRelationChoice)}
						selected={selectedGroupRelations}
						onChange={handleGroupRelationsChange}
						onCancel={handlePopoverClose}
						onConfirm={handleConfirm}
						onDelete={isExisting ? handleDelete : undefined}
						isExisting={isExisting}
					/>
				);
		}
	}, [popoverPosition, selectedChoices, selectedGroups, handleChoicesChange, handleGroupChoicesChange, handlePopoverClose, handleConfirm, handleDelete, intentions, selectedSplits, selectedRelations, selectedGroupRelations, handleRelationsChange, handleGroupRelationsChange]);

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
					content={renderPopover()}
					trigger="click"
				>
					<div style={{ width: "0", height: "0", position: "absolute", left: `${popoverPosition.x}px`, top: `${popoverPosition.y}px` }}></div>
				</Popover>
			)}
		</>
	);
}

export default memo(LineChart, (prevProps, nextProps) => {
	return Object.keys(prevProps).every((key) => {
		const k = key as keyof LineChartProps;
		if (k === "children") return false;
		return deepEqual(prevProps[k], nextProps[k]);
	});
});
