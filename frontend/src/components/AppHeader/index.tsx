import SettingIcon from "../../icons/Setting";
import "./index.css";

function AppHeader() {
  return (
    <header className="header">
      <div className="header-left">
      </div>
      <h1 className="header-title">ChronoMantic</h1>
      <div className="header-right">
        <SettingIcon />
      </div>
    </header>
  );
}

export default AppHeader;
