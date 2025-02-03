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
    disabled?: boolean;
    onChange: (min: number | null, max: number | null, minInclusive: boolean, maxInclusive: boolean) => void;
}

export default function Scope({ title, min, max, minValue, maxValue, minInclusive, maxInclusive, onChange, disabled }: ScopeProps) {
    const t = title?.toLowerCase().split(" ").filter(Boolean).join("_");
    return (
        <>
            <Typography.Title level={4} keyboard>{title ?? 'Scope'}</Typography.Title>
            {
                t === "value_scope_condition" && minValue && maxValue ? (
                    <InclusiveSlider disabled={disabled}  min={min} max={max} minInclusive={minInclusive} maxInclusive={maxInclusive} minValue={minValue} maxValue={maxValue} onChange={onChange}></InclusiveSlider>
                ) : t === "time_scope_condition" ? (
                    <Time disabled={disabled}  min={min} max={max} minInclusive={minInclusive} maxInclusive={maxInclusive} maxValue={maxValue ?? null} minValue={minValue ?? null} onChange={onChange}></Time>
                ) : (
                    <Span disabled={disabled}  valueFormatter={86400} addonAfter="days" min={min} max={max} minInclusive={minInclusive} maxInclusive={maxInclusive} minValue={0} onChange={onChange}></Span>
                )
            }
        </>
    )
}