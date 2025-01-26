import { LeftOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setIsDrawer, setIsSettingShow } from "../../app/slice/stateSlice";
import SettingIcon from "../../icons/Setting";
import CsvLoader from "../CsvLoader";
import "./index.css";
import { classnames } from "../../utils/classname";
import { Flex, Typography } from "antd";

function AppHeader() {
  const dispatch = useAppDispatch();
  const isDrawer = useAppSelector((state) => state.states.isDrawer);
  return (
    <header className="header">
      <div className="header-left">
        <CsvLoader></CsvLoader>
        <div onClick={() => dispatch(setIsSettingShow())}>
          <SettingIcon />
        </div>
      </div>
      <h1 className="header-title">ChronoMantic</h1>
      <div className="header-right">
        <Flex gap={8} align="center" justify="flex-end" onClick={() => { dispatch(setIsDrawer(!isDrawer)) }} >
          <Typography.Text>QuerySpec</Typography.Text>
          <LeftOutlined className={classnames(isDrawer ? "active" : "hide", "icon")} />
        </Flex>
      </div>
    </header>
  );
}

export default AppHeader;
