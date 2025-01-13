import Panel from "../Panel";
import DocumentIcon from "../../icons/Document";
import NlqueryBox from "../NlqueryBox";
import "./index.css";
import { classnames } from "../../utils/classname";
import QueryCondition from "../QueryCondition";
import Recommendation from "../Recommendation";

export default function QueryPanel({ className }: { className?: string }) {
    return (
        <Panel className={classnames("query-panel", className)} icon={<DocumentIcon />} title="Query Panel">
            <NlqueryBox></NlqueryBox>
            <Recommendation></Recommendation>
            <QueryCondition></QueryCondition>
        </Panel>
    );
}