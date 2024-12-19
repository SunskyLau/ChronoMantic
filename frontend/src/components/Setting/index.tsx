import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setAspectRatio, setIsSettingShow, setTimeStampUnit, setValueUnit } from "../../app/slice/stateSlice";
import SettingIcon from "../../icons/Setting";
import Panel from "../Panel";
import Select from "../Select";
import "./index.css";

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
                    <Select title="Time_Stamp_Unit" value={timeStampUnitState} handleSelect={setTimeStampUnitState} choices={["Day", "Month", "Season", "Year"]}></Select>
                    <Select title="Value_Unit" value={ValueUnitState} handleSelect={setValueUnitState} choices={["None", "Dollar"]}></Select>
                    <div className="choose-item">
                        <span className="choose-item-title">Aspect Ratio</span>
                        <div className="choose-item-content">
                            <input type="number" step={0.001} min={0} value={aspectRatioState} className="choose-item-content-value" onChange={(e) => setAspectRatioState(Number(e.target.value))}></input>
                        </div>
                    </div>
                    <button className="setting-form__btn">Confirm!</button>
                </form>
            </Panel>
        </div>
    )
}