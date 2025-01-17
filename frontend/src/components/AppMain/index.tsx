import { useAppSelector } from "../../app/hooks";
import ResultsPanel from "../../components/ResultsPanel";
import DetailView from "../DetailView";
import QueryPanel from "../QueryPanel";
import Setting from "../Setting";
import TableView from "../TableView";
import "./index.css";

export default function AppMain() {
    const isSettingShow = useAppSelector(state => state.states.isSettingShow);
    return (
        <>
            <main className="main">
                <section className="main-left">
                    <TableView></TableView>
                </section>
                <section className="main-middle">
                    <QueryPanel></QueryPanel>
                </section>
                <section className="main-right">
                    <DetailView></DetailView>
                    <ResultsPanel className="main-results" />
                </section>
            </main>
            {isSettingShow && <Setting></Setting>}
        </>
    )
}