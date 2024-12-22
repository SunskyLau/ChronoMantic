import { useAppSelector } from "../../app/hooks";
import NlqueryBox from "../../components/NlqueryBox";
import ResultsPanel from "../../components/ResultsPanel";
import TableView from "../../components/TableView";
import AppHeader from "../AppHeader";
import ConstraintDefinition from "../ConstraintDefinition";
import OverView from "../OverView";
import QueryCondition from "../QueryCondition";
import ResultList from "../ResultList";
import Setting from "../Setting";
import "./index.css";

export default function AppMain() {
    const isSettingShow = useAppSelector(state => state.states.isSettingShow);
    return (
        <>
            <main className="main">
                <section className="main-left">
                    <TableView />
                </section>
                <section className="main-body">
                    <AppHeader />
                    <NlqueryBox />
                    <ResultList />
                    <ResultsPanel className="main-body-results" />
                </section>
                <section className="main-right">
                    <QueryCondition />
                    <OverView />
                    <ConstraintDefinition />
                </section>
            </main>
            {isSettingShow && <Setting></Setting>}
        </>
    )
}