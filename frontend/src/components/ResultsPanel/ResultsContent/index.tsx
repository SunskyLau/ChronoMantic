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
    const results = useAppSelector((state) => state.results.results?.results);
    return (
        <>
            <div className="results-content">
                <div className="result-header">
                    <div className="data-name">ID</div>
                    <div className="data-score">Score</div>
                </div>
                <div className="result-item-list">
                    {results?.fragments?.map((fragment, index) => { 
                        return (
                            <div className="result-item">
                                <div className="data-name">{columnName}</div>
                                <FragmentChart key={index} xData={xData} yData={yData} ratio={ratio} fragment={fragment} />
                                <Overview className="data-score">
                                    {fragment.segments?.map((segment) => {
                                        return (
                                            <div key={segment.start_idx}>
                                            </div>
                                        )
                                    })}
                                </Overview>
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    );
}