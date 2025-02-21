import { classnames } from "../../../utils/classname";
import { Popover } from "antd";
import QueryCondition from "../../QueryCondition";
import Glyph from "../../NlqueryBox/Glyph";
import { flushSync } from "react-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setCurRelation, setCurTrend } from "../../../app/slice/stateSlice";

export default function QueryGlyph({ className }: { className?: string }) {
    const dispatch = useAppDispatch();
    const query = useAppSelector(state => state.states.query);
    const curTrend = useAppSelector(state => state.states.curTrend);
    const curRelation = useAppSelector(state => state.states.curRelation);
    const colorMap = useAppSelector(state => state.states.colorMap);

    return (<div className={classnames("glyph", className)}>
        <Popover rootClassName="glyph-popover" trigger={["contextMenu"]} content={<QueryCondition></QueryCondition>}>
            <div className="pointer flex" style={{ width: "100%", height: "100%" }}>
                <Glyph 
                    query={query} 
                    onClick={(type, index) => {
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
                    }} 
                    height={48} 
                    target={query?.target}
                    trends={query?.trends || []} 
                    allTrends={query?.trends || []} 
                    single_relations={query?.single_relations || []} 
                    trend_groups={query?.trend_groups || []}
                    group_relations={query?.group_relations || []}
                    curTrend={curTrend ?? -1} 
                    curRelation={curRelation ?? -1} 
                    colorMap={colorMap}
                />
            </div>
        </Popover>
    </div>)
}