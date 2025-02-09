import { Button, Checkbox, ConfigProvider, Empty, Flex, Popover, Slider } from "antd";
import Panel from "../Panel";
import "./index.css";
import LineChart from "../LineChart";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setBrushPosition, setRange, setSelectPosition } from "../../app/slice/selectSlice";
import { useCallback, useMemo, useState } from "react";
import { setLevel } from "../../app/slice/approximation";
import { getQueryByTS } from "../../api";
import { setQuerys } from "../../app/slice/stateSlice";

const choiceMap = ["angle_scope_condition", "slope_scope_condition", "time_scope_condition", "time_span_condition", "value_scope_condition", "relations"]

function SmoothLevel() {
    const dispatch = useAppDispatch();
    const valueCol = useAppSelector((state) => state.approximation.source);
    const results = useAppSelector((state) => state.approximation.results);
    const current = results?.find(result => result.source === valueCol);
    const level = useAppSelector((state) => state.approximation.level);

    return (
        <ConfigProvider theme={{ components: { Slider: { railSize: 10, railBg: '#E0E0E0', railHoverBg: '#E0E0E0', trackBg: '#fff', trackHoverBg: '#fff', handleColor: '#666' } } }}>
            <div className="smooth-level">
                <span className="smooth-level-title">Approximation Level</span>
                <Slider disabled={!current} value={level} max={current?.max_approximation_level} onChange={(val) => {
                    dispatch(setLevel(val))
                }}></Slider>
                <span>{level}</span>
            </div>
        </ConfigProvider>
    )
}

export default function DetailView() {
    const data = useAppSelector((state) => state.dataset.dataset?.data) || {};
    const dispatch = useAppDispatch();
    const ratio = useAppSelector((state) => state.dataset.dataset?.ratios[state.approximation.source ?? ""])
    const range = useAppSelector((state) => state.select.range);
    const timeCol = Object.keys(data).at(0);
    const timeValues = timeCol ? data[timeCol] : [];
    const valueCol = useAppSelector((state) => state.approximation.source);
    const level = useAppSelector((state) => state.approximation.level);
    const results = useAppSelector((state) => state.approximation.results);
    const queryResults = useAppSelector((state) => state.approximation.queryResults) ?? {};
    const current = useMemo(() => results?.find(result => result.source === valueCol)?.approximation_segments_list.find(item => item.approximation_level === level), [level, results, valueCol]);
    const segments = useMemo(() => current?.segments || [], [current]);
    const split = [...new Set([...segments.map(s => s.start_idx), ...segments.map(s => s.end_idx)])];
    const brushPosition = useAppSelector((state) => state.select.brushPosition);
    const selectPosition = useAppSelector((state) => state.select.selectPosition);
    const selectedSegments = segments.filter(item => item.start_idx >= selectPosition[0] && item.end_idx <= selectPosition[1])
    const [isPopover, setIsPopover] = useState(false);
    const handleBrush = useCallback((start: number, end: number) => { dispatch(setRange([start, end])) }, [dispatch]);
    const handleBrushEnd = useCallback((start: number, end: number) => { dispatch(setBrushPosition([start, end])) }, [dispatch]);
    const handleBrushSelectEnd = useCallback((start: number, end: number) => {
        const selectSegments = segments.filter(item => {
            const { start_idx, end_idx } = item;
            const itemSpan = end_idx - start_idx;
            if (start_idx >= start && end_idx <= end) return true;
            if (start_idx <= start && end_idx >= start && end_idx <= end && (end_idx - start) > itemSpan / 2) return true;
            if (start_idx >= start && start_idx <= end && (end - start_idx) > itemSpan / 2) return true;
            const overlap = Math.max(0, Math.min(end, end_idx) - Math.max(start, start_idx));
            if (overlap > itemSpan / 2) {
                return true;
            }
            return false;
        });
        if (selectSegments.length > 0) {
            dispatch(setSelectPosition([selectSegments[0].start_idx, selectSegments[selectSegments.length - 1].end_idx]));
            setIsPopover(true);
        } else {
            dispatch(setSelectPosition([0, 0]));
            setIsPopover(false);
        }
    }, [dispatch, segments]);

    const [checkList, setCheckList] = useState<boolean[]>(new Array(choiceMap.length).fill(false));
    const handleScroll = useCallback((val: number) => {
        const delta = val;
        const range1 = Math.max(0, range[0] - delta);
        const range2 = Math.min(range[1] + delta, timeValues.length - 1);
        if (Math.abs(range1 - range2) < 2) return;
        if (range1 > range2) {
            handleBrush(range2, range1)
            handleBrushEnd(range2, range1)
        } else {
            handleBrush(range1, range2)
            handleBrushEnd(range1, range2)
        }
    }, [timeValues.length, handleBrush, handleBrushEnd, range])

    return (
        <Panel className="main-view" icon={<div>D</div>} title="Main View" right={<SmoothLevel />}>
            {
                timeCol && valueCol ?
                    <>
                        <div className="bg detail"><LineChart xData={timeValues.map(date => new Date(date).getTime() / 1000)} yData={data[valueCol] as number[]} isXAxisVisible={true} isYAxisVisible={true} range={range} height={'100%'} ratio={ratio} split={split} isSplitMask={true} onScroll={handleScroll} isBrush brushPosition={selectPosition} onBrushEnd={handleBrushSelectEnd} onContextMenu={() => handleBrushSelectEnd(0, 0)}>
                            <Popover placement="bottom" open={isPopover} content={
                                <>
                                    <ul className="checkbox-list">
                                        {checkList.map((checked, index) => {
                                            return <li key={index} className="checkbox-item"><Checkbox checked={checked} onChange={(e) => {
                                                setCheckList(checkList.map((checked, i) => i === index ? e.target.checked : checked))
                                            }}>{choiceMap[index]}</Checkbox></li>
                                        })}
                                    </ul>
                                    <Flex gap={8}>
                                        <Button type="primary" disabled={!checkList.some(Boolean)} onClick={() => {
                                            setIsPopover(false)
                                            const choices = checkList.reduce((acc, cur, i) => {
                                                if (cur) {
                                                    acc.push(choiceMap[i])
                                                }
                                                return acc
                                            }, [] as string[])
                                            getQueryByTS(valueCol, selectedSegments, choices).then(querys => {
                                                dispatch(setQuerys(querys))
                                            })
                                        }}>Reframe</Button>
                                        <Button type="primary" disabled={!Object.values(queryResults).flat(1).some(item => {
                                            return JSON.stringify(item) === JSON.stringify(selectedSegments)
                                        })}>Modify</Button>
                                    </Flex>
                                </>
                            } title="Generate Query">
                                <span className="pos"></span>
                            </Popover>
                        </LineChart></div>
                        <div className="bg overview"><LineChart xData={timeValues.map(date => new Date(date).getTime() / 1000)} yData={data[valueCol] as number[]} isFill={true} isBrush={true} onBrush={handleBrush} height={'100%'} split={split} brushPosition={brushPosition} isXAxisVisible={true} isYAxisVisible={true} onBrushEnd={handleBrushEnd}></LineChart></div>
                    </>
                    : <Empty />
            }
        </Panel>
    )
}