import Panel from "../Panel";
import TableIcon from "../../icons/Table";
import { useAppSelector } from '../../app/hooks';
import CsvLoader from '../CsvLoader';
import "./index.css";
import Choose from "./Choose";
import Exploration from "./Exploration";
import TableViewContent from "./TableViewContent";
import { ChartView } from "./ChartView";

enum TableState {
    UPLOAD,
    CHOOSE,
    EXPLORATION,
    TABLE,
    CHART
}

export default function TableView() {
    const dataset = useAppSelector((state) => state.dataset.dataset);
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
        <Panel className="table-view" icon={<TableIcon />} title="Data Table">
            {renderComponent(state)}
        </Panel>
    )
}