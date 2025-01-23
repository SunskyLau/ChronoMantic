import { Typography } from "antd";
import InclusiveSlider from "../InclusiveSlider";
import Span from "../Span";
import Time from "../Time";

interface ScopeProps {
    title?: string;
    min: number | null;
    max: number | null;
    minValue?: number;
    maxValue?: number;
    minInclusive: boolean;
    maxInclusive: boolean;
    onChange: (min: number | null, max: number | null, minInclusive: boolean, maxInclusive: boolean) => void;
}

export default function Scope({ title, min, max, minValue, maxValue, minInclusive, maxInclusive, onChange }: ScopeProps) {
    return (
        <>
            <Typography.Title level={4} keyboard>{title ?? 'Scope'}</Typography.Title>
            {
                title === "value_scope_condition" && minValue && maxValue ? (
                    <InclusiveSlider min={min} max={max} minInclusive={minInclusive} maxInclusive={maxInclusive} minValue={minValue} maxValue={maxValue} onChange={onChange}></InclusiveSlider>
                ) : title === "time_scope_condition" ? (
                    <Time min={min} max={max} minInclusive={minInclusive} maxInclusive={maxInclusive} maxValue={maxValue ?? null} minValue={minValue ?? null} onChange={onChange}></Time>
                ) : (
                    <Span valueFormatter={86400} addonAfter="days" min={min} max={max} minInclusive={minInclusive} maxInclusive={maxInclusive} minValue={0} onChange={onChange}></Span>
                )
            }
        </>
    )
}