import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setSource } from "../../../app/slice/approximation";
import LineChart from "../../LineChart";

export function ChartView() {
    const dataset = useAppSelector((state) => state.dataset.dataset);
    const timeStampColumn = useAppSelector((state) => state.dataset.dataset?.timeStampColumn) || "";
    const xData = (dataset?.data[timeStampColumn] || []) as string[]
    const source = useAppSelector(state => state.approximation.source);
    const dispatch = useAppDispatch();

    return (dataset?.valueColumns.map((col) => {
        return <div key={col} onClick={() => { dispatch(setSource(col)) }}><LineChart isXAxisVisible isActive={source === col} height={80} margin={{ top: 20, right: 30, bottom: 10, left: 20 }} isYAxisVisible title={col} xData={xData} yData={dataset.data[col] as number[]}></LineChart></div>
    }))
}