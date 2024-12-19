import { useAppDispatch } from "../../app/hooks";
import { setIsSettingShow } from "../../app/slice/stateSlice";
import SettingIcon from "../../icons/Setting";
import "./index.css";

function AppHeader() {
  const dispatch = useAppDispatch();
  return (
    <header className="header">
      <div className="header-left">
      </div>
      <h1 className="header-title">ChronoMantic</h1>
      <div className="header-right" onClick={() => dispatch(setIsSettingShow())}>
        <SettingIcon />
      </div>
    </header>
  );
}

export default AppHeader;
