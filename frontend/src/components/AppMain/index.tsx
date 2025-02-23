import { useAppSelector } from "../../app/hooks";
import ResultsPanel from "../../components/ResultsPanel";
import { classnames } from "../../utils/classname";
import DetailView from "../DetailView";
import Setting from "../Setting";
import TableView from "../TableView";
import "./index.css";
import QueryPanel from "../QueryPanel";

export default function AppMain() {
    const isSettingShow = useAppSelector(state => state.setting.isSettingShow);

    return (
        <>
            <main className="main">
                <section className="main-left">
                    <QueryPanel></QueryPanel>
                    <TableView></TableView>
                </section>
                <section className={classnames("main-right")}>
                    <ResultsPanel className="main-results" />
                    <DetailView></DetailView>
                </section>
            </main>
            {isSettingShow && <Setting></Setting>}
        </>
    )
}