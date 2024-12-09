import CsvLoader from "../CsvLoader";
import SettingIcon from "../../icons/Setting";
import "./index.css";

function AppHeader() {
  return (
    <header className="header">
      <div className="header-left">
        <CsvLoader />
      </div>
      <h1 className="header-title">NL4TS</h1>
      <div className="header-right">
        <SettingIcon />
      </div>
    </header>
  );
}

export default AppHeader;
