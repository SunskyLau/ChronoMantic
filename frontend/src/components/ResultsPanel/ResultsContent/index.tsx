import { useAppSelector } from "../../../app/hooks";
import FragmentChart from "./FragmentChart";
import "./index.css";
import Overview from "./Overview";

export interface DataType {
    date: Date;
    value: number;
}

export default function ResultsContent() {
    const dataset = useAppSelector((state) => state.dataset.dataset);
    const columnName = useAppSelector((state) => state.states.querySpec?.valueColumnName) || "";
    const ratio = useAppSelector((state) => state.states.ratio);
    const xData = dataset?.timeStamp || [];
    const yData = columnName && dataset?.data[columnName] || [];
    const currentFragments = useAppSelector((state) => state.states.currentFragments);
    const fragments = [...(currentFragments?.fragments || [])].sort((a, b) => (a.avg_loss || 0) - (b.avg_loss || 0));
    return (
        <>
            <div className="results-content">
                <div className="result-header">
                    <div className="data-name">ID</div>
                    <div className="data-score">Avg_loss</div>
                </div>
                <div className="result-item-list">
                    {fragments.map((fragment, index) => { 
                        return (
                            <div className="result-item" key={fragment.start_idx + "-" + fragment.end_idx + "-" + index}>
                                <div className="data-name">{columnName}</div>
                                <FragmentChart xData={xData} yData={yData} ratio={ratio} fragment={fragment} />
                                <Overview className="data-score">
                                    {fragment?.avg_loss?.toFixed(4)}
                                </Overview>
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    );
}