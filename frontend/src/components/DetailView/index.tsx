import { Empty } from "antd";
import Panel from "../Panel";
import "./index.css";
import LineChart from "../LineChart";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setBrushPosition, setDefaultSplits, setRange, setSelectedSplits, setSelectPosition } from "../../app/slice/selectSlice";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getModifyPrompt } from "../../api";
import { resetOriginalQuery, setColorMap, setNLQuery, setQuery } from "../../app/slice/stateSlice";
import { getColorFromMap } from "../../utils/color";
import LevelController from "../LevelController";
import { deepClone } from "../../utils/deepclone";
import { setLevel } from "../../app/slice/approximation";
import { getSplit } from "../../utils/split";
import { Source } from "../../types/QuerySpec";

export default function DetailView() {
	const data = useAppSelector((state) => state.dataset.dataset?.data) || {};
	const timeStampColumnType = useAppSelector((state) => state.dataset.dataset?.timeStampColumnType);
	const dispatch = useAppDispatch();
	const range = useAppSelector((state) => state.select.range);
	const timeCol = Object.keys(data).at(0);
	const timeValues = timeCol ? data[timeCol] : [];
	const source = useAppSelector((state) => state.approximation.source) || "";
	const dataValues = source in data ? (data[source] as number[]) : [];
	const level = useAppSelector((state) => state.approximation.level);
	const results = useAppSelector((state) => state.approximation.results);
	const queryResults = useAppSelector((state) => state.approximation.queryResults);
	const memoQueryResults = useMemo(() => deepClone(queryResults ?? {}), [queryResults]);
	const segments = useMemo(() => results?.find((result) => result.source === source)?.approximation_segments_list.find((item) => item.approximation_level === level)?.segments || [], [results, source, level]);
	const split = useMemo(() => getSplit(segments), [segments]);
	const query = useAppSelector((state) => state.states.query);
	const filteredTargets = query?.targets.filter((target) => target.text_source_id && target.text_source_id !== -1) || [];
	const colorMap = useAppSelector((state) => state.states.colorMap);
	const brushPosition = useAppSelector((state) => state.select.brushPosition);
	const isTarget = !filteredTargets.length || filteredTargets.some((target) => target.target === source);
	const resultsSplit = useMemo(() => {
		return { colors: query?.trends.map((trend) => getColorFromMap(colorMap, trend.category.text_source_id)) || [], segments: (isTarget && memoQueryResults[source]?.[level]?.map((segments) => segments.map((segment) => [segment.start_idx, segment.end_idx] as [number, number]))) || [] };
	}, [query, colorMap, level, memoQueryResults, isTarget, source]);
	const handleBrush = useCallback(
		(start: number, end: number) => {
			dispatch(setRange([start, end]));
		},
		[dispatch]
	);
	const handleBrushEnd = useCallback(
		(start: number, end: number) => {
			dispatch(setBrushPosition([start, end]));
		},
		[dispatch]
	);
	const handleBrushSelectEnd = useCallback(
		(start: number, end: number) => {
			const selectSegments = segments.filter((item) => {
				const { start_idx, end_idx } = item;
				const itemSpan = end_idx - start_idx;
				const overlap = Math.max(0, Math.min(end, end_idx) - Math.max(start, start_idx));
				return overlap > itemSpan / 2;
			});
			if (selectSegments.length > 0) {
				dispatch(setSelectPosition([selectSegments[0].start_idx, selectSegments[selectSegments.length - 1].end_idx]));
			} else {
				dispatch(setSelectPosition([0, 0]));
			}
		},
		[dispatch, segments]
	);

	const handleScroll = useCallback(
		(val: number, position: number) => {
			const delta = val;
			const leftRatio = 0.5 + (position * 0.5);
			const rightRatio = 1 - leftRatio;
			const range1 = Math.max(0, Math.round(range[0] - (delta * leftRatio)));
			const range2 = Math.max(0, Math.min(Math.round(range[1] + (delta * rightRatio)), timeValues.length - 1));

			if (Math.abs(range1 - range2) < 2) return;
			if (range1 > range2) {
				handleBrush(range2, range1);
				handleBrushEnd(range2, range1);
			} else {
				handleBrush(range1, range2);
				handleBrushEnd(range1, range2);
			}
		},
		[timeValues.length, handleBrush, handleBrushEnd, range]
	);

	const defaultSplits = useAppSelector((state) => state.select.defaultSplits);
	const selectedSplits = useAppSelector((state) => state.select.selectedSplits);

	useEffect(() => {
		if (!defaultSplits.length && !Object.keys(memoQueryResults).length) {
			dispatch(resetOriginalQuery());
		}
	}, [dispatch, selectedSplits, defaultSplits, memoQueryResults]);

	const handleSplitSelect = useCallback(
		(splits: number[]) => {
			dispatch(setSelectedSplits(splits));
		},
		[dispatch]
	);
	const handleCancelSplit = useCallback(() => {
		dispatch(setDefaultSplits([]));
	}, [dispatch]);

	const current = results?.find((result) => result.source === source);

	const originalQuery = useAppSelector((state) => state.states.originalQuery);
	const [isRequesting, setIsRequesting] = useState(false);

	return (
		<Panel
			className="main-view"
			icon={<div>D</div>}
			title="Detail View"
			right={
				<LevelController
					level={level}
					disabled={!current}
					maxLevel={current?.max_approximation_level ?? 0}
					onChange={(level) => dispatch(setLevel(level))}
				/>
			}
		>
			{timeCol && source ? (
				<>
					<div className="bg detail">
						<LineChart
							isShowRange={false}
							xData={timeValues as string[]}
							xDataType={timeStampColumnType}
							yData={dataValues}
							resultsSplit={resultsSplit}
							isXAxisVisible={true}
							isYAxisVisible={true}
							isHoverable
							range={range}
							height={"100%"}
							split={split}
							isSplitMask={true}
							onScroll={handleScroll}
							title={source}
							isXAxisTextVisible
							isYAxisTextVisible
							onContextMenu={() => handleBrushSelectEnd(0, 0)}
							selectedSplits={isTarget ? selectedSplits : undefined}
							defaultSplits={isTarget ? defaultSplits : undefined}
							onSplitSelect={isTarget ? handleSplitSelect : undefined}
							isRequesting={isRequesting}
							isSelectable={isTarget}
							onCancelSplit={handleCancelSplit}
							onSubmitIntentions={(intentions) => {
								setIsRequesting(true);
								getModifyPrompt(
									originalQuery,
									segments
										.filter((item) => {
											return item.start_idx >= selectedSplits[0] && item.end_idx <= selectedSplits[selectedSplits.length - 1];
										})
										.map((segment) => ({ ...segment, source: segment.start_idx >= defaultSplits[0] && segment.end_idx <= defaultSplits[defaultSplits.length - 1] ? Source.RESULT : Source.USER })),
									intentions.segment_group_intentions.map((intention) => [intention.ids[0], intention.ids[1]]),
									intentions
								)
									.then((results) => {
										dispatch(setNLQuery(results.original_text));
										dispatch(setQuery(results));
										dispatch(setColorMap(results));
									})
									.catch(() => {})
									.finally(() => {
										setIsRequesting(false);
									});
							}}
						></LineChart>
					</div>
					<div className="bg overview">
						<LineChart
							xData={timeValues as string[]}
							yData={dataValues}
							isBrush={true}
							onBrush={handleBrush}
							height={"100%"}
							split={split}
							brushPosition={brushPosition}
							isXAxisVisible
							onBrushEnd={handleBrushEnd}
							isXAxisTextVisible
							xDataType={timeStampColumnType}
						></LineChart>
					</div>
				</>
			) : (
				<Empty />
			)}
		</Panel>
	);
}
