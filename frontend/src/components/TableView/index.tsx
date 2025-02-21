import Panel from "../Panel";
import TableIcon from "../../icons/Table";
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import CsvLoader from '../CsvLoader';
import "./index.css";
import Choose from "./Choose";
import Exploration from "./Exploration";
import TableViewContent from "./TableViewContent";
import { ChartView } from "./ChartView";
import LevelController from "../LevelController";
import { setLevel } from "../../app/slice/datasetSlice";

enum TableState {
    UPLOAD,
    CHOOSE,
    EXPLORATION,
    TABLE,
    CHART
}

export default function TableView() {
    const dataset = useAppSelector((state) => state.dataset.dataset);
    const level = useAppSelector((state) => state.dataset.level);
    const dispatch = useAppDispatch();
    // const timeStampColumn = useAppSelector((state) => state.dataset.dataset?.timeStampColumn);
    // const idColumn = useAppSelector((state) => state.dataset.dataset?.idColumn);
    // const valueColumn = useAppSelector((state) => state.dataset.dataset?.valueColumn);
    // const state = !dataset ? TableState.UPLOAD : !(timeStampColumn && idColumn && valueColumn) ? TableState.CHOOSE : TableState.EXPLORATION;
    const state = !dataset ? TableState.UPLOAD : TableState.CHART;

    const renderComponent = (state: TableState) => {
        switch (state) {
            case TableState.UPLOAD:
                return <div className="table-upload"><CsvLoader></CsvLoader></div>;
            case TableState.CHOOSE:
                return <div className="table-content"><Choose></Choose></div>;
            case TableState.EXPLORATION:
                return <div className="table-content"><Exploration></Exploration></div>;
            case TableState.TABLE:
                return <div className="table-content"><TableViewContent></TableViewContent></div>;
            case TableState.CHART:
                return <div className="table-content"><ChartView></ChartView></div>;
        }
    }

    return (
        <Panel className="table-view" icon={<TableIcon />} title="Data Overview" right={<LevelController level={level} onChange={(level) => dispatch(setLevel(level))} />}>
            {renderComponent(state)}
        </Panel>
    )
}