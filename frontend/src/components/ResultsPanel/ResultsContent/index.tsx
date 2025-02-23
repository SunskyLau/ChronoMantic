import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import "./index.css";
import SelectChart from "./SelectChart";
import { setLevelScale, setTimeSpanScale } from "../../../app/slice/filterSlice";
import { Empty, Popover } from "antd";
import { Segment } from "../../../types/QuerySpec";
import LineChart from "../../LineChart";
import { setCurrent, setLevel, setSource } from "../../../app/slice/approximation";
import { setBrushPosition, setDefaultSplits, setRange, setSelectedSplits } from "../../../app/slice/selectSlice";
import { classnames } from "../../../utils/classname";
import { deepEqual } from "../../../utils/deepclone";
import AddIcon from "../../../icons/Add";

export interface DataType {
    date: Date;
    value: number;
}

export interface ApproximationLevelResult {
    level: number,
    segments: Segment[],
    index: number,
    source: string
}

export type ApproximationLevelResults = ApproximationLevelResult[]

interface SegmentAttribute {
    key: string;
    label: string;
    format: (value: number) => string;
    getValue: (segment: Segment) => number;
}

interface AttributeOption extends SegmentAttribute {
    id: string;
    selected?: boolean;
}

export default function ResultsContent() {
    const data = useAppSelector((state) => state.dataset.dataset?.data) || {};
    const x = useAppSelector((state) => (data[state.dataset.dataset?.timeStampColumn ?? ""])) as string[];
    const queryResultsMap = useAppSelector(state => state.approximation.queryResults);
    const memoQueryResultsMap = useMemo(() => queryResultsMap || {}, [queryResultsMap]);
    const queryLevelResults: ApproximationLevelResults = useMemo(() => Object.entries(memoQueryResultsMap).map(([source, value]: [string, Record<number, Segment[][]>]) => {
        return Object.entries(value).map(([key, segments]) => segments.map(segment => ({ level: Number(key), segments: segment, source }))).flat()
    }).flat().map((item, index) => ({ ...item, index })), [memoQueryResultsMap]);
    const r2 = useAppSelector((state) => state.setting.r2);
    const source = useAppSelector((state) => state.states.querySpec?.targets) || "";
    const results = useAppSelector((state) => state.approximation.results);
    const filteredResults = useMemo(() => queryLevelResults.filter(({ segments }) => segments.every(({ r2: r }) => Math.abs(r) >= r2)), [queryLevelResults, r2]);
    const timeSpans = filteredResults.map(({ segments }) => (segments.at(-1)?.end_time || 0) - (segments.at(0)?.start_time || 0)).map((x) => x / 86400)
    const dispatch = useAppDispatch();
    const current = useAppSelector((state) => state.approximation.current);
    const defaultSplits = useAppSelector((state) => state.select.defaultSplits);

    const maxTimeSpan = Math.max(...timeSpans);
    const maxLevel = Math.max(...filteredResults.map(({ level }) => level));
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

    const attributeOptions: AttributeOption[] = useMemo(() => [
        {
            id: 'r2',
            key: 'r2',
            label: 'R²',
            format: (value) => value.toFixed(3),
            getValue: (segment) => segment.r2
        },
        {
            id: 'slope',
            key: 'slope',
            label: 'Slope',
            format: (value) => (value * 86400).toFixed(2),
            getValue: (segment) => segment.slope
        },
        {
            id: 'abs_slope_percentage',
            key: 'abs_slope_percentage',
            label: 'Abs Slope %',
            format: (value) => value.toFixed(2),
            getValue: (segment) => segment.abs_slope_percentage ?? 0
        }, {
            id: 'daily_average_delta_percentage',
            key: 'daily_average_delta_percentage',
            label: 'Daily Average Delta %',
            format: (value) => value.toFixed(2),
            getValue: (segment) => segment.daily_average_delta_percentage ?? 0
        }, {
            id: 'delta_percentage',
            key: 'delta_percentage',
            label: 'Delta %',
            format: (value) => value.toFixed(2),
            getValue: (segment) => segment.delta_percentage ?? 0
        }, {
            id: 'start_time',
            key: 'start_time',
            label: 'Start Time',
            format: (value) => new Date(value * 1000).toLocaleDateString(),
            getValue: (segment) => segment.start_time ?? 0
        }, {
            id: 'end_time',
            key: 'end_time',
            label: 'End Time',
            format: (value) => new Date(value * 1000).toLocaleDateString(),
            getValue: (segment) => segment.end_time ?? 0
        }
    ], []);

    const [selectedAttributes, setSelectedAttributes] = useState<AttributeOption[]>([]);

    const handleAttributeSelect = useCallback((attribute: AttributeOption) => {
        setSelectedAttributes(prev => {
            if (prev.find(attr => attr.id === attribute.id)) {
                return prev.filter(attr => attr.id !== attribute.id);
            }
            return [...prev, attribute];
        });
    }, []);

    const attributePopoverContent = useMemo(() => (
        <div className="attribute-selector">
            {attributeOptions.map(attr => (
                <div
                    key={attr.id}
                    className={classnames("attribute-option", selectedAttributes.find(a => a.id === attr.id) ? "selected" : "", "pointer")}
                    onClick={() => handleAttributeSelect(attr)}
                >
                    {attr.label}
                </div>
            ))}
        </div>
    ), [attributeOptions, selectedAttributes, handleAttributeSelect]);

    const [attributeScales, setAttributeScales] = useState<Record<string, [number, number]>>({});

    interface AttributeStats {
        [key: string]: {
            map: Record<string, number>;
            max: number;
            min: number;
            array: number[];
        };
    }

    const attributeStats: AttributeStats = useMemo(() => {
        const stats: AttributeStats = {};
        attributeOptions.forEach(attr => {
            const values = new Map<number, number>();
            const array: number[] = [];
            filteredResults.forEach(({ segments }) => {
                const avgValue = segments.reduce((sum, seg) => sum + attr.getValue(seg), 0) / segments.length;
                const roundedValue = Math.round(avgValue * 100) / 100;
                values.set(roundedValue, (values.get(roundedValue) || 0) + 1);
                array.push(avgValue);
            });
            stats[attr.key] = {
                map: Object.fromEntries([...values.entries()]),
                max: Math.max(...array),
                min: Math.min(...array),
                array
            };
        });
        return stats;
    }, [filteredResults, attributeOptions]);

    const handleAttributeScaleChange = useCallback((attr: string, [min, max]: [number, number]) => {
        setAttributeScales(prev => ({
            ...prev,
            [attr]: [min, max]
        }));
    }, []);

    const sortedResults = useMemo(() => {
        console.log(attributeScales);
        return filteredResults.filter(({ level, segments }, index) => {
            const baseCondition = timeSpans[index] >= timeSpanScale[0] &&
                timeSpans[index] <= timeSpanScale[1] &&
                level >= levelScale[0] &&
                level <= levelScale[1];

            const attrCondition = selectedAttributes.every((attr) => {
                if (!attributeScales[attr.key]) {
                    return true;
                }
                const avgValue = segments.reduce((sum, seg) => sum + attr.getValue(seg), 0) / segments.length;
                const [min, max] = attributeScales[attr.key];
                return avgValue >= min && avgValue <= max;
            });

            return baseCondition && attrCondition;
        });
    }, [filteredResults, timeSpans, timeSpanScale, levelScale, selectedAttributes, attributeScales]);

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
    filteredResults.forEach(({ level }) => {
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
                    <div className="fix-width data-name result-header-item">ID</div>
                    <div className="fix-width data-graph result-header-item">Graph</div>
                    <div className="data-global result-header-item">
                        <div className="result-header-title">Global</div>
                        <div className="result-header-content">
                            <div className="flex-width">
                                {filteredResults.length ?
                                    <SelectChart
                                        title="Duration"
                                        data={sortedTimeSpanIter.map(([x, y]) => ({ x: Number(x), y }))}
                                        onBrush={handleDayScaleChange}
                                    /> : "Duration"}
                            </div>
                            <div className="flex-width">
                                {filteredResults.length ?
                                    <SelectChart
                                        title="Approximation Level"
                                        data={sortedLevelIter.map(([x, y]) => ({ x: Number(x), y }))}
                                        onBrush={handleLevelScaleChange}
                                    /> : "Approximation Level"}
                            </div>
                        </div>
                    </div>
                    {selectedAttributes.map(attr => (
                        <div className="result-header-item attribute-item" key={attr.id}>
                            <div className="result-header-content">
                                <div className="flex-width">
                                    {filteredResults.length ?
                                        <SelectChart
                                            title={attr.label}
                                            data={Object.entries(attributeStats[attr.key].map).sort(([a], [b]) => Number(a) - Number(b)).map(([x, y]) => ({
                                                x: Number(x),
                                                y
                                            }))}
                                            onBrush={(min, max) => handleAttributeScaleChange(attr.key, [min, max])}
                                        /> : attr.label}
                                </div>
                            </div>
                        </div>
                    ))}
                    <Popover
                        content={attributePopoverContent}
                        trigger={["click"]}
                        placement="bottom"
                    >
                        <div className="fix-width result-header-item add-icon">
                            <AddIcon />
                        </div>
                    </Popover>
                </div>

                <div className="result-item-list">
                    {sortedResults.length === 0 || !source ?
                        <Empty /> :
                        sortedResults.slice(0, count).map((result) => {
                            const { level, index, segments, source } = result;
                            const start = segments.at(0)?.start_idx || 0;
                            const end = segments.at(-1)?.end_idx || 0;
                            const splits = segments.map(segment => [segment.start_idx, segment.end_idx]).flat();
                            return (
                                <div className={classnames("result-item", deepEqual(current, result) && current?.segments.at(0)?.start_idx === defaultSplits[0] && current.segments.at(-1)?.end_idx === defaultSplits.at(-1) ? "active" : "")} key={`${index}-${start}-${end}`} onClick={() => {
                                    const seg = results?.find(result => result.source === source)?.approximation_segments_list.find(list => list.approximation_level === level)?.segments || [];
                                    const r1 = seg.findIndex(item => deepEqual(item, segments.at(0)));
                                    const r2 = seg.findIndex(item => deepEqual(item, segments.at(-1)));
                                    const r = [Math.max(0, r1 - 4), Math.min(seg.length - 1, r2 + 4)];
                                    const range = [seg[r[0]].start_idx, seg[r[1]].end_idx] as [number, number];
                                    dispatch(setSource(source));
                                    dispatch(setBrushPosition(range));
                                    dispatch(setRange(range));
                                    dispatch(setSelectedSplits(splits))
                                    dispatch(setDefaultSplits(splits))
                                    dispatch(setLevel(level));
                                    dispatch(setCurrent(result));
                                }} >
                                    <div className="data-name">{source}</div>
                                    <div className="data-name flex data-graph">
                                        <LineChart xData={x} range={[start, end]} yData={data?.[source] as number[]} height={40} split={splits} isShowRange={false} isExpand={false} />
                                    </div>
                                    <div className="global-data data-value">
                                        <div className="data-value__inner" style={{ width: `${(timeSpans[index]) / maxTimeSpan * 100}%` }} >
                                            {timeSpans[index]} days
                                        </div>
                                    </div>
                                    <div className="global-data data-value">
                                        <div className="data-value__inner" style={{ width: `${(level + 1) / (maxLevel + 1) * 100}%` }} >
                                            {level}
                                        </div>
                                    </div>
                                    {selectedAttributes.map(attr => (
                                        <div className="global-data data-value" key={attr.id}>
                                            <div className="data-value__inner" style={{
                                                width: `${(attributeStats[attr.key].array[index] - (attributeStats[attr.key].min)) / ((attributeStats[attr.key].max) - (attributeStats[attr.key].min)) * 100}%`
                                            }}>
                                                {attr.format(attributeStats[attr.key].array[index])}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        })}
                </div>
            </div>
        </>
    );
}