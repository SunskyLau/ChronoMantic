import { Button, Checkbox, ConfigProvider, Empty, Flex, Popover, Slider } from "antd";
import Panel from "../Panel";
import "./index.css";
import LineChart from "../LineChart";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setBrushPosition, setRange, setSelectPosition } from "../../app/slice/selectSlice";
import { useCallback, useMemo, useState } from "react";
import { setLevel } from "../../app/slice/approximation";
import { getModifyPrompt, getQueryByTS } from "../../api";
import { setModifyPrompts, setNLQuery, setQuerys } from "../../app/slice/stateSlice";
import { deepEqual } from "../../utils/deepclone";
import { getColorFromMap } from "../../utils/color";

const choiceMap = ["angle_scope_condition", "slope_scope_condition", "time_scope_condition", "time_span_condition", "value_scope_condition", "relations"]

enum PopoverState {
    QUERY,
    LOADING_REFRAME,
    LOADING_MODIFY,
    CONFIRM_REFRAME,
    CONFIRM_MODIFY,
}

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

const getLCS = (a: string, b: string): string => {
    const dp: string[][] = Array(a.length + 1)
        .fill(null)
        .map(() => Array(b.length + 1).fill(""));

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + a[i - 1];
            } else {
                dp[i][j] = dp[i - 1][j].length > dp[i][j - 1].length ? dp[i - 1][j] : dp[i][j - 1];
            }
        }
    }
    return dp[a.length][b.length];
};

const highlightDifferences = (a: string, b: string) => {
    const lcs = getLCS(a, b);
    let lcsIndex = 0;

    return a.split("").map((char, i) => {
        if (lcsIndex < lcs.length && char === lcs[lcsIndex]) {
            lcsIndex++;
            return <span key={i}>{char}</span>;
        }
        return (
            <span key={i} style={{ color: "red" }}>
                {char}
            </span>
        );
    });
};

export default function DetailView() {
    const data = useAppSelector((state) => state.dataset.dataset?.data) || {};
    const dispatch = useAppDispatch();
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
    const query = useAppSelector((state) => state.states.query);
    const colorMap = useAppSelector((state) => state.states.colorMap);
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
            const overlap = Math.max(0, Math.min(end, end_idx) - Math.max(start, start_idx));
            return overlap > itemSpan / 2;
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
    const choices = useMemo(() => checkList.reduce((acc, cur, i) => {
        if (cur) acc.push(choiceMap[i]);
        return acc
    }, [] as string[]), [checkList])

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
    const NLQuery = useAppSelector((state) => state.states.NLQuery);

    const [popoverState, setPopoverState] = useState(PopoverState.QUERY);
    const modifyPrompts = useAppSelector((state) => state.states.modifyPrompts);
    const querys = useAppSelector((state) => state.states.querys);

    return (
        <Panel className="main-view" icon={<div>D</div>} title="Main View" right={<SmoothLevel />}>
            {
                timeCol && valueCol ?
                    <>
                        <div className="bg detail"><LineChart isShowRange={false} xData={timeValues as string[]} yData={data[valueCol] as number[]} resultsSplit={{colors: query?.trends.map(trend=>getColorFromMap(colorMap, trend.category.text_source)) || [], segments: query && queryResults[level]?.map(segments=>(segments.map(segment=>[segment.start_idx, segment.end_idx]))) || []}} isXAxisVisible={true} isYAxisVisible={true} range={range} height={'100%'} split={split} isSplitMask={true} onScroll={handleScroll} isBrush brushPosition={selectPosition} onBrushEnd={handleBrushSelectEnd} title={valueCol} isXAxisTextVisible isYAxisTextVisible onContextMenu={() => handleBrushSelectEnd(0, 0)}>
                            <Popover className="query-popover" placement="bottom" open={isPopover} content={
                                () => {
                                    const isModify = popoverState === PopoverState.CONFIRM_MODIFY;
                                    const prompts = isModify ? modifyPrompts : querys;
                                    const highlightedPrompts = prompts.map((prompt, index) => {
                                        return <span key={index}>{highlightDifferences(prompt, NLQuery)}</span>
                                    })
                                    switch (popoverState) {
                                        case PopoverState.QUERY:
                                        case PopoverState.LOADING_REFRAME:
                                        case PopoverState.LOADING_MODIFY:
                                            return (<>
                                                <ul className="checkbox-list">
                                                    {checkList.map((checked, index) => {
                                                        return <li key={index} className="checkbox-item"><Checkbox checked={checked} onChange={(e) => {
                                                            setCheckList(checkList.map((checked, i) => i === index ? e.target.checked : checked))
                                                        }} disabled={popoverState !== PopoverState.QUERY}>{choiceMap[index]}</Checkbox></li>
                                                    })}
                                                </ul>
                                                <Flex gap={8}>
                                                    <Button type="primary" disabled={PopoverState.LOADING_MODIFY === popoverState || !checkList.some(Boolean)} onClick={() => {
                                                        setPopoverState(PopoverState.LOADING_REFRAME)
                                                        getQueryByTS(valueCol, selectedSegments, choices).then(querys => {
                                                            dispatch(setQuerys(querys))
                                                            setPopoverState(PopoverState.CONFIRM_REFRAME)
                                                        }).catch(() => {
                                                            setPopoverState(PopoverState.QUERY)
                                                        })
                                                    }} loading={PopoverState.LOADING_REFRAME === popoverState}>Reframe</Button>
                                                    <Button type="primary" disabled={PopoverState.LOADING_REFRAME === popoverState || !checkList.some(Boolean) || !Object.values(queryResults).flat(1).some(item => {
                                                        return deepEqual(item, selectedSegments)
                                                    })} onClick={() => {
                                                        setPopoverState(PopoverState.LOADING_MODIFY)
                                                        getModifyPrompt(NLQuery, selectedSegments, choices).then(prompts => {
                                                            dispatch(setModifyPrompts(prompts))
                                                            setPopoverState(PopoverState.CONFIRM_MODIFY)
                                                        }).catch(() => {
                                                            setPopoverState(PopoverState.QUERY)
                                                        })
                                                    }} loading={PopoverState.LOADING_MODIFY === popoverState}>Modify</Button>
                                                </Flex>
                                            </>)
                                        case PopoverState.CONFIRM_REFRAME:
                                        case PopoverState.CONFIRM_MODIFY:
                                            return <Flex gap={8} vertical className="recommendation-list">
                                                {
                                                    prompts.map((item, index) => {
                                                        return <div className="pointer" key={index} onClick={() => {
                                                            dispatch(setNLQuery(item))
                                                            setPopoverState(PopoverState.QUERY)
                                                            setIsPopover(false)
                                                        }}>{highlightedPrompts[index]}</div>
                                                    })
                                                }
                                            </Flex>
                                        default:
                                            return <></>
                                    }
                                }} title="Generate Query">
                                <span className="pos"></span>
                            </Popover>
                        </LineChart></div>
                        <div className="bg overview"><LineChart xData={timeValues as string[]} yData={data[valueCol] as number[]} isBrush={true} onBrush={handleBrush} height={'100%'} split={split} brushPosition={brushPosition} isXAxisVisible onBrushEnd={handleBrushEnd} isXAxisTextVisible></LineChart></div>
                    </>
                    : <Empty />
            }
        </Panel>
    )
}