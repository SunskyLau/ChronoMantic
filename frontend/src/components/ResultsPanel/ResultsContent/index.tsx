import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { deepClone } from "../../../utils/deepclone";
import FragmentChart from "./FragmentChart";
import "./index.css";
import SelectChart from "./SelectChart";
import { setScoreScale, setTimeSpanScale } from "../../../app/slice/filterSlice";
import { Empty } from "antd";

export interface DataType {
    date: Date;
    value: number;
}

export default function ResultsContent() {
    const symbolData = useAppSelector((state) => state.dataset.dataset?.symbolData);
    const ratio = useAppSelector((state) => state.states.aspectRatio);
    const fragments = useAppSelector((state) => state.states.fragmentsList[state.states.fragmentsIndex]?.[1]) || [];
    const dispatch = useAppDispatch();

    const maxTimeSpan = Math.max(...fragments.map((fragment) => fragment.end_idx - fragment.start_idx + 1))
    const maxScore = Math.max(...fragments.map((fragment) => fragment.avg_loss!))
    const timeSpanScale = useAppSelector((state) => state.filter.timeSpanScale);
    const scoreScale = useAppSelector((state) => state.filter.scoreScale);

    useEffect(() => {
        dispatch(setTimeSpanScale([0, maxTimeSpan]));
        dispatch(setScoreScale([0, maxScore]));
    }, [maxTimeSpan, maxScore, dispatch])

    const handleDayScaleChange = useCallback((minX: number, maxX: number) => {
        dispatch(setTimeSpanScale([minX, maxX]));
    }, [dispatch]);

    const handleScoreScaleChange = useCallback((minX: number, maxX: number) => {
        dispatch(setScoreScale([minX, maxX]));
    }, [dispatch]);

    const sortedFragments = deepClone(fragments).filter(fragment => (1 - fragment.avg_loss! / maxScore) >= scoreScale[0] && (1 - fragment.avg_loss! / maxScore) <= scoreScale[1] && fragment.end_idx - fragment.start_idx + 1 >= timeSpanScale[0] && fragment.end_idx - fragment.start_idx + 1 <= timeSpanScale[1]).sort((a, b) => a.avg_loss! - b.avg_loss!);

    const timeSpanMap: Record<string, number> = {};
    fragments.forEach((fragment) => {
        const timeSpan = fragment.end_idx - fragment.start_idx + 1;
        if (timeSpanMap[timeSpan]) {
            timeSpanMap[timeSpan] += 1;
        } else {
            timeSpanMap[timeSpan] = 1;
        }
    })
    const sortedTimeSpanIter = Object.entries(timeSpanMap).sort(([a], [b]) => Number(a) - Number(b))

    const scoreMap: Record<string, number> = {};
    fragments.forEach((fragment) => {
        const score = (1 - fragment.avg_loss! / maxScore).toFixed(2);
        if (scoreMap[score]) {
            scoreMap[score] += 1;
        } else {
            scoreMap[score] = 1;
        }
    })
    const sortedScoreIter = Object.entries(scoreMap).sort(([a], [b]) => Number(a) - Number(b))

    const [count, setCount] = useState(0);

    useEffect(() => {
        const incrementRender = () => {
            setCount((count) => {
                if (count >= sortedFragments.length) {
                    clearInterval(interval);
                }
                return count + 10;
            });
        };
        setCount(0);
        const interval = setInterval(incrementRender, 160);
        return () => clearInterval(interval);
    }, [sortedFragments.length]);

    return (
        <>
            <div className="results-content">
                <div className="result-header">
                    <div className="fix-width data-name">ID</div>
                    <div className="fix-width">Graph</div>
                    <div className="flex-width">
                        {fragments.length ? <SelectChart title="Time Span" data={sortedTimeSpanIter.map(([x, y]) => ({ x: Number(x), y }))} onBrush={handleDayScaleChange}></SelectChart> : "Time Span"}
                    </div>
                    <div className="flex-width">
                        {fragments.length ? <SelectChart title="Score" data={sortedScoreIter.map(([x, y]) => ({ x: Number(x), y }))} onBrush={handleScoreScaleChange}></SelectChart> : "Score"}
                    </div>
                </div>
                <div className="result-item-list">
                    {sortedFragments.length === 0 && <Empty></Empty>}
                    {sortedFragments.slice(0, count).map((fragment) => {
                        return (
                            <div className="result-item" key={fragment.source + "-" + fragment.start_idx + "-" + fragment.end_idx}>
                                <div className="data-name">{fragment.source}</div>
                                <div className="data-name">
                                    <FragmentChart xData={symbolData?.[fragment.source].x || []} yData={symbolData?.[fragment.source].y || []} ratio={ratio} fragment={fragment} />
                                </div>
                                <div className="flex-width data-value">
                                    <div className="data-value__inner" style={{ width: `${(fragment.end_idx - fragment.start_idx + 1) / maxTimeSpan * 100}%` }} >
                                        {fragment.end_idx - fragment.start_idx + 1} days
                                    </div>
                                </div>
                                <div className="flex-width data-value">
                                    <div className="data-value__inner" style={{ width: `${(1 - fragment.avg_loss! / maxScore) * 100}%` }} >
                                        {(1 - fragment.avg_loss! / maxScore).toFixed(2)}
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