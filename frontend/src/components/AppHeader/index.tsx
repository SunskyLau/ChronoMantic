import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setIsSettingShow } from "../../app/slice/setting";
import SettingIcon from "../../icons/Setting";
import CsvLoader from "../CsvLoader";
import Setting from "../Setting";
import "./index.css";

function AppHeader() {
	const dispatch = useAppDispatch();
	const isSettingShow = useAppSelector((state) => state.setting.isSettingShow);

	return (
		<>
			<header className="header">
				<div className="header-left">
					<CsvLoader></CsvLoader>
					<div onClick={() => dispatch(setIsSettingShow(true))}>
						<SettingIcon />
					</div>
				</div>
				<h1 className="header-title">ChronoMantic</h1>
				<div className="header-right"></div>
			</header>
			{isSettingShow && <Setting></Setting>}
		</>
	);
}

export default AppHeader;
