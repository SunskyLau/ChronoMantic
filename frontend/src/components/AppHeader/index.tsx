import { useAppDispatch } from "../../app/hooks";
import { setIsSettingShow } from "../../app/slice/setting";
import SettingIcon from "../../icons/Setting";
import CsvLoader from "../CsvLoader";
import "./index.css";
function AppHeader() {
  const dispatch = useAppDispatch();
  return (
    <header className="header">
      <div className="header-left">
        <CsvLoader></CsvLoader>
        {/* <div onClick={() => dispatch(setIsSettingShow(true))}>
          <SettingIcon />
        </div> */}
      </div>
      <h1 className="header-title">ChronoMantic</h1>
      <div className="header-right"></div>
    </header>
  );
}

export default AppHeader;
