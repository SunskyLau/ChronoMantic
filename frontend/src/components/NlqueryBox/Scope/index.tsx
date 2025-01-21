import { Checkbox, Divider, InputNumber, Typography } from "antd";

interface ScopeProps {
    title?: string;
    min: number | null;
    max: number | null;
    minInclusive: boolean;
    maxInclusive: boolean;
    onChange: (min: number | null, max: number | null, minInclusive: boolean, maxInclusive: boolean) => void;
}

export default function Scope({ title, min, max, minInclusive, maxInclusive, onChange }: ScopeProps) {
    return (
        <>
            <Typography.Title level={5} keyboard>{title ?? 'Scope'}</Typography.Title>
            <Typography.Text>MIN</Typography.Text>
            <InputNumber className="ml-1" value={min} onChange={(value) => { onChange(value, max, minInclusive, maxInclusive); }} />
            <Checkbox className="ml-1" checked={minInclusive} disabled={!min} onChange={(e) => { onChange(min, max, e.target.checked, maxInclusive) }}></Checkbox>
            <Divider></Divider>
            <Typography.Text>MAX</Typography.Text>
            <InputNumber className="ml-1" value={max} onChange={(value) => { onChange(min, value, minInclusive, maxInclusive); }} />
            <Checkbox className="ml-1" checked={maxInclusive} disabled={!max} onChange={(e) => { onChange(min, max, minInclusive, e.target.checked) }}></Checkbox>
        </>
    )
}