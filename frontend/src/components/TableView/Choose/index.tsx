import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import "./index.css";
import { DatasetColumn, setColumn, setSymbolData } from "../../../app/slice/datasetSlice";
import SelectItem from "../../SelectItem";
import { processDataset } from "../../../api";

export default function Choose() {
    const filename = useAppSelector((state) => state.dataset.dataset?.filename);
    const timeStampColumn = useAppSelector((state) => state.dataset.dataset?.timeStampColumn);
    const valueColumn = useAppSelector((state) => state.dataset.dataset?.valueColumn);
    const idColumn = useAppSelector((state) => state.dataset.dataset?.idColumn);
    const data = useAppSelector((state) => state.dataset.dataset?.data) || {};
    const choices = Object.keys(data);
    const [chooseColumn, setChooseColumn] = useState({ timeStampColumn: { value: timeStampColumn, title: "Time_Stamp Column" }, valueColumn: { value: valueColumn, title: "Value Column" }, idColumn: { value: idColumn, title: "ID Column" } });
    const dispatch = useAppDispatch();

    const setChoiseColumn = (column: typeof chooseColumn[keyof typeof chooseColumn], value: string) => {
        column.value = value;
        setChooseColumn({ ...chooseColumn });
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const columns = Object.fromEntries(Object.entries(chooseColumn).map(([key, column]) => {
            if (!column.value) throw new Error(`Please choose ${column.title}`);
            return [key as keyof DatasetColumn, column.value];
        }))
        const { timeStampColumn, valueColumn, idColumn } = columns;
        dispatch(setColumn({ timeStampColumn, valueColumn, idColumn }));
        processDataset(filename!, timeStampColumn, valueColumn, idColumn).then(({ timeSeriesDataset }) => {
            dispatch(setSymbolData(timeSeriesDataset));
        })
    }

    return <form className="choose" onSubmit={handleSubmit}>
        <h3>Received dataset: <i>{filename}</i></h3>
        {Object.values(chooseColumn).map((column) => <SelectItem key={column.title} choices={choices} value={column.value || ""} title={column.title} handleSelect={(val) => setChoiseColumn(column, val)}></SelectItem>)}
        <button className="submit-btn">Confirm!</button>
    </form>;
};