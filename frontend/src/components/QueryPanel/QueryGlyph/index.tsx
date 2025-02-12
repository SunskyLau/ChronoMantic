import { classnames } from "../../../utils/classname";
import { Popover } from "antd";
import QueryCondition from "../../QueryCondition";
import Glyph from "../../NlqueryBox/Glyph";
import { flushSync } from "react-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setCurRelation, setCurTrend } from "../../../app/slice/stateSlice";

export default function QueryGlyph({ className }: { className?: string }) {
    const dispatch = useAppDispatch();
    const querySpec = useAppSelector(state => state.states.querySpec);
    const curTrend = useAppSelector(state => state.states.curTrend);
    const curRelation = useAppSelector(state => state.states.curRelation);

    return (<div className={classnames("glyph", className)}>
        <button type="button" className="btn" style={{ width: 'fit-content' }}>
            <Popover rootClassName="glyph-popover" trigger={["hover"]} content={<QueryCondition></QueryCondition>}>
                <div className="pointer flex"><Glyph onClick={(type, index) => {
                    switch (type) {
                        case "Trend":
                            flushSync(() => dispatch(setCurTrend(null)))
                            dispatch(setCurTrend(index))
                            break;
                        case "Relation":
                            flushSync(() => dispatch(setCurRelation(null)))
                            dispatch(setCurRelation(index))
                            break;
                        default:
                            break;
                    }
                }} height={48} trends={querySpec?.trends || []} allTrends={querySpec?.trends || []} relations={querySpec?.relations || []} curTrend={curTrend ?? -1} curRelation={curRelation ?? -1}></Glyph></div>
            </Popover>
        </button>
    </div>)
}