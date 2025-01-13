import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setSource } from '../../../app/slice/approximation';
import { classnames } from '../../../utils/classname';
import { formatTime } from '../../../utils/time';
import "./index.css";
export default function TableViewContent() {
    const csvData = useAppSelector((state) => state.dataset.dataset?.data) || {};
    const timeCol = useAppSelector(state => state.dataset.dataset?.timeStampColumn);
    const source = useAppSelector(state => state.approximation.source);
    const headers = Object.keys(csvData);
    const rowCount = csvData[headers[0]]?.length || 0;
    const dispatch = useAppDispatch();
    return (
        <div className="table-content">
            <table>
                <thead>
                    <tr>
                        <th></th>
                        {headers.map(header => <th style={{backgroundColor: source === header ? "red" : ""}} className={classnames(header !== timeCol ? "table-header" : "")} key={header} onClick={() => {
                            if (header !== timeCol) dispatch(setSource(header));
                        }}>{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rowCount }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            <td>{rowIndex}</td>
                            {headers.map((_, colIndex) => (
                                <td key={colIndex}>{colIndex === 0 ? formatTime(csvData[headers[colIndex]]?.[rowIndex]) : csvData[headers[colIndex]]?.[rowIndex]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
};