import { Button, Checkbox, InputNumber, Select } from "antd";
import { Comparator, QuerySpec, Attribute } from "../../types/QuerySpec";
import "./index.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useState } from "react";
import { ArrowRightOutlined, MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { getFragmentsBySpec } from "../../api";
import Block from "../Block";
import { setQueryResults } from "../../app/slice/approximation";
import { addQuerySpec } from "../../app/slice/stateSlice";
import { deepClone } from "../../utils/deepclone";

export default function QueryCondition() {
    const querySpec: QuerySpec = useAppSelector((state) => state.states.querySpecList.at(state.states.querySpecIndex)) || {
        target: "",
        trends: [],
        relations: [],
    };
    const values = useAppSelector((state) => {
        const arr = new Set(Object.keys(state.dataset.dataset?.data ?? {}));
        arr.delete(state.dataset.dataset?.timeStampColumn ?? "");
        return [...arr];
    });
    const [queryCondition, setQueryCondition] = useState({ ...querySpec });
    const dispatch = useAppDispatch();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(queryCondition);
        getFragmentsBySpec(queryCondition).then((res) => {
            dispatch(setQueryResults(res));
            dispatch(addQuerySpec(queryCondition));
        });
    };

    return (
        <Block className="query-condition" title="Query Specification">
            <form onSubmit={handleSubmit}>
                <h3>Query</h3>
                <section>
                    <span className="query-condition-title">Target</span>
                    <Select
                        allowClear
                        popupMatchSelectWidth={false}
                        value={queryCondition.target}
                        onChange={(value) => {
                            const newQueryCondition = deepClone(queryCondition);
                            newQueryCondition.target = value;
                            setQueryCondition(newQueryCondition);
                        }}
                        options={values.map((value) => ({ value }))}
                    ></Select>
                </section>
                <section>
                    <span className="query-condition-title">Trends</span>
                    <button
                        type="button"
                        className="add-btn"
                        onClick={() => {
                            const newQueryCondition = deepClone(queryCondition);
                            if (!newQueryCondition.trends) newQueryCondition.trends = [];
                            newQueryCondition.trends.push({
                                angle_scope_condition: undefined,
                                slope_scope_condition: undefined,
                                time_scope_condition: undefined,
                                time_span_condition: undefined
                            });
                            setQueryCondition(newQueryCondition);
                        }}
                    >
                        <PlusCircleOutlined />
                    </button>
                    <ul>
                        {queryCondition.trends?.map((trend, index) => (
                            <li key={index}>
                                {Object.keys(trend).map((key) => {
                                    const k = key as keyof typeof trend;
                                    return (<>
                                        <InputNumber
                                            placeholder={key + ' min'}
                                            style={{ width: '35%' }}
                                            value={trend[k]?.min?.value}
                                            onChange={(value) => {
                                                const newQueryCondition = deepClone(queryCondition);
                                                if (!newQueryCondition.trends![index][k]) {
                                                    newQueryCondition.trends![index][k] = {};
                                                }
                                                if (!value) {
                                                    delete newQueryCondition.trends![index][k].min;
                                                } else {
                                                    newQueryCondition.trends![index][k]!.min = {
                                                        value: value,
                                                        inclusive: false
                                                    };
                                                }
                                                setQueryCondition(newQueryCondition);
                                            }}
                                        ></InputNumber>
                                        <Checkbox checked={trend[k]?.min?.inclusive} disabled={!trend[k]?.min?.value} onChange={(e) => {
                                            const newQueryCondition = deepClone(queryCondition);
                                            newQueryCondition.trends![index][k]!.min!.inclusive = e.target.checked;
                                            setQueryCondition(newQueryCondition);
                                        }}></Checkbox>
                                        <i><ArrowRightOutlined></ArrowRightOutlined></i>
                                        <InputNumber
                                            placeholder={key + ' max'}
                                            style={{ width: '35%' }}
                                            value={trend[k]?.max?.value}
                                            onChange={(value) => {
                                                const newQueryCondition = deepClone(queryCondition);
                                                if (!newQueryCondition.trends![index][k]) {
                                                    newQueryCondition.trends![index][k] = {};
                                                }
                                                if (!value) {
                                                    delete newQueryCondition.trends![index][k].max;
                                                } else {
                                                    newQueryCondition.trends![index][k]!.max = {
                                                        value: value,
                                                        inclusive: false
                                                    };
                                                }
                                                setQueryCondition(newQueryCondition);
                                            }}
                                        ></InputNumber>
                                        <Checkbox checked={trend[k]?.max?.inclusive} disabled={!trend[k]?.max?.value} onChange={(e) => {
                                            const newQueryCondition = deepClone(queryCondition);
                                            newQueryCondition.trends![index][k]!.max!.inclusive = e.target.checked;
                                            setQueryCondition(newQueryCondition);
                                        }}></Checkbox>
                                    </>)
                                })}
                                <button
                                    type="button"
                                    className="del-btn"
                                    onClick={() => {
                                        const newQueryCondition = deepClone(queryCondition);
                                        newQueryCondition.trends?.splice(index, 1);
                                        setQueryCondition(newQueryCondition);
                                    }}
                                >
                                    <MinusCircleOutlined />
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
                <section>
                    <span className="query-condition-title">Relations</span>
                    <button
                        type="button"
                        className="add-btn"
                        onClick={() => {
                            const newQueryCondition = deepClone(queryCondition);
                            if (!newQueryCondition.relations) newQueryCondition.relations = [];
                            newQueryCondition.relations.push({
                                id1: undefined,
                                id2: undefined,
                                attribute: undefined,
                                comparator: undefined
                            });
                            setQueryCondition(newQueryCondition);
                        }}
                    >
                        <PlusCircleOutlined />
                    </button>
                    <ul>
                        {queryCondition.relations?.map((relation, index) => (
                            <li key={index}>
                                <Select placeholder={'attribute'} style={{ width: '100%' }} options={Object.values(Attribute).map(attr => ({ value: attr, label: attr }))} value={relation.attribute} onChange={(value) => {
                                    const newQueryCondition = deepClone(queryCondition);
                                    newQueryCondition.relations![index].attribute = value;
                                    setQueryCondition(newQueryCondition);
                                }}></Select>
                                <Select
                                    placeholder={'id1'}
                                    style={{ width: '30%' }}
                                    value={relation.id1}
                                    options={Array.from({ length: queryCondition.trends?.length ?? 0 }, (_, i) => ({
                                        value: i
                                    }))}
                                    onChange={(value) => {
                                        const newQueryCondition = deepClone(queryCondition);
                                        newQueryCondition.relations![index].id1 = value || 0;
                                        setQueryCondition(newQueryCondition);
                                    }}
                                ></Select>
                                <Select style={{ width: '30%' }} placeholder={'comparator'} options={Object.values(Comparator).map(attr => ({ value: attr, label: attr }))} value={relation.comparator} onChange={(value) => {
                                    const newQueryCondition = deepClone(queryCondition);
                                    newQueryCondition.relations![index].comparator = value;
                                    setQueryCondition(newQueryCondition);
                                }} />
                                <Select
                                    placeholder={'id2'}
                                    style={{ width: '30%' }}
                                    value={relation.id2}
                                    options={Array.from({ length: queryCondition.trends?.length ?? 0 }, (_, i) => ({
                                        value: i
                                    }))}
                                    onChange={(value) => {
                                        const newQueryCondition = deepClone(queryCondition);
                                        newQueryCondition.relations![index].id2 = value || 0;
                                        setQueryCondition(newQueryCondition);
                                    }}
                                ></Select>
                                <button
                                    type="button"
                                    className="del-btn"
                                    onClick={() => {
                                        const newQueryCondition = deepClone(queryCondition);
                                        newQueryCondition.relations?.splice(index, 1);
                                        setQueryCondition(newQueryCondition);
                                    }}
                                >
                                    <MinusCircleOutlined />
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
                <section>
                    <p className="query-condition-title">Time Span Condition</p>
                    <InputNumber placeholder={'min'} style={{ width: '30%' }} value={queryCondition.time_span_condition?.min?.value} onChange={(value) => {
                        const newQueryCondition = deepClone(queryCondition);
                        if (!newQueryCondition.time_span_condition) {
                            newQueryCondition.time_span_condition = {};
                        }
                        if (!value) {
                            delete newQueryCondition.time_span_condition.min;
                        } else {
                            newQueryCondition.time_span_condition!.min = {
                                value,
                                inclusive: false
                            }
                        }
                        setQueryCondition(newQueryCondition);
                    }} />
                    <Checkbox checked={queryCondition.time_span_condition?.min?.inclusive} disabled={!queryCondition.time_span_condition?.min} onChange={(e) => {
                        const newQueryCondition = deepClone(queryCondition);
                        newQueryCondition.time_span_condition!.min!.inclusive = e.target.checked;
                        setQueryCondition(newQueryCondition);
                    }}></Checkbox>
                    <i><ArrowRightOutlined></ArrowRightOutlined></i>
                    <InputNumber placeholder={'max'} style={{ width: '30%' }} value={queryCondition.time_span_condition?.max?.value} onChange={(value) => {
                        const newQueryCondition = deepClone(queryCondition);
                        if (!newQueryCondition.time_span_condition) {
                            newQueryCondition.time_span_condition = {};
                        }
                        if (!value) {
                            delete newQueryCondition.time_span_condition.max;
                        } else {
                            newQueryCondition.time_span_condition!.max = {
                                value,
                                inclusive: false
                            }
                        }
                        setQueryCondition(newQueryCondition);
                    }} />
                    <Checkbox checked={queryCondition.time_span_condition?.max?.inclusive} disabled={!queryCondition.time_span_condition?.max} onChange={(e) => {
                        const newQueryCondition = deepClone(queryCondition);
                        newQueryCondition.time_span_condition!.max!.inclusive = e.target.checked;
                        setQueryCondition(newQueryCondition);
                    }}></Checkbox>
                </section>
                <section>
                    <p className="query-condition-title">Time Scope Condition</p>
                    <InputNumber placeholder={'min'} style={{ width: '30%' }} value={queryCondition.time_scope_condition?.min?.value} onChange={(value) => {
                        const newQueryCondition = deepClone(queryCondition);
                        if (!newQueryCondition.time_scope_condition) {
                            newQueryCondition.time_scope_condition = {};
                        }
                        if (!value) {
                            delete newQueryCondition.time_scope_condition.min;
                        } else {
                            newQueryCondition.time_scope_condition!.min = {
                                value,
                                inclusive: false
                            }
                        }
                        setQueryCondition(newQueryCondition);
                    }} />
                    <Checkbox checked={queryCondition.time_scope_condition?.min?.inclusive} disabled={!queryCondition.time_scope_condition?.min} onChange={(e) => {
                        const newQueryCondition = deepClone(queryCondition);
                        newQueryCondition.time_scope_condition!.min!.inclusive = e.target.checked;
                        setQueryCondition(newQueryCondition);
                    }}></Checkbox>
                    <i><ArrowRightOutlined></ArrowRightOutlined></i>
                    <InputNumber placeholder={'max'} style={{ width: '30%' }} value={queryCondition.time_scope_condition?.max?.value} onChange={(value) => {
                        const newQueryCondition = deepClone(queryCondition);
                        if (!newQueryCondition.time_scope_condition) {
                            newQueryCondition.time_scope_condition = {};
                        }
                        if (!value) {
                            delete newQueryCondition.time_scope_condition.max;
                        } else {
                            newQueryCondition.time_scope_condition!.max = {
                                value,
                                inclusive: false
                            }
                        }
                        setQueryCondition(newQueryCondition);
                    }} />
                    <Checkbox checked={queryCondition.time_scope_condition?.max?.inclusive} disabled={!queryCondition.time_scope_condition?.max} onChange={(e) => {
                        const newQueryCondition = deepClone(queryCondition);
                        newQueryCondition.time_scope_condition!.max!.inclusive = e.target.checked;
                        setQueryCondition(newQueryCondition);
                    }}></Checkbox>
                </section>
                <section>
                    <p className="query-condition-title">Value Scope Condition</p>
                    <InputNumber placeholder={'min'} style={{ width: '30%' }} value={queryCondition.value_scope_condition?.min?.value} onChange={(value) => {
                        const newQueryCondition = deepClone(queryCondition);
                        if (!newQueryCondition.value_scope_condition) {
                            newQueryCondition.value_scope_condition = {};
                        }
                        if (!value) {
                            delete newQueryCondition.value_scope_condition.min;
                        } else {
                            newQueryCondition.value_scope_condition!.min = {
                                value,
                                inclusive: false
                            }
                        }
                        setQueryCondition(newQueryCondition);
                    }} />
                    <Checkbox checked={queryCondition.value_scope_condition?.min?.inclusive} disabled={!queryCondition.value_scope_condition?.min} onChange={(e) => {
                        const newQueryCondition = deepClone(queryCondition);
                        newQueryCondition.value_scope_condition!.min!.inclusive = e.target.checked;
                        setQueryCondition(newQueryCondition);
                    }}></Checkbox>
                    <i><ArrowRightOutlined></ArrowRightOutlined></i>
                    <InputNumber placeholder={'max'} style={{ width: '30%' }} value={queryCondition.value_scope_condition?.max?.value} onChange={(value) => {
                        const newQueryCondition = deepClone(queryCondition);
                        if (!newQueryCondition.value_scope_condition) {
                            newQueryCondition.value_scope_condition = {};
                        }
                        if (!value) {
                            delete newQueryCondition.value_scope_condition.max;
                        } else {
                            newQueryCondition.value_scope_condition!.max = {
                                value,
                                inclusive: false
                            }
                        }
                        setQueryCondition(newQueryCondition);
                    }} />
                    <Checkbox checked={queryCondition.value_scope_condition?.max?.inclusive} disabled={!queryCondition.value_scope_condition?.max} onChange={(e) => {
                        const newQueryCondition = deepClone(queryCondition);
                        newQueryCondition.value_scope_condition!.max!.inclusive = e.target.checked;
                        setQueryCondition(newQueryCondition);
                    }}></Checkbox>
                </section>
                <section className="center">
                    <Button type="primary" htmlType="submit">
                        Confirm!
                    </Button>
                </section>
            </form>
        </Block>
    );
}
