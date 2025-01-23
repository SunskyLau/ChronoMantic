import { Divider, Typography } from "antd";
import { Trend as TrendType } from "../../../types/QuerySpec";
import { deepClone } from "../../../utils/deepclone";
import InclusiveSlider from "../InclusiveSlider";
import Span from "../Span";
import Time from "../Time";

interface TrendProps {
    title?: string;
    trends: TrendType[];
    maxValue?: number;
    minValue?: number;
    onChange: (trends: TrendType[]) => void;
}

export default function Trend({ title, trends, minValue, maxValue, onChange }: TrendProps) {
    if (!trends.length) return null;
    return (
        <>
            <Typography.Title level={4} keyboard>{title ?? 'Trend'}</Typography.Title>
            {trends.map((trend, index) => (
                <li key={index}>
                    <Typography.Title level={5}>No.{index}</Typography.Title>
                    {Object.keys(trend).map((key, i) => {
                        const k = key as keyof typeof trend;
                        if (!trend[k]) return null;
                        switch (k) {
                            case 'time_span_condition':
                                return (<div key={i}><Typography.Paragraph>{k}</Typography.Paragraph><Span valueFormatter={86400} addonAfter="days" minValue={0} min={trend.time_span_condition?.min?.value || null} max={trend.time_span_condition?.max?.value || null} maxInclusive={!!trend.time_span_condition?.max?.inclusive} minInclusive={!!trend.time_span_condition?.min?.inclusive} onChange={(min, max, minInclusive, maxInclusive) => {
                                    const newTrends = deepClone(trends);
                                    const change = { [k]: { min: !min ? null : { value: min, inclusive: minInclusive }, max: !max ? null : { value: max, inclusive: maxInclusive } } };
                                    newTrends[index] = { ...newTrends[index], ...change };
                                    onChange(newTrends);
                                }}></Span></div>)
                            case 'angle_scope_condition':
                                return (<div key={i}><Typography.Paragraph>{k}</Typography.Paragraph><InclusiveSlider minValue={-90} maxValue={90} min={trend[k]?.min?.value || null} max={trend[k]?.max?.value || null} minInclusive={!!trend[k]?.min?.inclusive} maxInclusive={!!trend[k]?.max?.inclusive} onChange={(min, max, minInclusive, maxInclusive) => {
                                    const newTrends = deepClone(trends);
                                    const change = { [k]: { min: !min ? null : { value: min, inclusive: minInclusive }, max: !max ? null : { value: max, inclusive: maxInclusive } } };
                                    newTrends[index] = { ...newTrends[index], ...change };
                                    onChange(newTrends);
                                }}></InclusiveSlider></div>)
                            case 'slope_scope_condition':
                                return (<div key={i}><Typography.Paragraph>{k}</Typography.Paragraph><Span min={trend[k]?.min?.value || null} max={trend[k]?.max?.value || null} maxInclusive={!!trend[k]?.max?.inclusive} minInclusive={!!trend[k]?.min?.inclusive} onChange={(min, max, minInclusive, maxInclusive) => {
                                    const newTrends = deepClone(trends);
                                    const change = { [k]: { min: !min ? null : { value: min, inclusive: minInclusive }, max: !max ? null : { value: max, inclusive: maxInclusive } } };
                                    newTrends[index] = { ...newTrends[index], ...change };
                                    onChange(newTrends);
                                }}></Span></div>)
                            case 'time_scope_condition':
                                return (<div key={i}><Typography.Paragraph>{k}</Typography.Paragraph><Time min={trend[k]?.min?.value || null} max={trend[k]?.max?.value || null} maxInclusive={!!trend[k]?.max?.inclusive} minInclusive={!!trend[k]?.min?.inclusive} minValue={minValue ?? null} maxValue={maxValue ?? null} onChange={(min, max, minInclusive, maxInclusive) => {
                                    const newTrends = deepClone(trends);
                                    const change = { [k]: { min: !min ? null : { value: min, inclusive: minInclusive }, max: !max ? null : { value: max, inclusive: maxInclusive } } };
                                    newTrends[index] = { ...newTrends[index], ...change };
                                    onChange(newTrends);
                                }}></Time></div>)
                            default:
                                return null;
                        }
                    })}
                    <Divider></Divider>
                </li>
            ))}
        </>
    )
}