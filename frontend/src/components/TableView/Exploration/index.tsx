import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import LineChart from "../../LineChart";
import "./index.css";
import LineIcon from "../../../icons/Line";
import AddIcon from "../../../icons/Add";
import ArrowIcon from "../../../icons/Arrow";
import { TimeSeries } from "../../../types";
import { removeSelectedSymbol, removeUnselectedSymbol } from "../../../app/slice/datasetSlice";
import { useEffect, useState } from "react";

export default function Exploration() {
    const symbolData = useAppSelector((state) => state.dataset.dataset?.symbolData) || {};
    const selectedSymbols = useAppSelector((state) => state.dataset.dataset?.selectedSymbols) || [];
    const unselectedSymbols = useAppSelector((state) => state.dataset.dataset?.unselectedSymbols) || [];
    const dispatch = useAppDispatch();
    const [renderedCharts, setRenderedCharts] = useState({ selectedData: 0, unSelectedData: 0 });
    const ratio = useAppSelector((state) => state.states.aspectRatio);

    const selectedData = selectedSymbols?.map((symbol): [string, TimeSeries] => [symbol, symbolData[symbol]]);
    const unSelectedData = unselectedSymbols?.map((symbol): [string, TimeSeries] => [symbol, symbolData[symbol]]);
    const allData = { selectedData, unSelectedData };

    useEffect(() => {
        const incrementRender = () => {
            setRenderedCharts((prev) => {
                const newSelectedCount = Math.min(prev.selectedData + 1, selectedData.length);
                const newUnselectedCount = Math.min(prev.unSelectedData + 1, unSelectedData.length);
                if (newSelectedCount === selectedData.length && newUnselectedCount === unSelectedData.length) {
                    clearInterval(interval);
                }
                return {
                    selectedData: newSelectedCount,
                    unSelectedData: newUnselectedCount,
                };
            });
        };
        const interval = setInterval(incrementRender, 16);
        return () => clearInterval(interval);
    }, [selectedData?.length, unSelectedData?.length]);

    return (
        <div className="explore">
            {Object.entries(allData).map(([type, record]) => {
                return (
                    <div className="explore-on explore-item" key={type}>
                        <h3 className="explore-item-title">
                            <span>{type === "selectedData" ? "" : "Not"} Under Exploration</span>
                            <div className="tools">
                                <button><AddIcon /></button>
                                <button><LineIcon /></button>
                                <button><ArrowIcon /></button>
                            </div>
                        </h3>
                        <div className="explore-item-content">
                            {record.slice(0, renderedCharts[type as keyof typeof renderedCharts]).map(([key, { x, y }]) => (
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