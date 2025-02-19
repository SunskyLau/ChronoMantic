import { SwapRightOutlined } from "@ant-design/icons";
import { Checkbox, Flex, InputNumber } from "antd";
import { ReactNode } from "react";

interface SpanProps {
	min: number | null;
	max: number | null;
	minInclusive: boolean;
	maxInclusive: boolean;
	minValue?: number;
	maxValue?: number;
	activeColor?: string;
	minActiveColor?: string;
	maxActiveColor?: string;
	addonBefore?: [ReactNode, ReactNode];
	addonAfter?: string;
	valueFormatter?: number;
	disabled?: boolean;
	onChange: (min: number | null, max: number | null, minInclusive: boolean, maxInclusive: boolean) => void;
}

export default function Span({ min, max, minValue, maxValue, minInclusive, addonBefore, addonAfter, valueFormatter = 1, maxInclusive, onChange, disabled, minActiveColor, maxActiveColor, activeColor }: SpanProps) {
	return (
		<>
			<Flex
				gap={4}
				align="center"
				className="active-component"
				style={{ backgroundColor: activeColor }}
			>
				<Flex style={{ backgroundColor: minActiveColor }} className="active-component" align="center" gap={8}>
					<Checkbox
						checked={minInclusive}
						disabled={disabled || !min}
						onChange={(e) => {
							onChange(min, max, e.target.checked, maxInclusive);
						}}
					></Checkbox>
					<InputNumber
						disabled={disabled}
						addonBefore={addonBefore?.[0]}
						addonAfter={addonAfter}
						max={maxValue}
						min={minValue}
						value={min ? min / valueFormatter : min}
						onChange={(value) => {
							onChange(value ? value * valueFormatter : value, max, minInclusive, maxInclusive);
						}}
					/>
				</Flex>
				<SwapRightOutlined />
				<Flex style={{ backgroundColor: maxActiveColor }} className="active-component" align="center" gap={8}>
					<InputNumber
						disabled={disabled}
						addonBefore={addonBefore?.[1]}
						addonAfter={addonAfter}
						max={maxValue}
						min={minValue}
						value={max ? max / valueFormatter : max}
						onChange={(value) => {
							onChange(min, value ? value * valueFormatter : value, minInclusive, maxInclusive);
						}}
					/>
					<Checkbox
						checked={maxInclusive}
						disabled={disabled || !max}
						onChange={(e) => {
							onChange(min, max, minInclusive, e.target.checked);
						}}
					></Checkbox>
				</Flex>
			</Flex>
		</>
	);
}
