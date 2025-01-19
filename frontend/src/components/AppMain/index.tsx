import { useAppSelector } from "../../app/hooks";
import ResultsPanel from "../../components/ResultsPanel";
import DetailView from "../DetailView";
import NlqueryBox from "../NlqueryBox";
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
                    <ResultsPanel className="main-results" />
                </section>
                {/* <section className="main-middle">
                </section> */}
                <section className="main-right">
                    <NlqueryBox></NlqueryBox>
                    <DetailView></DetailView>
                </section>
            </main>
            {isSettingShow && <Setting></Setting>}
        </>
    )
}