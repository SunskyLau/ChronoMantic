import { ConfigProvider, Empty, Slider } from "antd";
import Panel from "../Panel";
import "./index.css";
import LineChart from "../LineChart";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setBrushPosition, setRange } from "../../app/slice/selectSlice";
import { useCallback } from "react";
import { setLevel } from "../../app/slice/approximation";

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
    const handleBrush = useCallback((start: number, end: number) => { console.log('brush'); dispatch(setRange([start, end])) }, [dispatch]);
    const handleBrushEnd = useCallback((start: number, end: number) => { dispatch(setBrushPosition([start, end])) }, [dispatch]);

    return (
        <Panel className="main-view" icon={<div>D</div>} title="Main View" right={<SmoothLevel />}>
            {
                timeCol && valueCol ?
                    <>
                        <div className="bg detail"><LineChart xData={data[timeCol].map(date => new Date(date).getTime() / 1000)} yData={data[valueCol] as number[]} isXAxisVisible={true} isYAxisVisible={true} range={range} height={'100%'} ratio={ratio} split={split} isSplitMask={true}></LineChart></div>
                        <div className="bg overview"><LineChart xData={data[timeCol].map(date => new Date(date).getTime() / 1000)} yData={data[valueCol] as number[]} isFill={true} isBrush={true} onBrush={handleBrush} height={'100%'} split={split} brushPosition={brushPosition} isXAxisVisible={true} isYAxisVisible={true} onBrushEnd={handleBrushEnd}></LineChart></div>
                    </>
                    : <Empty />
            }
        </Panel>
    )
}