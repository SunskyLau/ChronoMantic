import { useAppSelector } from "../../app/hooks";
import ResultsPanel from "../../components/ResultsPanel";
import { classnames } from "../../utils/classname";
import DetailView from "../DetailView";
import NlqueryBox from "../NlqueryBox";
import Setting from "../Setting";
import TableView from "../TableView";
import "./index.css";
import Recommendation from "../Recommendation";

export default function AppMain() {
    const isSettingShow = useAppSelector(state => state.states.isSettingShow);

    return (
        <>
            <main className="main">
                <section className="main-left">
                    <TableView></TableView>
                    <ResultsPanel className="main-results" />
                </section>
                <section className="main-middle">
                    <NlqueryBox></NlqueryBox>
                    <Recommendation></Recommendation>
                    <DetailView></DetailView>
                </section>
                <section className={classnames("main-right", "hide")}>
                </section>
            </main>
            {isSettingShow && <Setting></Setting>}
        </>
    )
}