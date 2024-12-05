import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setShownColumn } from "../../../app/slice/stateSlice";
import Loading from "../../Loading";
import Overview from "./Overview";
import Detail from "./Detail";
import { useCallback } from "react";

export interface DataType {
    date: Date;
    value: number;
}

export default function ResultsContent() {
    const dispatch = useAppDispatch();
    const timeStamp = useAppSelector((state) => state.dataset.dataset?.timeStamp);
    const data = useAppSelector((state) => state.dataset.dataset?.data);
    const results = useAppSelector((state) => state.results.results);
    const isRequesting = useAppSelector((state) => state.results.isRequesting);
    const ts = useCallback((key: string): DataType[] | null => {
        if (!data || !timeStamp) return null;
        return timeStamp
            ?.map((t, i) => ({
                date: new Date(t),
                value: data[key][i],
            }))
            .filter((d) => d.value && !isNaN(d.date.getTime()) && !isNaN(d.value))
    }, [timeStamp, data])
    return (
        <>
            {isRequesting && <Loading className="center"></Loading>}
            <div id="results-content">
                {data &&
                    Object.keys(data).map((key, index) => (
                        <div className="results-list" key={index}>
                            <div className="dataName" onClick={() => { dispatch(setShownColumn(key)); }}>{key}</div>
                            <div className="result-item-list">
                                {timeStamp && <Detail name={key} results={results[key]} segments={results[key]?.map(item => item.segments)} data={ts(key) ?? []}></Detail>}
                            </div>
                            <Overview></Overview>
                        </div>
                    ))
                }
            </div>
        </>
    );
}