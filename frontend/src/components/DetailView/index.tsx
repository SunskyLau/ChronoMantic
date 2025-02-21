import { Empty } from "antd";
import Panel from "../Panel";
import "./index.css";
import LineChart from "../LineChart";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setBrushPosition, setRange, setSelectedSplits, setSelectPosition } from "../../app/slice/selectSlice";
import { useCallback, useMemo } from "react";
import { getModifyPrompt } from "../../api";
import { setColorMap, setNLQuery, setQuery } from "../../app/slice/stateSlice";
import { getColorFromMap } from "../../utils/color";
import LevelController from "../LevelController";
import { deepClone } from "../../utils/deepclone";
import { setLevel } from "../../app/slice/approximation";
import { getSplit } from "../../utils/split";

export default function DetailView() {
	const data = useAppSelector((state) => state.dataset.dataset?.data) || {};
	const dispatch = useAppDispatch();
	const range = useAppSelector((state) => state.select.range);
	const timeCol = Object.keys(data).at(0);
	const timeValues = timeCol ? data[timeCol] : [];
	const valueCol = useAppSelector((state) => state.approximation.source);
	const level = useAppSelector((state) => state.approximation.level);
	const results = useAppSelector((state) => state.approximation.results);
	const queryResults = useAppSelector((state) => state.approximation.queryResults);
	const memoQueryResults = useMemo(() => deepClone(queryResults ?? {}), [queryResults]);
	const current = useMemo(() => results?.find((result) => result.source === valueCol)?.approximation_segments_list.find((item) => item.approximation_level === level), [level, results, valueCol]);
	const segments = useMemo(() => current?.segments || [], [current]);
	const split = useMemo(() => getSplit(segments), [segments]);
	const query = useAppSelector((state) => state.states.query);
	const colorMap = useAppSelector((state) => state.states.colorMap);
	const brushPosition = useAppSelector((state) => state.select.brushPosition);
	const resultsSplit = useMemo(() => {
		return { colors: query?.trends.map((trend) => getColorFromMap(colorMap, trend.category.text_source_id)) || [], segments: (query?.target.target === valueCol && memoQueryResults[level]?.map((segments) => segments.map((segment) => [segment.start_idx, segment.end_idx] as [number, number]))) || [] }
	}, [query, colorMap, valueCol, level, memoQueryResults])
	const handleBrush = useCallback((start: number, end: number) => {
		dispatch(setRange([start, end]));
	}, [dispatch]);
	const handleBrushEnd = useCallback((start: number, end: number) => {
		dispatch(setBrushPosition([start, end]));
	}, [dispatch]);
	const handleBrushSelectEnd = useCallback((start: number, end: number) => {
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
	}, [dispatch, segments]);

	const handleScroll = useCallback((val: number) => {
		const delta = val;
		const range1 = Math.max(0, range[0] - delta);
		const range2 = Math.max(0, Math.min(range[1] + delta, timeValues.length - 1));
		if (Math.abs(range1 - range2) < 2) return;
		if (range1 > range2) {
			handleBrush(range2, range1);
			handleBrushEnd(range2, range1);
		} else {
			handleBrush(range1, range2);
			handleBrushEnd(range1, range2);
		}
	}, [timeValues.length, handleBrush, handleBrushEnd, range]);

	const defaultSplits = useAppSelector((state) => state.select.defaultSplits);
	const selectedSplits = useAppSelector((state) => state.select.selectedSplits);
	const handleSplitSelect = useCallback((splits: number[]) => {
		dispatch(setSelectedSplits(splits));
	}, [dispatch]);

	const originalQuery = useAppSelector((state) => state.states.originalQuery);

	return (
		<Panel
			className="main-view"
			icon={<div>D</div>}
			title="Main View"
			right={<LevelController level={level} onChange={(level)=>dispatch(setLevel(level))} />}
		>
			{timeCol && valueCol ? (
				<>
					<div className="bg detail">
						<LineChart
							isShowRange={false}
							xData={timeValues as string[]}
							yData={data[valueCol] as number[]}
							resultsSplit={resultsSplit}
							isXAxisVisible={true}
							isYAxisVisible={true}
							range={range}
							height={"100%"}
							split={split}
							isSplitMask={true}
							onScroll={handleScroll}
							title={valueCol}
							isXAxisTextVisible
							isYAxisTextVisible
							onContextMenu={() => handleBrushSelectEnd(0, 0)}
							selectedSplits={query?.target.target === valueCol ? selectedSplits : undefined}
							defaultSplits={query?.target.target === valueCol ? defaultSplits : undefined}
							onSplitSelect={query?.target.target === valueCol ? handleSplitSelect : undefined}
							onSubmitIntentions={(intentions) => {
								if (originalQuery) {
									getModifyPrompt(
										originalQuery,
										segments.filter((item) => {
											return item.start_idx >= selectedSplits[0] && item.end_idx <= selectedSplits[selectedSplits.length - 1];
										}),
										intentions.segment_group_intentions.map((intention) => [intention.ids[0], intention.ids[1]]),
										intentions
									)
										.then((results) => {
											dispatch(setNLQuery(results.original_text));
											dispatch(setQuery(results));
											dispatch(setColorMap(results));
										})
										.catch(() => { });
								}
							}}
						></LineChart>
					</div>
					<div className="bg overview">
						<LineChart
							xData={timeValues as string[]}
							yData={data[valueCol] as number[]}
							isBrush={true}
							onBrush={handleBrush}
							height={"100%"}
							split={split}
							brushPosition={brushPosition}
							isXAxisVisible
							onBrushEnd={handleBrushEnd}
							isXAxisTextVisible
						></LineChart>
					</div>
				</>
			) : (
				<Empty />
			)}
		</Panel>
	);
}
