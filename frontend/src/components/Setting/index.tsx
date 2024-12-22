import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setAspectRatio, setIsSettingShow, setTimeStampUnit, setValueUnit } from "../../app/slice/stateSlice";
import SettingIcon from "../../icons/Setting";
import Panel from "../Panel";
import SelectItem from "../SelectItem";
import "./index.css";
import { InputNumber } from "antd";

export default function Setting() {
    const dispatch = useAppDispatch()
    const timeStampUnit = useAppSelector((state) => state.states.timeStampUnit)
    const [timeStampUnitState, setTimeStampUnitState] = useState(timeStampUnit)
    const valueUnit = useAppSelector((state) => state.states.valueUnit)
    const [ValueUnitState, setValueUnitState] = useState(valueUnit)
    const aspectRatio = useAppSelector((state) => state.states.aspectRatio)
    const [aspectRatioState, setAspectRatioState] = useState(aspectRatio)
    const handleSubmit = () => {
        dispatch(setIsSettingShow())
        dispatch(setAspectRatio(aspectRatioState))
        dispatch(setTimeStampUnit(timeStampUnitState))
        dispatch(setValueUnit(ValueUnitState))
    }
    return (
        <div className="setting">
            <div className="modal" onClick={() => dispatch(setIsSettingShow())}></div>
            <Panel className="setting__inner" title="Setting" icon={<SettingIcon />}>
                <form className="setting-form" onSubmit={(e) => {e.preventDefault(); handleSubmit();}}>
                    <SelectItem title="Time_Stamp_Unit" value={timeStampUnitState} handleSelect={setTimeStampUnitState} choices={["Day", "Month", "Season", "Year"]}></SelectItem>
                    <SelectItem title="Value_Unit" value={ValueUnitState} handleSelect={setValueUnitState} choices={["None", "Dollar"]}></SelectItem>
                    <div className="choose-item">
                        <span className="choose-item-title">Aspect Ratio</span>
                        <div className="choose-item-content">
                            <InputNumber value={aspectRatioState} min={0} step={0.00001} onChange={(val)=>val &&setAspectRatioState(val)}></InputNumber>
                        </div>
                    </div>
                    <button className="setting-form__btn">Confirm!</button>
                </form>
            </Panel>
        </div>
    )
}