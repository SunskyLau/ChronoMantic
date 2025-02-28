import { useAppSelector } from "../../app/hooks";
import ResultsPanel from "../../components/ResultsPanel";
import { classnames } from "../../utils/classname";
import Setting from "../Setting";
import "./index.css";
import NlqueryBox from "../NlqueryBox";

export default function AppMain() {
    const isSettingShow = useAppSelector(state => state.setting.isSettingShow);

    return (
        <>
            <main className="main">
                <section className={classnames("main-middle")}>
                    <NlqueryBox></NlqueryBox>
                    <ResultsPanel className="main-results" />
                </section>
            </main>
            {isSettingShow && <Setting></Setting>}
        </>
    )
}