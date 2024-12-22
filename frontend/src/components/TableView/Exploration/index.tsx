import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import LineChart from "../../LineChart";
import "./index.css";
import LineIcon from "../../../icons/Line";
import ArrowIcon from "../../../icons/Arrow";
import { TimeSeries } from "../../../types";
import { removeSelectedSymbol, removeUnselectedSymbol } from "../../../app/slice/datasetSlice";
import { useEffect, useState } from "react";
import { classnames } from "../../../utils/classname";

export default function Exploration() {
    const symbolData = useAppSelector((state) => state.dataset.dataset?.symbolData) || {};
    const selectedSymbols = useAppSelector((state) => state.dataset.dataset?.selectedSymbols) || [];
    const unselectedSymbols = useAppSelector((state) => state.dataset.dataset?.unselectedSymbols) || [];
    const dispatch = useAppDispatch();
    const [renderedCharts, setRenderedCharts] = useState([0, 0]);
    const [isShowCharts, setIsShowCharts] = useState([true, true]);
    const ratio = useAppSelector((state) => state.states.aspectRatio);

    const selectedData = selectedSymbols?.map((symbol): [string, TimeSeries] => [symbol, symbolData[symbol]]);
    const unSelectedData = unselectedSymbols?.map((symbol): [string, TimeSeries] => [symbol, symbolData[symbol]]);
    const allData = { selectedData, unSelectedData };

    useEffect(() => {
        const incrementRender = () => {
            setRenderedCharts((prev) => {
                const newSelectedCount = Math.min(prev[0] + 1, selectedData.length);
                const newUnselectedCount = Math.min(prev[1] + 1, unSelectedData.length);
                if (newSelectedCount === selectedData.length && newUnselectedCount === unSelectedData.length) {
                    clearInterval(interval);
                }
                return [newSelectedCount, newUnselectedCount];
            });
        };
        setRenderedCharts([0, 0]);
        const interval = setInterval(incrementRender, 16);
        return () => clearInterval(interval);
    }, [selectedData?.length, unSelectedData?.length]);

    return (
        <div className="explore">
            {Object.entries(allData).map(([type, record], index) => {
                return (
                    <div className={classnames("explore-item", isShowCharts[index] ? "" : "hide")} key={type}>
                        <h3 className="explore-item-title">
                            <span>{type === "selectedData" ? "" : "Not"} Under Exploration</span>
                            <div className="tools">
                                <button onClick={() => {
                                    record.forEach(([key,]) => {
                                        if (type === "selectedData") {
                                            dispatch(removeSelectedSymbol(key));
                                        } else {
                                            dispatch(removeUnselectedSymbol(key));
                                        }
                                    })
                                }}><LineIcon /></button>
                                <button onClick={() => {
                                    const newIsShowCharts = [...isShowCharts];
                                    newIsShowCharts[index] = !newIsShowCharts[index];
                                    setIsShowCharts(newIsShowCharts);
                                }}><ArrowIcon className={isShowCharts[index] ? "rotate" : ""} /></button>
                            </div>
                        </h3>
                        <div className={classnames("explore-item-content", isShowCharts[index] ? "" : "hide")}>
                            {record.slice(0, renderedCharts[index]).map(([key, { x, y }]) => (
                                <div className="explore-item-content-list" key={key} >
                                    <div className="explore-item-content-title">{key}</div>
                                    <LineChart key={key} xData={x} yData={y} ratio={ratio}></LineChart>
                                    <button className="explore-item-content-remove" onClick={() => {
                                        if (type === "selectedData") {
                                            dispatch(removeSelectedSymbol(key));
                                        } else {
                                            dispatch(removeUnselectedSymbol(key));
                                        }
                                    }}><LineIcon /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};