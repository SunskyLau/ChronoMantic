import { useAppSelector } from '../../../app/hooks';
import { formatTime } from '../../../utils/time';
import CsvLoader from '../../CsvLoader';
import "./index.css";

export default function TableViewContent() {
    const csvData = useAppSelector((state) => state.dataset.dataset?.data) || {};
    const timeCol = useAppSelector((state) => state.dataset.dataset?.timeStamp) || [];
    const timeColName = useAppSelector((state) => state.dataset.dataset?.timeStampColumnName);
    const headers = [timeColName, ...Object.keys(csvData)];
    const cols = [timeCol, ...Object.values(csvData)];
    const rowCount = cols[0]?.length || 0;

    return rowCount ? (
        <div className="table-content">
            <table>
                <thead>
                    <tr>
                        <th></th>
                        {headers.map(header => <th key={header}>{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rowCount }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            <td>{rowIndex}</td>
                            {headers.map((_, colIndex) => (
                                <td key={colIndex}>{colIndex === 0 ? formatTime(cols[colIndex][rowIndex]) : cols[colIndex][rowIndex]?.toFixed(2)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div className="table-upload">
            <CsvLoader></CsvLoader>
        </div>
    );
};