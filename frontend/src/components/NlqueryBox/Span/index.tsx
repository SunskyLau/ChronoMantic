import { SwapRightOutlined } from "@ant-design/icons";
import { Checkbox, Flex, InputNumber } from "antd";

interface SpanProps {
    min: number | null;
    max: number | null;
    minInclusive: boolean;
    maxInclusive: boolean;
    minValue?: number;
    maxValue?: number;
    addonAfter?: string;
    valueFormatter?: number;
    onChange: (min: number | null, max: number | null, minInclusive: boolean, maxInclusive: boolean) => void;
}

export default function Span({ min, max, minValue, maxValue, minInclusive, addonAfter, valueFormatter = 1, maxInclusive, onChange }: SpanProps) {
    return (
        <>
            <Flex gap={12} align="center">
                <Checkbox checked={minInclusive} disabled={!min} onChange={(e) => { onChange(min, max, e.target.checked, maxInclusive) }}></Checkbox>
                <InputNumber addonAfter={addonAfter} max={maxValue} min={minValue} value={min ? min / valueFormatter : min} onChange={(value) => { onChange(value ? value * valueFormatter : null, max, minInclusive, maxInclusive); }} />
                <SwapRightOutlined />
                <InputNumber addonAfter={addonAfter} max={maxValue} min={minValue} value={max ? max / valueFormatter : max} onChange={(value) => { onChange(min, value ? value * valueFormatter : null, minInclusive, maxInclusive); }} />
                <Checkbox checked={maxInclusive} disabled={!max} onChange={(e) => { onChange(min, max, minInclusive, e.target.checked) }}></Checkbox>
            </Flex>
        </>
    )
}