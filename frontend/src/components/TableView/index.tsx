import Panel from "../Panel";
import TableViewContent from "./TableContent";
import TableIcon from "../../icons/Table";

export default function TableView() {
    return (
        <Panel icon={<TableIcon />} title="Table">
            <TableViewContent />
        </Panel>
    )
}