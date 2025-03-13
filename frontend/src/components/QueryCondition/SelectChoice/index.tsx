import { Select } from "antd";
import TitleCondition from "../TitleCondition";

export interface SelectChoiceProps<T> {
	title: string;
	value: T;
	options: T[];
	onChange: (value: T) => void;
}

export default function SelectChoice<T>({ title, value, options, onChange }: SelectChoiceProps<T>) {
	return (
		<TitleCondition title={title}>
			<Select
				allowClear
				options={options.map((value) => ({ value: value }))}
				popupMatchSelectWidth={false}
				value={value}
				onChange={onChange}
			></Select>
		</TitleCondition>
	);
}
