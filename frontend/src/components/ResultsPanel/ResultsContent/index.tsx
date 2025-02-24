import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import "./index.css";
import SelectChart from "./SelectChart";
import { Cascader, Empty } from "antd";
import { Segment } from "../../../types/QuerySpec";
import LineChart from "../../LineChart";
import { setCurrent, setLevel, setSource } from "../../../app/slice/approximation";
import { setBrushPosition, setDefaultSplits, setRange, setSelectedSplits } from "../../../app/slice/selectSlice";
import { classnames } from "../../../utils/classname";
import { deepEqual } from "../../../utils/deepclone";
import AddIcon from "../../../icons/Add";
import { SortAscendingOutlined, SortDescendingOutlined, UnorderedListOutlined } from '@ant-design/icons';

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
    getValue: (segments: Segment[], index?: number, result?: ApproximationLevelResult) => number;
    scope: 'global' | 'segment';
}

interface AttributeOption extends SegmentAttribute {
    id: string;
    segmentIndex?: number;
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
    const dispatch = useAppDispatch();
    const current = useAppSelector((state) => state.approximation.current);
    const defaultSplits = useAppSelector((state) => state.select.defaultSplits);

    const attributeOptions: AttributeOption[] = useMemo(() => [
        {
            id: 'duration',
            key: 'duration',
            label: 'Duration',
            scope: 'global',
            format: (value) => `${value} days`,
            getValue: (segments) => ((segments.at(-1)?.end_time ?? 0) - (segments.at(0)?.start_time ?? 0)) / 86400
        },
        {
            id: 'level',
            key: 'level',
            label: 'Approximation Level',
            scope: 'global',
            format: (value) => value.toString(),
            getValue: (_1, _2, result?: ApproximationLevelResult) => result?.level ?? 0
        },
        {
            id: 'start_time',
            key: 'start_time',
            label: 'Start Time',
            scope: 'global',
            format: (value) => new Date(value * 1000).toLocaleDateString(),
            getValue: (segments) => segments[0]?.start_time ?? 0
        },
        {
            id: 'end_time',
            key: 'end_time',
            label: 'End Time',
            scope: 'global',
            format: (value) => new Date(value * 1000).toLocaleDateString(),
            getValue: (segments) => segments[segments.length - 1]?.end_time ?? 0
        },
        {
            id: 'min_value',
            key: 'min_value',
            label: 'Min Value',
            scope: 'global',
            format: (value) => value.toFixed(2),
            getValue: (segments) => Math.min(...segments.map(seg => seg.start_value))
        },
        {
            id: 'max_value',
            key: 'max_value',
            label: 'Max Value',
            scope: 'global',
            format: (value) => value.toFixed(2),
            getValue: (segments) => Math.max(...segments.map(seg => seg.end_value))
        }
    ], []);

    const getSegmentAttributeOptions = useCallback((segmentIndex: number): AttributeOption[] => [
        {
            id: `segment_${segmentIndex}_r2`,
            key: 'r2',
            label: `R²`,
            scope: 'segment',
            segmentIndex,
            format: (value) => value.toFixed(3),
            getValue: (segments) => segments[segmentIndex]?.r2 ?? 0
        },
        {
            id: `segment_${segmentIndex}_slope`,
            key: 'slope',
            label: `Slope`,
            scope: 'segment',
            segmentIndex,
            format: (value) => value.toFixed(2),
            getValue: (segments) => (segments[segmentIndex]?.slope ?? 0) * 86400
        },
        {
            id: `segment_${segmentIndex}_abs_slope`,
            key: 'abs_slope_percentage',
            label: `Abs Slope`,
            scope: 'segment',
            segmentIndex,
            format: (value) => value.toFixed(2) + '%',
            getValue: (segments) => segments[segmentIndex]?.abs_slope_percentage ?? 0
        },
        {
            id: `segment_${segmentIndex}_delta`,
            key: 'delta_percentage',
            label: `Delta`,
            scope: 'segment',
            segmentIndex,
            format: (value) => value.toFixed(2) + '%',
            getValue: (segments) => segments[segmentIndex]?.delta_percentage ?? 0
        },
        {
            id: `segment_${segmentIndex}_daily_delta`,
            key: 'daily_average_delta_percentage',
            label: `Daily Avg Delta`,
            scope: 'segment',
            segmentIndex,
            format: (value) => value.toFixed(2) + '%',
            getValue: (segments) => segments[segmentIndex]?.daily_average_delta_percentage ?? 0
        },
        {
            id: `segment_${segmentIndex}_duration`,
            key: 'duration',
            label: `Duration`,
            scope: 'segment',
            segmentIndex,
            format: (value) => `${value} days`,
            getValue: (segments) => {
                const segment = segments[segmentIndex];
                return segment ? ((segment?.end_time ?? 0) - (segment?.start_time ?? 0)) / 86400 : 0;
            }
        }
    ], []);

    const [selectedAttributes, setSelectedAttributes] = useState<AttributeOption[]>([]);

    const handleAttributeSelect = useCallback((attribute: AttributeOption[]) => {
        setSelectedAttributes(attribute);
    }, []);

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
        selectedAttributes.forEach(attr => {
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
                array
            };
        });
        return stats;
    }, [filteredResults, selectedAttributes]);

    const handleAttributeScaleChange = useCallback((attr: string, [min, max]: [number, number]) => {
        setAttributeScales(prev => ({
            ...prev,
            [attr]: [min, max]
        }));
    }, []);

    useEffect(() => {
        const newAttributeScales: Record<string, [number, number]> = {};
        selectedAttributes.forEach(attr => {
            if (attributeScales[attr.id]) {
                newAttributeScales[attr.id] = attributeScales[attr.id];
            }
        });
        setAttributeScales(newAttributeScales);
    }, [selectedAttributes, attributeScales]);

    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: 'asc' | 'desc' | null;
    }>({
        key: '',
        direction: null
    });

    const handleSort = useCallback((attrId: string) => {
        setSortConfig(prevConfig => ({
            key: attrId,
            direction: prevConfig.key === attrId && prevConfig.direction === 'asc' ? 'desc' : prevConfig.key === attrId && prevConfig.direction === 'desc' ? null : 'asc'
        }));
    }, []);

    const getCascaderOptions = useCallback((length: number) => {
        const globalOptions = {
            value: 'global',
            label: 'Global',
            children: attributeOptions.map(attr => ({
                value: attr.id,
                label: attr.label
            }))
        };

        const segmentOptions = Array.from({ length }, (_, index) => ({
            value: `segment_${index}`,
            label: `Segment ${index + 1}`,
            children: getSegmentAttributeOptions(index).map(attr => ({
                value: attr.id,
                label: attr.label
            }))
        }));

        return [globalOptions, ...segmentOptions];
    }, [attributeOptions, getSegmentAttributeOptions]);

    const handleCascaderChange = useCallback((value: string[][]) => {
        if (!value?.length) {
            handleAttributeSelect([]);
            return;
        }
        const newSelectedAttributes = value.map(item => {
            const [scope, attr] = item;
            if (scope === 'global') {
                return attr ? attributeOptions.filter(option => option.id === attr) : attributeOptions;
            } else {
                const segmentIndex = parseInt(scope.split('_')[1]);
                const options = getSegmentAttributeOptions(segmentIndex);
                return attr ? options.filter(option => option.id === attr) : options;
            }
        }).flat();
        handleAttributeSelect(newSelectedAttributes);
    }, [attributeOptions, handleAttributeSelect, getSegmentAttributeOptions]);

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
            segments: Array(queryLevelResults?.[0]?.segments.length || 0).fill(null).map(() => [])
        };

        selectedAttributes.forEach(attr => {
            if (attr.scope === 'global') {
                groups.global.push(attr);
            } else if (attr.segmentIndex !== undefined) {
                groups.segments[attr.segmentIndex]?.push(attr);
            }
        });
        return groups;
    }, [selectedAttributes, queryLevelResults]);

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
            const attr = [...groupedAttributes.global, ...groupedAttributes.segments.flat()]
                .find(attr => attr.id === sortConfig.key);

            if (attr) {
                results = [...results].sort((a, b) => {
                    const valueA = attr.getValue(a.segments, attr.segmentIndex, a);
                    const valueB = attr.getValue(b.segments, attr.segmentIndex, b);
                    return sortConfig.direction === 'asc'
                        ? valueA - valueB
                        : valueB - valueA;
                });
            }
        }

        return results;
    }, [filteredResults, selectedAttributes, attributeScales, sortConfig, groupedAttributes]);

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
                    <div className="header-column">
                        <div className="header-column-item">ID</div>
                    </div>

                    <div className="header-column">
                        <div className="header-column-item glyph-column">Graph</div>
                    </div>

                    {groupedAttributes.global.length > 0 && <div className="header-column">
                        <div className="header-column-group">
                            <div className="header-column-group-title">
                                <span>Global</span>
                            </div>
                            <div className="header-column-group-content">
                                {
                                    groupedAttributes.global.map(attr => (
                                        <div
                                            className="header-column-group-item pointer"
                                            key={attr.id}
                                            onClick={() => handleSort(attr.id)}
                                        >
                                            <div className="header-column-group-item-title">
                                                <span className={classnames("header-column-group-item-title-icon")}>
                                                    {sortConfig.key !== attr.id || sortConfig.direction === null ? <UnorderedListOutlined /> : sortConfig.direction === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                                                </span>
                                                <span className="header-column-group-item-title-text">{attr.label}</span>
                                            </div>
                                            {filteredResults.length ?
                                                <SelectChart
                                                    data={Object.entries(attributeStats[attr.id].map)
                                                        .sort(([a], [b]) => Number(a) - Number(b))
                                                        .map(([x, y]) => ({ x: Number(x), y }))}
                                                    onBrush={(min, max) => handleAttributeScaleChange(attr.id, [min, max])}
                                                /> : attr.label}
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>}

                    {groupedAttributes.segments.map((segmentAttrs, index) => (
                        segmentAttrs.length > 0 && (
                            <div className="header-column" key={`segment-${index}`}>
                                <div className="header-column-group">
                                    <div className="header-column-group-title">Segment {index + 1}</div>
                                    <div className="header-column-group-content">
                                        {segmentAttrs.map(attr => (
                                            <div
                                                className="header-column-group-item pointer"
                                                key={attr.id}
                                                onClick={() => handleSort(attr.id)}
                                            >
                                                <div className="header-column-group-item-title">
                                                    <span className={classnames("header-column-group-item-title-icon")}>
                                                        {sortConfig.key !== attr.id || sortConfig.direction === null ? <UnorderedListOutlined /> : sortConfig.direction === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                                                    </span>
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
                    ))}

                    <div className="header-column">
                        <Cascader
                            options={options}
                            onChange={handleCascaderChange}
                            multiple
                        >
                            <div className="header-column-item add-icon">
                                <AddIcon />
                            </div>
                        </Cascader>
                    </div>
                </div>

                <div className="result-item-list">
                    {sortedResults.length === 0 || !source ? <Empty /> :
                        sortedResults.slice(0, count).map((result) => {
                            const { level, index, segments, source } = result;
                            const start = segments.at(0)?.start_idx || 0;
                            const end = segments.at(-1)?.end_idx || 0;
                            const splits = segments.map(segment => [segment.start_idx, segment.end_idx]).flat();

                            return (
                                <div className={classnames("result-item", deepEqual(current, result) && current?.segments.at(0)?.start_idx === defaultSplits[0] && current.segments.at(-1)?.end_idx === defaultSplits.at(-1) ? "active" : "")}
                                    key={`${index}-${start}-${end}`}
                                    onClick={() => {
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
                                    }}>

                                    <div className="item-column">
                                        {source}
                                    </div>

                                    <div className="item-column data-glyph">
                                        <LineChart xData={x} range={[start, end]} yData={data?.[source] as number[]} height={40} split={splits} isShowRange={false} isExpand={false} />
                                    </div>

                                    {groupedAttributes.global.length > 0 && (
                                        groupedAttributes.global.map(attr => (
                                            <div className="item-column data-value">
                                                <div className="data-value__inner" style={{
                                                    width: `${(attributeStats[attr.id].array[index] - attributeStats[attr.id].min) / (attributeStats[attr.id].max - attributeStats[attr.id].min) * 100}%`
                                                }}>
                                                    {attr.format(attributeStats[attr.id].array[index])}
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    {groupedAttributes.segments.map((segmentAttrs, segIndex) => (
                                        segmentAttrs.length > 0 && (
                                            segmentAttrs.map(attr => (
                                                <div className="item-column data-value" key={`segment-${segIndex}-${attr.id}`}>
                                                    <div className="data-value__inner" style={{
                                                        width: `${(attributeStats[attr.id].array[index] - attributeStats[attr.id].min) / (attributeStats[attr.id].max - attributeStats[attr.id].min) * 100}%`
                                                    }}>
                                                        {attr.format(attributeStats[attr.id].array[index])}
                                                    </div>
                                                </div>
                                            ))
                                        )
                                    ))}
                                </div>
                            );
                        })}
                </div>
            </div>
        </>
    );
}