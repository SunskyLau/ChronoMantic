import { SwapRightOutlined } from "@ant-design/icons";
import { DatePicker, Flex } from "antd";
import dayjs from "dayjs";

interface TimeProps {
	min: number | null;
	max: number | null;
	minInclusive: boolean;
	maxInclusive: boolean;
	activeColor?: string;
	minActiveColor?: string;
	maxActiveColor?: string;
	minValue: number | null;
	maxValue: number | null;
	disabled?: boolean;
	onChange: (min: number | null, max: number | null, minInclusive: boolean, maxInclusive: boolean) => void;
}

export default function Time({ min, max, minInclusive, maxInclusive, maxValue, minValue, onChange, disabled, minActiveColor, maxActiveColor, activeColor }: TimeProps) {
	return (
		<Flex
			gap={12}
			align="center"
			className="active-component"
			style={{ backgroundColor: activeColor }}
		>
			<Flex
				className="active-component"
				style={{
					backgroundColor: minActiveColor,
				}}
				align="center"
			>
				<DatePicker
					disabled={disabled}
					value={min ? dayjs(min * 1000) : null}
					minDate={dayjs(minValue)}
					maxDate={dayjs(maxValue)}
					defaultValue={min ? dayjs(min * 1000) : null}
					allowClear
					onChange={(date) => {
						const maxTime = max ? max : null;
						onChange(date ? date.valueOf() / 1000 : null, maxTime, true, maxInclusive);
					}}
				/>
			</Flex>
			<SwapRightOutlined />
			<Flex
				className="active-component"
				style={{
					backgroundColor: maxActiveColor,
				}}
				align="center"
			>
				<DatePicker
					disabled={disabled}
					value={max ? dayjs(max * 1000) : null}
					minDate={dayjs(minValue)}
					maxDate={dayjs(maxValue)}
					defaultValue={max ? dayjs(max * 1000) : null}
					allowClear
					onChange={(date) => {
						const minTime = min ? min : null;
						onChange(minTime, date ? date.valueOf() / 1000 : null, minInclusive, true);
					}}
				/>
			</Flex>
		</Flex>
	);
}
