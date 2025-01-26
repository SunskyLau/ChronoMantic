import { Button, Divider, Empty, Flex, Typography } from "antd";
import { Trend as TrendType } from "../../../types/QuerySpec";
import { deepClone } from "../../../utils/deepclone";
import InclusiveSlider from "../InclusiveSlider";
import Span from "../Span";
import Time from "../Time";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { ReactNode } from "react";

interface TrendProps {
    title?: string;
    trends: TrendType[];
    maxValue?: number;
    minValue?: number;
    start?: number;
    isEdit?: boolean;
    onChange: (trends: TrendType[]) => void;
}

export default function Trend({ title, trends, minValue, maxValue, onChange, start = 0, isEdit }: TrendProps) {
    return (
        <>
            <Flex justify="space-between" align="center">
                <Typography.Title level={4} keyboard>{title ?? 'Trend'}</Typography.Title>
                {isEdit && <Button icon={<PlusOutlined />} onClick={() => {
                    const newTrends = deepClone(trends);
                    newTrends.push({ time_scope_condition: {}, angle_scope_condition: {}, slope_scope_condition: {}, time_span_condition: {} });
                    onChange(newTrends);
                }}></Button>}
            </Flex>
            {!trends.length ? <Empty description="no trends"></Empty> : trends.map((trend, index) => (
                <div className="trend-item" key={index}>
                    <Flex justify="space-between" align="center">
                        <Typography.Title level={5}>No.{trend.index ?? index + start}</Typography.Title>
                        {isEdit && <Button type="primary" icon={<MinusOutlined />} danger onClick={() => {
                            const newTrends = deepClone(trends);
                            newTrends.splice(index, 1);
                            onChange(newTrends);
                        }}></Button>}
                    </Flex>
                    {Object.keys(trend).map((key, i) => {
                        const k = key as keyof typeof trend;
                        if (!trend[k] || typeof trend[k] === 'number') return null;
                        const components: ReactNode[] = [];
                        components.push(<Typography.Paragraph key={i}>{k}</Typography.Paragraph>);
                        switch (k) {
                            case 'time_span_condition':
                                components.push(<Span key={k} valueFormatter={86400} addonAfter="days" minValue={0} min={trend.time_span_condition?.min?.value || null} max={trend.time_span_condition?.max?.value || null} maxInclusive={!!trend.time_span_condition?.max?.inclusive} minInclusive={!!trend.time_span_condition?.min?.inclusive} onChange={(min, max, minInclusive, maxInclusive) => {
                                    const newTrends = deepClone(trends);
                                    const change = { [k]: { min: !min ? null : { value: min, inclusive: minInclusive }, max: !max ? null : { value: max, inclusive: maxInclusive } } };
                                    newTrends[index] = { ...newTrends[index], ...change };
                                    onChange(newTrends);
                                }}></Span>)
                                break;
                            case 'angle_scope_condition':
                                components.push(<InclusiveSlider key={k} minValue={-90} maxValue={90} min={trend[k]?.min?.value || null} max={trend[k]?.max?.value || null} minInclusive={!!trend[k]?.min?.inclusive} maxInclusive={!!trend[k]?.max?.inclusive} onChange={(min, max, minInclusive, maxInclusive) => {
                                    const newTrends = deepClone(trends);
                                    const change = { [k]: { min: !min ? null : { value: min, inclusive: minInclusive }, max: !max ? null : { value: max, inclusive: maxInclusive } } };
                                    newTrends[index] = { ...newTrends[index], ...change };
                                    onChange(newTrends);
                                }}></InclusiveSlider>)
                                break;
                            case 'slope_scope_condition':
                                components.push(<Span key={k} min={trend[k]?.min?.value || null} max={trend[k]?.max?.value || null} maxInclusive={!!trend[k]?.max?.inclusive} minInclusive={!!trend[k]?.min?.inclusive} onChange={(min, max, minInclusive, maxInclusive) => {
                                    const newTrends = deepClone(trends);
                                    const change = { [k]: { min: !min ? null : { value: min, inclusive: minInclusive }, max: !max ? null : { value: max, inclusive: maxInclusive } } };
                                    newTrends[index] = { ...newTrends[index], ...change };
                                    onChange(newTrends);
                                }}></Span>);
                                break;
                            case 'time_scope_condition':
                                components.push(<Time key={k} min={trend[k]?.min?.value || null} max={trend[k]?.max?.value || null} maxInclusive={!!trend[k]?.max?.inclusive} minInclusive={!!trend[k]?.min?.inclusive} minValue={minValue ?? null} maxValue={maxValue ?? null} onChange={(min, max, minInclusive, maxInclusive) => {
                                    const newTrends = deepClone(trends);
                                    const change = { [k]: { min: !min ? null : { value: min, inclusive: minInclusive }, max: !max ? null : { value: max, inclusive: maxInclusive } } };
                                    newTrends[index] = { ...newTrends[index], ...change };
                                    onChange(newTrends);
                                }}></Time>)
                                break;
                            default:
                                break;
                        }
                        return <div className="trend-item-attr" key={i}>{components}</div>
                    })}
                    <Divider></Divider>
                </div>
            ))}
        </>
    )
}