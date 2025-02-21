import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import "./index.css";
import SelectChart from "./SelectChart";
import { setLevelScale, setTimeSpanScale } from "../../../app/slice/filterSlice";
import { Empty } from "antd";
import { Segment } from "../../../types/QuerySpec";
import LineChart from "../../LineChart";
import { setCurrent, setLevel, setSource } from "../../../app/slice/approximation";
import { setBrushPosition, setDefaultSplits, setRange, setSelectedSplits } from "../../../app/slice/selectSlice";
import { classnames } from "../../../utils/classname";
import { deepEqual } from "../../../utils/deepclone";

export interface DataType {
    date: Date;
    value: number;
}

export interface ApproximationLevelResult {
    level: number,
    segments: Segment[],
    index: number
}

export type ApproximationLevelResults = ApproximationLevelResult[]

export default function ResultsContent() {
    const data = useAppSelector((state) => state.dataset.dataset?.data) || {};
    const x = useAppSelector((state) => (data[state.dataset.dataset?.timeStampColumn ?? ""])) as string[];
    const queryResultsMap = useAppSelector(state => state.approximation.queryResults) || {};
    const queryLevelResults: ApproximationLevelResults = Object.entries(queryResultsMap).map(([key, value]: [string, Segment[][]]) => {
        return value.map(segments => ({ level: Number(key), segments }))
    }).flat(1).map((item, index) => ({ ...item, index }));
    const source = useAppSelector((state) => state.states.querySpec?.target) || "";
    const timeSpans = queryLevelResults.map(({ segments }) => (segments.at(-1)?.end_time || 0) - (segments.at(0)?.start_time || 0)).map((x) => x / 86400)
    const dispatch = useAppDispatch();
    const current = useAppSelector((state) => state.approximation.current);
    const defaultSplits = useAppSelector((state) => state.select.defaultSplits);

    const maxTimeSpan = Math.max(...timeSpans);
    const maxLevel = Math.max(...queryLevelResults.map(({ level }) => level));
    const timeSpanScale = useAppSelector((state) => state.filter.timeSpanScale);
    const levelScale = useAppSelector((state) => state.filter.levelScale);

    useEffect(() => {
        dispatch(setTimeSpanScale([0, maxTimeSpan]));
        dispatch(setLevelScale([0, maxLevel]));
    }, [maxTimeSpan, dispatch, maxLevel])

    const handleDayScaleChange = useCallback((minX: number, maxX: number) => {
        dispatch(setTimeSpanScale([minX, maxX]));
    }, [dispatch]);

    const handleLevelScaleChange = useCallback((minY: number, maxY: number) => {
        dispatch(setLevelScale([minY, maxY]));
    }, [dispatch]);

    const sortedResults = queryLevelResults.filter(({ level }, index) => timeSpans[index] >= timeSpanScale[0] && timeSpans[index] <= timeSpanScale[1] && level >= levelScale[0] && level <= levelScale[1]);

    const timeSpanMap: Record<string, number> = {};
    timeSpans.forEach((timeSpan) => {
        if (timeSpanMap[timeSpan]) {
            timeSpanMap[timeSpan] += 1;
        } else {
            timeSpanMap[timeSpan] = 1;
        }
    })
    const sortedTimeSpanIter = Object.entries(timeSpanMap).sort(([a], [b]) => Number(a) - Number(b));

    const levelMap: Record<string, number> = {};
    queryLevelResults.forEach(({ level }) => {
        if (levelMap[level]) {
            levelMap[level] += 1;
        } else {
            levelMap[level] = 1;
        }
    })
    const sortedLevelIter = Object.entries(levelMap).sort(([a], [b]) => Number(a) - Number(b));

    const [count, setCount] = useState(0);

    useEffect(() => {
        const incrementRender = () => {
            setCount((count) => {
                if (count >= sortedResults.length) {
                    clearInterval(interval);
                }
                return count + 10;
            });
        };
        setCount(0);
        const interval = setInterval(incrementRender, 160);
        return () => clearInterval(interval);
    }, [sortedResults.length]);

    return (
        <>
            <div className="results-content">
                <div className="result-header">
                    <div className="fix-width data-name">ID</div>
                    <div className="fix-width data-graph">Graph</div>
                    <div className="flex-width">
                        {queryLevelResults.length ? <SelectChart title="Time Span" data={sortedTimeSpanIter.map(([x, y]) => ({ x: Number(x), y }))} onBrush={handleDayScaleChange}></SelectChart> : "Time Span"}
                    </div>
                    <div className="flex-width">
                        {queryLevelResults.length ? <SelectChart title="Smooth Iteration" data={sortedLevelIter.map(([x, y]) => ({ x: Number(x), y }))} onBrush={handleLevelScaleChange}></SelectChart> : "Smooth Iteration"}
                    </div>
                </div>
                <div className="result-item-list">
                    {sortedResults.length === 0 || !source ?
                        <Empty></Empty> :
                        sortedResults.slice(0, count).map((result) => {
                            const { level, index, segments } = result;
                            const start = segments.at(0)?.start_idx || 0;
                            const end = segments.at(-1)?.end_idx || 0;
                            const splits = segments.map(segment => [segment.start_idx, segment.end_idx]).flat();
                            return (
                                <div className={classnames("result-item", deepEqual(current, result) && current?.segments.at(0)?.start_idx === defaultSplits[0] && current.segments.at(-1)?.end_idx === defaultSplits.at(-1) ? "active" : "")} key={`${index}-${start}-${end}`} onClick={() => {
                                    dispatch(setSource(source));
                                    dispatch(setBrushPosition([start, end]));
                                    dispatch(setRange([start, end]));
                                    dispatch(setSelectedSplits(splits))
                                    dispatch(setDefaultSplits(splits))
                                    dispatch(setLevel(level));
                                    dispatch(setCurrent(result));
                                }} >
                                    <div className="data-name">{source}</div>
                                    <div className="data-name flex data-graph">
                                        <LineChart xData={x} range={[start, end]} yData={data?.[source] as number[]} height={40} split={splits} isShowRange={false} isExpand={false}></LineChart>
                                    </div>
                                    <div className="flex-width data-value">
                                        <div className="data-value__inner" style={{ width: `${(timeSpans[index]) / maxTimeSpan * 100}%` }} >
                                            {timeSpans[index]} days
                                        </div>
                                    </div>
                                    <div className="flex-width data-value">
                                        <div className="data-value__inner" style={{ width: `${(level + 1) / (maxLevel + 1) * 100}%` }} >
                                            {level}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                </div>
            </div>
        </>
    );
}