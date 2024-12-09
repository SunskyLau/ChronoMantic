import Panel from "../Panel";
import "./index.css";
import { useAppSelector } from "../../app/hooks";
import LineChart from "../LineChart";

export default function OverView() {
    const dataset = useAppSelector((state) => state.dataset.dataset);
    const columnName = useAppSelector((state) => state.states.querySpec?.valueColumnName) || "";
    const ratio = useAppSelector((state) => state.states.ratio);
    const xData = dataset?.timeStamp || [];
    const yData = columnName && dataset?.data[columnName] || [];

    return (
        <Panel title="Overview" className="overview">
            <LineChart xData={xData} yData={yData} ratio={ratio} title={columnName} />
        </Panel>
    )
}