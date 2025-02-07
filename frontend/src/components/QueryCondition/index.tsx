import { Button, Divider } from "antd";
import "./index.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useEffect, useMemo, useState } from "react";
import { getFragmentsBySpec } from "../../api";
import { setQueryResults } from "../../app/slice/approximation";
import { addQuerySpec, setIsDrawer } from "../../app/slice/stateSlice";
import { deepClone } from "../../utils/deepclone";
import Target from "../NlqueryBox/Target";
import Scope from "../NlqueryBox/Scope";
import Relation from "../NlqueryBox/Relation";
import Trend from "../NlqueryBox/Trend";
import Panel from "../Panel";
import { RightOutlined } from "@ant-design/icons";
import { classnames } from "../../utils/classname";

export default function QueryCondition() {
    const querySpec = useAppSelector((state) => state.states.querySpec);
    const memoizedQuerySpec = useMemo(() => deepClone(querySpec) || {
        target: "",
        trends: [],
        relations: [],
    }, [querySpec]);
    const values = useAppSelector((state) => state.dataset.dataset?.valueColumns) || [];
    const [queryCondition, setQueryCondition] = useState(memoizedQuerySpec);
    const dispatch = useAppDispatch();
    const data = useAppSelector((state) => state.dataset.dataset?.data) || {};
    const value = data[memoizedQuerySpec.target || ""] as number[] || [];
    const maxValue = Math.floor(Math.max(...value));
    const minValue = Math.ceil(Math.min(...value));
    const isDrawer = useAppSelector((state) => state.states.isDrawer);

    useEffect(() => {
        setQueryCondition(deepClone(memoizedQuerySpec));
    }, [memoizedQuerySpec])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(queryCondition);
        getFragmentsBySpec(queryCondition).then((res) => {
            dispatch(setQueryResults(res));
            dispatch(addQuerySpec(queryCondition));
        });
    };

    return (
        <Panel className={classnames(isDrawer ? "active" : "hide", "query-condition")} title="Query Specification" right={<RightOutlined onClick={() => { dispatch(setIsDrawer(!isDrawer)) }}></RightOutlined>}>
            <form onSubmit={handleSubmit}>
                <section>
                    <Target value={queryCondition.target || ""} options={values} onChange={(val) => {
                        const newQueryCondition = deepClone(queryCondition);
                        newQueryCondition.target = val;
                        setQueryCondition(newQueryCondition);
                    }}></Target>
                    <Divider></Divider>
                </section>
                <section>
                    <Trend isEdit={true} trends={queryCondition.trends || []} minValue={minValue} maxValue={maxValue} onChange={(trends) => {
                        const newQueryCondition = deepClone(queryCondition);
                        newQueryCondition.trends = trends;
                        setQueryCondition(newQueryCondition);
                    }}></Trend>
                </section>
                <section>
                    <Relation isEdit={true} relations={queryCondition.relations || []} idLength={queryCondition.trends?.length || 0} onChange={(relations) => {
                        const newQueryCondition = deepClone(queryCondition);
                        newQueryCondition.relations = relations;
                        setQueryCondition(newQueryCondition);
                    }}></Relation>
                </section>
                <section>
                    <Scope title="Time Span Condition" min={queryCondition.time_span_condition?.min?.value || null} max={queryCondition.time_span_condition?.max?.value || null} minInclusive={!!queryCondition.time_span_condition?.min?.inclusive} maxInclusive={!!queryCondition.time_span_condition?.max?.inclusive} onChange={(min, max, minInclusive, maxInclusive) => {
                        const newQueryCondition = deepClone(queryCondition);
                        newQueryCondition.time_span_condition = {
                            min: !min ? null : { value: min, inclusive: minInclusive },
                            max: !max ? null : { value: max, inclusive: maxInclusive }
                        };
                        setQueryCondition(newQueryCondition);
                    }}></Scope>
                    <Divider></Divider>
                </section>
                <section>
                    <Scope key={queryCondition.time_scope_condition?.min?.value || queryCondition.time_span_condition?.max?.value} title="Time Scope Condition" min={queryCondition.time_scope_condition?.min?.value || null} max={queryCondition.time_scope_condition?.max?.value || null} minInclusive={!!queryCondition.time_scope_condition?.min?.inclusive} maxInclusive={!!queryCondition.time_scope_condition?.max?.inclusive} onChange={(min, max, minInclusive, maxInclusive) => {
                        const newQueryCondition = deepClone(queryCondition);
                        newQueryCondition.time_scope_condition = {
                            min: !min ? null : { value: min, inclusive: minInclusive },
                            max: !max ? null : { value: max, inclusive: maxInclusive }
                        };
                        setQueryCondition(newQueryCondition);
                    }}></Scope>
                    <Divider></Divider>
                </section>
                <section>
                    <Scope key={queryCondition.value_scope_condition?.min?.value || queryCondition.time_scope_condition?.max?.value} title="Value Scope Condition" min={queryCondition.value_scope_condition?.min?.value || null} max={queryCondition.value_scope_condition?.max?.value || null} minInclusive={!!queryCondition.value_scope_condition?.min?.inclusive} maxInclusive={!!queryCondition.value_scope_condition?.max?.inclusive} minValue={minValue} maxValue={maxValue} onChange={(min, max, minInclusive, maxInclusive) => {
                        const newQueryCondition = deepClone(queryCondition);
                        newQueryCondition.value_scope_condition = {
                            min: !min ? null : { value: min, inclusive: minInclusive },
                            max: !max ? null : { value: max, inclusive: maxInclusive }
                        };
                        setQueryCondition(newQueryCondition);
                    }}></Scope>
                </section>
                <section className="center">
                    <Button type="primary" htmlType="submit">
                        Confirm!
                    </Button>
                </section>
            </form>
        </Panel>
    );
}
