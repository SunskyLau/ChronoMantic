import { Button, Checkbox, ConfigProvider, Empty, Popover, Slider } from "antd";
import Panel from "../Panel";
import "./index.css";
import LineChart from "../LineChart";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setBrushPosition, setRange } from "../../app/slice/selectSlice";
import { useCallback, useState } from "react";
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
    const timeCol = Object.keys(data).shift();
    const valueCol = useAppSelector((state) => state.approximation.source);
    const level = useAppSelector((state) => state.approximation.level);
    const results = useAppSelector((state) => state.approximation.results);
    const current = results?.find(result => result.source === valueCol)?.approximation_segments_list.find(item => item.approximation_level === level);
    const segments = current?.segments || [];
    const split = [...new Set([...segments.map(s => s.start_idx), ...segments.map(s => s.end_idx)])];
    const brushPosition = useAppSelector((state) => state.select.brushPosition);
    const handleBrush = useCallback((start: number, end: number) => { dispatch(setRange([start, end])) }, [dispatch]);
    const handleBrushEnd = useCallback((start: number, end: number) => { dispatch(setBrushPosition([start, end])) }, [dispatch]);
    const [checkList, setCheckList] = useState<boolean[]>(new Array(choiceMap.length).fill(false));

    return (
        <Panel className="main-view" icon={<div>D</div>} title="Main View" right={<SmoothLevel />}>
            {
                timeCol && valueCol ?
                    <>
                        <div className="bg detail"><LineChart xData={data[timeCol].map(date => new Date(date).getTime() / 1000)} yData={data[valueCol] as number[]} isXAxisVisible={true} isYAxisVisible={true} range={range} height={'100%'} ratio={ratio} split={split} isSplitMask={true}>
                            <Popover content={
                                <ul className="checkbox-list">
                                    {checkList.map((checked, index) => {
                                        return <li key={index} className="checkbox-item"><Checkbox checked={checked} onChange={(e) => {
                                            setCheckList(checkList.map((checked, i) => i === index ? e.target.checked : checked))
                                        }}>{choiceMap[index]}</Checkbox></li>
                                    })}
                                </ul>
                            } title="Generate Query">
                                <Button type="primary" disabled={!checkList.some(Boolean)} onClick={() => {
                                    const choices = checkList.reduce((acc, cur, i) => {
                                        if (cur) {
                                            acc.push(choiceMap[i])
                                        }
                                        return acc
                                    }, [] as string[])
                                    const ts = segments.filter(item => item.start_idx >= range[0] && item.end_idx <= range[1]);
                                    getQueryByTS(valueCol, ts, choices).then(querys => {
                                        dispatch(setQuerys(querys))
                                    })
                                }}>Query Time Series</Button>
                            </Popover>
                        </LineChart></div>
                        <div className="bg overview"><LineChart xData={data[timeCol].map(date => new Date(date).getTime() / 1000)} yData={data[valueCol] as number[]} isFill={true} isBrush={true} onBrush={handleBrush} height={'100%'} split={split} brushPosition={brushPosition} isXAxisVisible={true} isYAxisVisible={true} onBrushEnd={handleBrushEnd}></LineChart></div>
                    </>
                    : <Empty />
            }
        </Panel>
    )
}