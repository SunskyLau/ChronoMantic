import Panel from "../Panel";
import TableIcon from "../../icons/Table";
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import "./index.css";
import TableViewContent from "./TableViewContent";
import { ChartView } from "./ChartView";
import LevelController from "../LevelController";
import { setLevel } from "../../app/slice/datasetSlice";
import CsvLoader from "../CsvLoader";

enum TableState {
    UPLOAD,
    TABLE,
    CHART
}

export default function TableView() {
    const dataset = useAppSelector((state) => state.dataset.dataset);
    const level = useAppSelector((state) => state.dataset.level);
    const dispatch = useAppDispatch();
    const state = !dataset ? TableState.UPLOAD : TableState.TABLE;

    const renderComponent = (state: TableState) => {
        switch (state) {
            case TableState.UPLOAD:
                return <div className="table-upload"><CsvLoader></CsvLoader></div>;
            case TableState.TABLE:
                return <div className="table-content"><TableViewContent></TableViewContent></div>;
            case TableState.CHART:
                return <div className="table-content"><ChartView></ChartView></div>;
        }
    }

	const maxLevel = useAppSelector((state) => Object.values(state.approximation.results ?? {}).at(-1)?.max_approximation_level);

    return (
        <Panel className="table-view" icon={<TableIcon />} title="Data Table">
            {renderComponent(state)}
        </Panel>
    )
}