import { Divider } from "antd";
import "./index.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useMemo } from "react";
import { setQuerySpec } from "../../app/slice/stateSlice";
import { deepClone } from "../../utils/deepclone";
import Target from "../NlqueryBox/Target";
import Scope from "../NlqueryBox/Scope";
import Relation from "../NlqueryBox/Relation";
import Trend from "../NlqueryBox/Trend";

export default function QueryCondition() {
    const querySpec = useAppSelector((state) => state.states.querySpec);
    const memoizedQuerySpec = useMemo(() => deepClone(querySpec) || {
        target: "",
        trends: [],
        relations: [],
    }, [querySpec]);
    const values = useAppSelector((state) => state.dataset.dataset?.valueColumns) || [];
    const dispatch = useAppDispatch();
    const data = useAppSelector((state) => state.dataset.dataset?.data) || {};
    const value = data[memoizedQuerySpec.target || ""] as number[] || [];
    const maxValue = Math.floor(Math.max(...value));
    const minValue = Math.ceil(Math.min(...value));
    const time = useAppSelector((state) => state.dataset.dataset?.data[state.dataset.dataset.timeStampColumn]) || [];
    const date = time.map(t => new Date(t).getTime())
    const minDate = Math.min(...date)
    const maxDate = Math.max(...date)
    const curTrend = useAppSelector((state) => state.states.curTrend);
    const curRelation = useAppSelector((state) => state.states.curRelation);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <form onSubmit={handleSubmit} className="query-condition">
            <section>
                <Target value={memoizedQuerySpec.target || ""} options={values} onChange={(val) => {
                    const newQuerySpec = deepClone(memoizedQuerySpec);
                    newQuerySpec.target = val;
                    dispatch(setQuerySpec(newQuerySpec))
                }}></Target>
                <Divider></Divider>
            </section>
            <section>
                <Trend highlight={curTrend ?? -1} isEdit={true} trends={memoizedQuerySpec.trends || []} minValue={minDate} maxValue={maxDate} onChange={(trends) => {
                    const newQuerySpec = deepClone(memoizedQuerySpec);
                    newQuerySpec.trends = trends;
                    dispatch(setQuerySpec(newQuerySpec))
                }}></Trend>
            </section>
            <section>
                <Relation highlight={curRelation ?? -1} isEdit={true} relations={memoizedQuerySpec.relations || []} idLength={memoizedQuerySpec.trends?.length || 0} onChange={(relations) => {
                    const newQuerySpec = deepClone(memoizedQuerySpec);
                    newQuerySpec.relations = relations;
                    dispatch(setQuerySpec(newQuerySpec))
                }}></Relation>
            </section>
            <section>
                <Scope title="Time Span Condition" min={memoizedQuerySpec.time_span_condition?.min?.value || null} max={memoizedQuerySpec.time_span_condition?.max?.value || null} minInclusive={!!memoizedQuerySpec.time_span_condition?.min?.inclusive} maxInclusive={!!memoizedQuerySpec.time_span_condition?.max?.inclusive} onChange={(min, max, minInclusive, maxInclusive) => {
                    const newQuerySpec = deepClone(memoizedQuerySpec);
                    newQuerySpec.time_span_condition = {
                        min: !min ? null : { value: min, inclusive: minInclusive },
                        max: !max ? null : { value: max, inclusive: maxInclusive }
                    };
                    dispatch(setQuerySpec(newQuerySpec))
                }}></Scope>
                <Divider></Divider>
            </section>
            <section>
                <Scope key={memoizedQuerySpec.time_scope_condition?.min?.value || memoizedQuerySpec.time_span_condition?.max?.value} title="Time Scope Condition" min={memoizedQuerySpec.time_scope_condition?.min?.value || null} max={memoizedQuerySpec.time_scope_condition?.max?.value || null} minInclusive={!!memoizedQuerySpec.time_scope_condition?.min?.inclusive} maxInclusive={!!memoizedQuerySpec.time_scope_condition?.max?.inclusive} onChange={(min, max, minInclusive, maxInclusive) => {
                    const newQuerySpec = deepClone(memoizedQuerySpec);
                    newQuerySpec.time_scope_condition = {
                        min: !min ? null : { value: min, inclusive: minInclusive },
                        max: !max ? null : { value: max, inclusive: maxInclusive }
                    };
                    dispatch(setQuerySpec(newQuerySpec))
                }}></Scope>
                <Divider></Divider>
            </section>
            <section>
                <Scope key={memoizedQuerySpec.value_scope_condition?.min?.value || memoizedQuerySpec.time_scope_condition?.max?.value} title="Value Scope Condition" min={memoizedQuerySpec.value_scope_condition?.min?.value || null} max={memoizedQuerySpec.value_scope_condition?.max?.value || null} minInclusive={!!memoizedQuerySpec.value_scope_condition?.min?.inclusive} maxInclusive={!!memoizedQuerySpec.value_scope_condition?.max?.inclusive} minValue={minValue} maxValue={maxValue} onChange={(min, max, minInclusive, maxInclusive) => {
                    const newQuerySpec = deepClone(memoizedQuerySpec);
                    newQuerySpec.value_scope_condition = {
                        min: !min ? null : { value: min, inclusive: minInclusive },
                        max: !max ? null : { value: max, inclusive: maxInclusive }
                    };
                    dispatch(setQuerySpec(newQuerySpec))
                }}></Scope>
            </section>
        </form>
    );
}
