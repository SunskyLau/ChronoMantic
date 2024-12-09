import NlqueryBox from "../../components/NlqueryBox";
import ResultsPanel from "../../components/ResultsPanel";
import TableView from "../../components/TableView";
import OverView from "../OverView";
import SearchTree from "../SearchTree";
import "./index.css";

export default function AppMain() {
    return (
        <main className="main">
            <section className="main-left">
                <TableView />
            </section>
            <section className="main-body">
                <NlqueryBox />
                <ResultsPanel className="main-body-results" />
            </section>
            <section className="main-right">
                <OverView />
                <SearchTree className="main-right-search" />
            </section>
        </main>
    )
}