import "./App.css";
import NlqueryBox from "./components/NlqueryBox";
import AppHeader from "./components/AppHeader";
import CsvLoader from "./components/CsvLoader";
import ResultsPanel from "./components/ResultsPanel";

function App() {
  return (
    <div id="app">
      <AppHeader />
      <NlqueryBox />
      <CsvLoader />
      <ResultsPanel />
    </div>
  );
}

export default App;
