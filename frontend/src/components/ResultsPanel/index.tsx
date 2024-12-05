import "./index.css";
import ResultsHeader from "./ResultsHeader";
import ResultsContent from "./ResultsContent";

export default function ResultsPanel() {
  return (
    <div id="results-panel">
      <ResultsHeader />
      <ResultsContent />
    </div>
  );
}