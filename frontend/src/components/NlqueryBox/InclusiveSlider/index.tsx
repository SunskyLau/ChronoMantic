import { Checkbox, Col, Flex, Slider } from "antd";

interface InclusiveSliderProps {
    min: number | null;
    max: number | null;
    minInclusive: boolean;
    maxInclusive: boolean;
    minValue: number;
    maxValue: number;
    minActiveColor?: string;
    maxActiveColor?: string;
    disabled?: boolean;
    onChange: (min: number | null, max: number | null, minInclusive: boolean, maxInclusive: boolean) => void;
}

export default function InclusiveSlider({ min, max, minInclusive, maxInclusive, minValue, maxValue, onChange, disabled }: InclusiveSliderProps) {
    const defaultValue = [min || minValue, max || maxValue];
    return (
        <Flex gap={"small"}>
            <Checkbox checked={minInclusive} disabled={disabled || !min} onChange={(e) => {
                onChange(min, max, e.target.checked, maxInclusive);
            }}></Checkbox>
            <Col flex={1}><Slider disabled={disabled} step={1} range defaultValue={defaultValue} min={minValue} max={maxValue} onChangeComplete={(value) => {
                onChange(value[0], value[1], minInclusive, maxInclusive);
            }} /></Col>
            <Checkbox checked={maxInclusive} disabled={disabled || !max} onChange={(e) => {
                onChange(min, max, minInclusive, e.target.checked);
            }}></Checkbox>
        </Flex>
    );
}