import { Button, DatePicker, InputNumber, Select } from "antd";
import { Comparator, Extent, Fragment, QuerySpec, Trend } from "../../types/QuerySpec";
import "./index.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useState } from "react";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { queryInFragments } from "../../api";
import { addFragments, addQuerySpec } from "../../app/slice/stateSlice";
import { deepClone } from "../../utils/deepclone";
import Block from "../Block";

const comparatorOptions = Object.keys(Comparator).map(key => ({
    value: Comparator[key as keyof typeof Comparator] || "",
    label: Comparator[key as keyof typeof Comparator] || "",
}));

const trendOptions = Object.keys(Trend).map(key => ({
    value: Trend[key as keyof typeof Trend] || "",
    label: Trend[key as keyof typeof Trend] || "",
}));

const extentOptions = Object.keys(Extent).map(key => ({
    value: Extent[key as keyof typeof Extent] || "",
    label: Extent[key as keyof typeof Extent] || "",
}));

export default function QueryCondition() {
    const querySpec: QuerySpec = useAppSelector(state => state.states.querySpecList.at(state.states.querySpecIndex)) || {
        patterns: null,
        y_max_condition: null,
        y_min_condition: null,
        start_time: null,
        end_time: null
    };
    const fragments = useAppSelector(state => state.states.fragmentsList[state.states.fragmentsIndex]?.[0]) || [];
    const [queryCondition, setQueryCondition] = useState({ ...querySpec });
    const selectedSymbols = useAppSelector(state => state.dataset.dataset?.selectedSymbols) || [];
    const symbolData = useAppSelector(state => state.dataset.dataset?.symbolData) || {};
    const ratio = useAppSelector(state => state.states.aspectRatio);
    const dispatch = useAppDispatch();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fragmentsList = !fragments || !fragments.length ? selectedSymbols.map(symbol => {
            const length = symbolData[symbol].x.length;
            const arr: Fragment[] = [];
            for (let i = 0; i < length; i++) {
                for (let j = i + 1; j < length; j++) {
                    arr.push({
                        source: symbol,
                        start_idx: i,
                        end_idx: j,
                        segments: []
                    });
                }
            }
            return arr;
        }).flat() : fragments;

        queryInFragments(queryCondition, fragmentsList, ratio).then(({result_fragments, keeped_after_prune_fragments}) => {
            dispatch(addQuerySpec(queryCondition));
            dispatch(addFragments([result_fragments, keeped_after_prune_fragments]));
        })
    }

    return (
        <Block className="query-condition" title="Query Specification">
            <form onSubmit={handleSubmit}>
                <h3>Query</h3>
                <section>
                    <span className="query-condition-title">Patterns</span><button type="button" className="add-btn" onClick={() => {
                        const newQueryCondition = deepClone(queryCondition);
                        if (!newQueryCondition.patterns) newQueryCondition.patterns = [];
                        newQueryCondition.patterns.push({ trend: null, extent: null });
                        setQueryCondition(newQueryCondition);
                    }}><PlusCircleOutlined /></button>
                    <ul>
                        {queryCondition.patterns?.map((pattern, index) => (
                            <li key={index}>
                                <strong>{index}</strong>
                                <Select allowClear popupMatchSelectWidth={false} value={pattern.trend} options={trendOptions} onChange={(value) => {
                                    const newQueryCondition = deepClone(queryCondition);
                                    newQueryCondition.patterns![index].trend = value;
                                    setQueryCondition({ ...newQueryCondition });
                                }}></Select>
                                <Select allowClear popupMatchSelectWidth={false} value={pattern.extent} options={extentOptions} onChange={(value) => {
                                    const newQueryCondition = deepClone(queryCondition);
                                    newQueryCondition.patterns![index].extent = value;
                                    setQueryCondition({ ...newQueryCondition });
                                }}></Select>
                                <button type="button" className="del-btn" onClick={() => {
                                    const newQueryCondition = deepClone(queryCondition);
                                    newQueryCondition.patterns?.splice(index, 1);
                                    setQueryCondition({ ...newQueryCondition });
                                }}><MinusCircleOutlined /></button>
                            </li>
                        ))}
                    </ul>
                </section>
                <section>
                    <span className="query-condition-title">Y MAX Value</span>
                    <Select allowClear options={comparatorOptions} value={queryCondition?.y_max_condition?.comparator} onChange={(value) => {
                        const newQueryCondition = deepClone(queryCondition);
                        if (!value) newQueryCondition.y_max_condition = null;
                        else if (!newQueryCondition.y_max_condition) newQueryCondition.y_max_condition = { comparator: value, value: null };
                        else newQueryCondition.y_max_condition!.comparator = value;
                        setQueryCondition(newQueryCondition);
                    }}></Select>
                    {queryCondition?.y_max_condition?.comparator && <InputNumber value={queryCondition?.y_max_condition?.value} onChange={(value) => {
                        const newQueryCondition = deepClone(queryCondition);
                        newQueryCondition.y_max_condition!.value = value;
                        setQueryCondition({ ...newQueryCondition });
                    }}></InputNumber>}
                </section>
                <section>
                    <span className="query-condition-title">Y MIN Value</span>
                    <Select allowClear options={comparatorOptions} value={queryCondition?.y_min_condition?.comparator} onChange={(value) => {
                        const newQueryCondition = deepClone(queryCondition);
                        if (!value) newQueryCondition.y_min_condition = null;
                        else if (!newQueryCondition.y_min_condition) newQueryCondition.y_min_condition = { comparator: value, value: null };
                        else newQueryCondition.y_min_condition!.comparator = value;
                        setQueryCondition({ ...newQueryCondition });
                    }}></Select>
                    {queryCondition?.y_min_condition?.comparator && <InputNumber value={queryCondition?.y_min_condition?.value} onChange={(value) => {
                        const newQueryCondition = deepClone(queryCondition);
                        newQueryCondition.y_min_condition!.value = value;
                        setQueryCondition({ ...newQueryCondition });
                    }}></InputNumber>}
                </section>
                <section>
                    <span className="query-condition-title">Time</span>
                    <DatePicker.RangePicker allowClear allowEmpty onChange={(dates) => {
                        if (!dates) return;
                        const newQueryCondition = deepClone(queryCondition);
                        newQueryCondition.start_time = dates[0]?.toISOString() || null;
                        newQueryCondition.end_time = dates[1]?.toISOString() || null;
                        setQueryCondition({ ...newQueryCondition });
                    }}></DatePicker.RangePicker>
                </section>
                <section className="center">
                    <Button type="primary" htmlType="submit">Confirm!</Button>
                </section>
            </form>
        </Block>
    )
}