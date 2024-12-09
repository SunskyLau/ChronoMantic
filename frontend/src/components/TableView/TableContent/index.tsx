import { useAppSelector } from '../../../app/hooks';
import "./index.css";

export default function TableViewContent() {
    const csvData = useAppSelector((state) => state.dataset.dataset?.data) || {};
    const headers = Object.keys(csvData);
    const cols = Object.values(csvData);
    const rowCount = cols[0]?.length || 0;

    return (
        <div className="table-content">
            {headers.length > 0 && (
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
                                    <td key={colIndex}>{cols[colIndex][rowIndex].toFixed(2)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};