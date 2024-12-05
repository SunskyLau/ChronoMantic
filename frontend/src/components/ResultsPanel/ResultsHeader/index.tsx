import DocumentIcon from "../../../icons/Document"
import "./index.css"

export default function ResultsHeader() {
    return (
        <div id="results-header">
            <DocumentIcon className="results-icon"></DocumentIcon>
            <div id="results-title">Results</div>
        </div>
    );
}