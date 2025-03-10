import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import "./index.css";
import SelectChart from "./SelectChart";
import { Cascader, Empty } from "antd";
import { Segment, Unit } from "../../../types/QuerySpec";
import LineChart from "../../LineChart";
import { setCurrent, setLevel, setSource } from "../../../app/slice/approximation";
import { setBrushPosition, setDefaultSplits, setRange, setSelectedSplits } from "../../../app/slice/selectSlice";
import { classnames } from "../../../utils/classname";
import { deepEqual } from "../../../utils/deepclone";
import AddIcon from "../../../icons/Add";
import { SortAscendingOutlined, SortDescendingOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { formatTime } from "../../../utils/time";
import { getColorFromMap } from "../../../utils/color";

export interface DataType {
	date: Date;
	value: number;
}

export interface ApproximationLevelResult {
	level: number;
	segments: Segment[];
	index: number;
	source: string;
}

export type ApproximationLevelResults = ApproximationLevelResult[];

interface SegmentAttribute {
	key: string;
	label: string;
	format: (value: number) => string;
	getValue: (segments: Segment[], index?: number, result?: ApproximationLevelResult) => number;
	scope: "global" | "segment";
}

interface AttributeStats {
	[key: string]: {
		map: Record<string, number>;
		max: number;
		min: number;
		array: number[];
	};
}

interface AttributeOption extends SegmentAttribute {
	id: string;
	segmentIndex?: number;
	selected?: boolean;
	permanent?: boolean;
}

export default function ResultsContent() {
	const data = useAppSelector((state) => state.dataset.dataset?.data) ?? {};
	const x = (useAppSelector((state) => state.dataset.dataset?.data[state.dataset.dataset?.timeStampColumn ?? ""]) as string[]) || [];
	const query = useAppSelector((state) => state.states.query);
	const colorMap = useAppSelector((state) => state.states.colorMap);
	const queryResults = useAppSelector((state) => state.approximation.queryResults);
	const memoQueryResults = useMemo(() => queryResults || {}, [queryResults]);
	const queryLevelResults = useMemo(
		() =>
			Object.entries(memoQueryResults)
				.map(([source, value]: [string, Record<number, Segment[][]>]) => {
					return Object.entries(value)
						.map(([key, segments]) => segments.map((segment) => ({ level: Number(key), segments: segment, source })))
						.flat();
				})
				.flat(),
		[memoQueryResults]
	);
	const results = useAppSelector((state) => state.approximation.results);
	const filteredResults: ApproximationLevelResults = useMemo(() => queryLevelResults.map((item, index) => ({ ...item, index })), [queryLevelResults]);
	const dispatch = useAppDispatch();
	const current = useAppSelector((state) => state.approximation.current);
	const defaultSplits = useAppSelector((state) => state.select.defaultSplits);
	const timeStampColumnType = useAppSelector((state) => state.dataset.dataset?.timeStampColumnType);
	const timeStampColumnUnit = useMemo(() => (timeStampColumnType === "day" ? 86400 : timeStampColumnType === "hour" ? 3600 : timeStampColumnType === "minute" ? 60 : 1), [timeStampColumnType]);
	const timeStampColumnUnitText = useMemo(() => (timeStampColumnType === "number" ? "" : timeStampColumnType), [timeStampColumnType]);

	const attributeOptions: AttributeOption[] = useMemo(
		() => [
			{
				id: "duration",
				key: "duration",
				label: "Duration",
				scope: "global",
				permanent: true,
				format: (value) => `${value} ${timeStampColumnUnitText}`,
				getValue: (segments) => ((segments.at(-1)?.end_time ?? 0) - (segments.at(0)?.start_time ?? 0)) / timeStampColumnUnit,
			},
			{
				id: "level",
				key: "level",
				label: "Approximation Level",
				scope: "global",
				permanent: true,
				format: (value) => value.toString(),
				getValue: (_1, _2, result?: ApproximationLevelResult) => result?.level ?? 0,
			},
			{
				id: "start_time",
				key: "start_time",
				label: "Start Time",
				scope: "global",
				format: (value) => (timeStampColumnType === "number" ? value.toString() : formatTime(new Date(value * 1000), timeStampColumnType as Unit)),
				getValue: (segments) => segments[0]?.start_time ?? 0,
			},
			{
				id: "end_time",
				key: "end_time",
				label: "End Time",
				scope: "global",
				format: (value) => (timeStampColumnType === "number" ? value.toString() : formatTime(new Date(value * 1000), timeStampColumnType as Unit)),
				getValue: (segments) => segments[segments.length - 1]?.end_time ?? 0,
			},
			{
				id: "min_value",
				key: "min_value",
				label: "Min Value",
				scope: "global",
				format: (value) => value.toFixed(2),
				getValue: (segments) => Math.min(...segments.map((seg) => seg.min_value ?? 0)),
			},
			{
				id: "max_value",
				key: "max_value",
				label: "Max Value",
				scope: "global",
				format: (value) => value.toFixed(2),
				getValue: (segments) => Math.max(...segments.map((seg) => seg.max_value ?? 0)),
			},
		],
		[timeStampColumnUnit, timeStampColumnUnitText, timeStampColumnType]
	);

	const getSegmentAttributeOptions = useCallback(
		(segmentIndex: number): AttributeOption[] => [
			{
				id: `segment_${segmentIndex}_r2`,
				key: "r2",
				label: `R²`,
				scope: "segment",
				segmentIndex,
				format: (value) => value.toFixed(3),
				getValue: (segments) => segments[segmentIndex]?.r2 ?? 0,
			},
			{
				id: `segment_${segmentIndex}_slope`,
				key: "slope",
				label: `Slope`,
				scope: "segment",
				segmentIndex,
				format: (value) => value.toFixed(2),
				getValue: (segments) => (segments[segmentIndex]?.slope ?? 0) * timeStampColumnUnit,
			},
			{
				id: `segment_${segmentIndex}_relative_slope`,
				key: "relative_slope",
				label: `Relative Slope`,
				scope: "segment",
				segmentIndex,
				format: (value) => value.toFixed(2) + "%",
				getValue: (segments) => segments[segmentIndex]?.relative_slope ?? 0,
			},
			{
				id: `segment_${segmentIndex}_duration`,
				key: "duration",
				label: `Duration`,
				scope: "segment",
				segmentIndex,
				format: (value) => `${value} ${timeStampColumnUnitText}`,
				getValue: (segments) => {
					const segment = segments[segmentIndex];
					return (segment.duration ?? 0) / timeStampColumnUnit;
				},
			},
		],
		[timeStampColumnUnit, timeStampColumnUnitText]
	);

	const [selectedAttributes, setSelectedAttributes] = useState<AttributeOption[]>([]);

	const handleAttributeSelect = useCallback((attribute: AttributeOption[]) => {
		setSelectedAttributes(attribute);
	}, []);

	const [attributeScales, setAttributeScales] = useState<Record<string, [number, number]>>({});

	const attributeStats: AttributeStats = useMemo(() => {
		const stats: AttributeStats = {};
		selectedAttributes.forEach((attr) => {
			const values = new Map<number, number>();
			const array: number[] = [];
			filteredResults.forEach((result) => {
				const value = attr.getValue(result.segments, attr.segmentIndex, result);
				const roundedValue = Math.round(value * 100) / 100;
				values.set(roundedValue, (values.get(roundedValue) || 0) + 1);
				array.push(value);
			});
			stats[attr.id] = {
				map: Object.fromEntries([...values.entries()]),
				max: Math.max(...array),
				min: Math.min(...array),
				array,
			};
		});
		return stats;
	}, [filteredResults, selectedAttributes]);

	const handleAttributeScaleChange = useCallback((attr: string, [min, max]: [number, number]) => {
		setAttributeScales((prev) => ({
			...prev,
			[attr]: [min, max],
		}));
	}, []);

	useEffect(() => {
		setAttributeScales({});
	}, [queryLevelResults]);

	useEffect(() => {
		const newAttributeScales: Record<string, [number, number]> = {};
		setAttributeScales((prev) => {
			for (const attr of selectedAttributes) {
				if (prev[attr.id]) {
					newAttributeScales[attr.id] = prev[attr.id];
				}
			}
			return newAttributeScales;
		});
	}, [selectedAttributes]);

	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: "asc" | "desc" | null;
	}>({
		key: "",
		direction: null,
	});

	const handleSort = useCallback((attrId: string) => {
		setSortConfig((prevConfig) => ({
			key: attrId,
			direction: prevConfig.key === attrId && prevConfig.direction === "asc" ? "desc" : prevConfig.key === attrId && prevConfig.direction === "desc" ? null : "asc",
		}));
	}, []);

	const permanentAttributes = useMemo(() => {
		return attributeOptions.filter((attr) => attr.permanent);
	}, [attributeOptions]);

	const handleCascaderChange = useCallback(
		(value: string[][]) => {
			if (!value?.length) {
				handleAttributeSelect(permanentAttributes);
				return;
			}
			const newSelectedAttributes = value
				.map((item) => {
					const [scope, attr] = item;
					if (scope === "global") {
						return attr ? attributeOptions.filter((option) => option.id === attr) : attributeOptions;
					} else {
						const segmentIndex = parseInt(scope.split("_")[1]);
						const options = getSegmentAttributeOptions(segmentIndex);
						return attr ? options.filter((option) => option.id === attr) : options;
					}
				})
				.flat();

			const otherAttrs = newSelectedAttributes.filter((attr) => !attr.permanent);
			handleAttributeSelect([...permanentAttributes, ...otherAttrs]);
		},
		[attributeOptions, handleAttributeSelect, getSegmentAttributeOptions, permanentAttributes]
	);

	const getCascaderOptions = useCallback(
		(length: number) => {
			const globalOptions = {
				value: "global",
				label: "Global",
				children: attributeOptions
					.filter((attr) => !attr.permanent)
					.map((attr) => ({
						value: attr.id,
						label: attr.label,
					})),
			};

			const segmentOptions = Array.from({ length }, (_, index) => ({
				value: `segment_${index}`,
				label: `Segment ${index + 1}`,
				children: getSegmentAttributeOptions(index).map((attr) => ({
					value: attr.id,
					label: attr.label,
				})),
			}));

			return [globalOptions, ...segmentOptions];
		},
		[attributeOptions, getSegmentAttributeOptions]
	);

	const options = useMemo(() => {
		const length = queryLevelResults?.[0]?.segments.length ?? 0;
		return getCascaderOptions(length);
	}, [queryLevelResults, getCascaderOptions]);

	const groupedAttributes = useMemo(() => {
		interface AttributeGroups {
			global: AttributeOption[];
			segments: AttributeOption[][];
		}

		const groups: AttributeGroups = {
			global: [],
			segments: Array(queryLevelResults?.[0]?.segments.length || 0)
				.fill(null)
				.map(() => []),
		};

		selectedAttributes.forEach((attr) => {
			if (attr.scope === "global") {
				groups.global.push(attr);
			} else if (attr.segmentIndex !== undefined) {
				groups.segments[attr.segmentIndex]?.push(attr);
			}
		});
		return groups;
	}, [selectedAttributes, queryLevelResults]);

	const [count, setCount] = useState(10);
	const [isLoading, setIsLoading] = useState(false);

	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const element = e.currentTarget;
			if (element.scrollHeight - element.scrollTop <= element.clientHeight + 100 && !isLoading && count < filteredResults.length) {
				setIsLoading(true);
				setTimeout(() => {
					setCount((prev) => Math.min(prev + 10, filteredResults.length));
					setIsLoading(false);
				}, 100);
			}
		},
		[count, filteredResults.length, isLoading]
	);

	const sortedResults = useMemo(() => {
		let results = filteredResults.filter((result) => {
			const attrCondition = selectedAttributes.every((attr) => {
				if (!attributeScales[attr.id]) {
					return true;
				}
				const value = attr.getValue(result.segments, attr.segmentIndex, result);
				const [min, max] = attributeScales[attr.id];
				return value >= min && value <= max;
			});

			return attrCondition;
		});

		if (sortConfig.key && sortConfig.direction) {
			const attr = [...groupedAttributes.global, ...groupedAttributes.segments.flat()].find((attr) => attr.id === sortConfig.key);

			if (attr) {
				results = results.sort((a, b) => {
					const valueA = attr.getValue(a.segments, attr.segmentIndex, a);
					const valueB = attr.getValue(b.segments, attr.segmentIndex, b);
					return sortConfig.direction === "asc" ? valueA - valueB : valueB - valueA;
				});
			}
		}

		return results;
	}, [filteredResults, selectedAttributes, attributeScales, sortConfig, groupedAttributes]);

	const resultList = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (sortConfig.key && sortConfig.direction !== null) {
			setCount(20);
			if (resultList.current) {
				resultList.current.scrollTop = 0;
			}
		}
	}, [sortConfig]);

	useEffect(() => {
		if (!queryResults) {
			handleAttributeSelect(permanentAttributes);
		}
	}, [permanentAttributes, handleAttributeSelect, queryResults]);

	const cascaderValue = useMemo(() => {
		return selectedAttributes
			.filter(attr => !attr.permanent)
			.map(attr => {
				if (attr.scope === 'global') {
					return ['global', attr.id];
				} else if (attr.segmentIndex !== undefined) {
					return [`segment_${attr.segmentIndex}`, attr.id];
				}
				return [];
			});
	}, [selectedAttributes]);

	return (
		<>
			<div className="results-content">
				<div className="result-header">
					<div className="header-column">
						<div className="header-column-item">Source</div>
					</div>

					<div className="header-column">
						<div className="header-column-item glyph-column">Graph</div>
					</div>

					{groupedAttributes.global.length > 0 && (
						<div className="header-column">
							<div className="header-column-group">
								<div className="header-column-group-title">
									<span>Global</span>
								</div>
								<div className="header-column-group-content">
									{groupedAttributes.global.map((attr) => (
										<div
											className="header-column-group-item pointer"
											key={attr.id}
											onClick={() => handleSort(attr.id)}
										>
											{filteredResults.length > 0 ? (
												<>
													<div className="header-column-group-item-title">
														<span className={classnames("header-column-group-item-title-icon")}>{sortConfig.key !== attr.id || sortConfig.direction === null ? <UnorderedListOutlined /> : sortConfig.direction === "asc" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}</span>
														<span className="header-column-group-item-title-text">{attr.label}</span>
													</div>
													<SelectChart
														data={Object.entries(attributeStats[attr.id].map)
															.sort(([a], [b]) => Number(a) - Number(b))
															.map(([x, y]) => ({ x: Number(x), y }))}
														onBrush={(min, max) => handleAttributeScaleChange(attr.id, [min, max])}
													/>
												</>
											) : (
												attr.label
											)}
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{groupedAttributes.segments.map(
						(segmentAttrs, index) =>
							segmentAttrs.length > 0 && (
								<div
									className="header-column"
									key={`segment-${index}`}
								>
									<div className="header-column-group">
										<div className="header-column-group-title">Segment {index + 1}</div>
										<div className="header-column-group-content">
											{segmentAttrs.map((attr) => (
												<div
													className="header-column-group-item pointer"
													key={attr.id}
													onClick={() => handleSort(attr.id)}
												>
													<div className="header-column-group-item-title">
														<span className={classnames("header-column-group-item-title-icon")}>{sortConfig.key !== attr.id || sortConfig.direction === null ? <UnorderedListOutlined /> : sortConfig.direction === "asc" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}</span>
														<span className="header-column-group-item-title-text">{attr.label}</span>
													</div>
													<div className="header-column-group-item-value">
														<SelectChart
															data={Object.entries(attributeStats[attr.id].map)
																.sort(([a], [b]) => Number(a) - Number(b))
																.map(([x, y]) => ({ x: Number(x), y }))}
															onBrush={(min, max) => handleAttributeScaleChange(attr.id, [min, max])}
														/>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							)
					)}

					<div className="header-column">
						<Cascader
							options={options}
							onChange={handleCascaderChange}
							multiple
							value={cascaderValue}
						>
							<div className="header-column-item add-icon">
								<AddIcon />
							</div>
						</Cascader>
					</div>
				</div>

				<div
					className="result-item-list"
					onScroll={handleScroll}
					ref={resultList}
				>
					{sortedResults.length === 0 ? (
						<Empty />
					) : (
						sortedResults.slice(0, count).map((result) => {
							const { level, index, segments, source } = result;
							const start = segments.at(0)?.start_idx || 0;
							const end = segments.at(-1)?.end_idx || 0;
							const splits = segments.map((segment) => [segment.start_idx, segment.end_idx]).flat();

							return (
								<div
									className={classnames("result-item", deepEqual(current, result) && current?.segments.at(0)?.start_idx === defaultSplits[0] && current.segments.at(-1)?.end_idx === defaultSplits.at(-1) ? "active" : "")}
									key={`${index}-${start}-${end}-${level}-${source}`}
									onClick={() => {
										const seg = results?.find((result) => result.source === source)?.approximation_segments_list.find((list) => list.approximation_level === level)?.segments || [];
										const r1 = seg.findIndex((item) => deepEqual(item, segments.at(0)));
										const r2 = seg.findIndex((item) => deepEqual(item, segments.at(-1)));
										const r = [Math.max(0, r1 - 4), Math.min(seg.length - 1, r2 + 4)];
										const range = [seg[r[0]].start_idx, seg[r[1]].end_idx] as [number, number];
										dispatch(setSource(source));
										dispatch(setBrushPosition(range));
										dispatch(setRange(range));
										dispatch(setSelectedSplits(splits));
										dispatch(setDefaultSplits(splits));
										dispatch(setLevel(level));
										dispatch(setCurrent(result));
									}}
								>
									<div className="item-column text">{source}</div>

									<div className="item-column data-glyph">
										<LineChart
											xData={x}
											range={[start, end]}
											yData={(data?.[source] as number[]) || []}
											height={40}
											split={splits}
											isShowRange={false}
											isExpand={false}
											resultsSplit={{ segments: [segments.map((segment) => [segment.start_idx, segment.end_idx])], colors: query?.trends.map((trend) => getColorFromMap(colorMap, trend.category.text_source_id)) || [] }}
										/>
									</div>

									{groupedAttributes.global.length > 0 &&
										groupedAttributes.global.map((attr) => (
											<div
												className="item-column data-value"
												key={`global-${attr.id}`}
											>
												<div
													className="data-value__inner"
													style={{
														width: `${((attributeStats[attr.id].array[index] - attributeStats[attr.id].min) / (attributeStats[attr.id].max - attributeStats[attr.id].min)) * 100}%`,
													}}
												>
													{attr.format(attributeStats[attr.id].array[index])}
												</div>
											</div>
										))}

									{groupedAttributes.segments.map(
										(segmentAttrs, segIndex) =>
											segmentAttrs.length > 0 &&
											segmentAttrs.map((attr) => (
												<div
													className="item-column data-value"
													key={`segment-${segIndex}-${attr.id}`}
												>
													<div
														className="data-value__inner"
														style={{
															width: `${((attributeStats[attr.id].array[index] - attributeStats[attr.id].min) / (attributeStats[attr.id].max - attributeStats[attr.id].min)) * 100}%`,
														}}
													>
														{attr.format(attributeStats[attr.id].array[index])}
													</div>
												</div>
											))
									)}
								</div>
							);
						})
					)}
				</div>
			</div>
		</>
	);
}
