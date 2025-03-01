import { useEffect } from 'react';
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
    const current = useAppSelector(state => state.approximation.current);
    const startIndex = current?.segments.at(0)?.start_idx ?? 0;
    const endIndex = current?.segments.at(-1)?.end_idx ?? rowCount - 1;
    const dispatch = useAppDispatch();

    useEffect(() => {
        const tableContent = document.querySelector(".table-content .table-content");
        if (tableContent && current) {
            setTimeout(() => {
                const rowHeight = 31;
                const scrollPosition = startIndex * rowHeight;
                tableContent.scrollTo({
                    top: scrollPosition,
                    left: headers.indexOf(source ?? "") * 120 - 120,
                    behavior: "smooth"
                });
            }, 100);
        }
    }, [current, startIndex, source, headers]);

    return (
        <div className="table-content">
            <table>
                <thead>
                    <tr>
                        <th></th>
                        {headers.map(header => <th style={{backgroundColor: source === header ? "#C5D7EF" : ""}} className={classnames(header !== timeCol ? "table-header" : "")} key={header}>{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rowCount }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            <td>{rowIndex}</td>
                            {headers.map((_, colIndex) => (
                                <td key={colIndex} style={{backgroundColor: source === headers[colIndex] && rowIndex >= startIndex && rowIndex <= endIndex ? "#C5D7EF" : ""}}>{colIndex === 0 ? formatTime(csvData[headers[colIndex]]?.[rowIndex]) : csvData[headers[colIndex]]?.[rowIndex]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
};