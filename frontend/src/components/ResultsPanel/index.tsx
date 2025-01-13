import ResultsContent from "./ResultsContent";
import Panel from "../Panel";
import DocumentIcon from "../../icons/Document";

export default function ResultsPanel({className}: {className?: string}) {
  return (
    <Panel className={className} icon={<DocumentIcon />} title="Results Panel">
      <ResultsContent />
    </Panel>
  );
}