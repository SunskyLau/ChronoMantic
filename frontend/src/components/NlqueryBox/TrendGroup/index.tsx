import { Button, Divider, Empty, Flex, Select, Typography } from "antd";
import { TrendGroupWithSource } from "../../../types/QuerySpec";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { deepClone } from "../../../utils/deepclone";
import Span from "../Span";
import { getColorFromMap } from "../../../utils/color";
import { useAppSelector } from "../../../app/hooks";

interface TrendGroupProps {
	isEdit?: boolean;
	disabled?: boolean;
	groups: TrendGroupWithSource[];
	idLength: number;
	onChange: (groups: TrendGroupWithSource[]) => void;
}

export default function TrendGroup({ groups, idLength, onChange, isEdit, disabled }: TrendGroupProps) {
	const colorMap = useAppSelector((state) => state.states.colorMap);
	const allGroups = isEdit ? deepClone(groups) : groups;

	return (
		<>
			<Flex
				justify="space-between"
				align="center"
			>
				<Typography.Title
					level={4}
					keyboard
				>
					Trend Groups
				</Typography.Title>
				{isEdit && !disabled && (
					<Button
						icon={<PlusOutlined />}
						onClick={() => {
							const newGroups = deepClone(allGroups);
							newGroups.push({
								ids: [0, 0],
								time_span_condition: {},
							});
							onChange(newGroups);
						}}
					/>
				)}
			</Flex>

			{!groups.length ? (
				<Empty description="no trend groups" />
			) : (
				allGroups.map((group, index) => (
					<div key={index}>
						<Flex
							justify="space-between"
							align="center"
							className="group-item"
						>
							<Flex
								gap={8}
								align="center"
							>
								<Span
									disabled={disabled}
									min={group.time_span_condition?.min?.value ?? null}
									max={group.time_span_condition?.max?.value ?? null}
									activeColor={getColorFromMap(colorMap, group.text_source)}
									minInclusive={!!group.time_span_condition?.min?.inclusive}
									maxInclusive={!!group.time_span_condition?.max?.inclusive}
									addonBefore={[
										<Select
											disabled={disabled}
											value={group.ids[0]}
											options={Array.from({ length: idLength }, (_, i) => ({ value: i }))}
											onChange={(value) => {
												const newGroups = deepClone(allGroups);
												newGroups[index].ids[0] = value;
												onChange(newGroups);
											}}
										/>,
										<Select
											disabled={disabled}
											value={group.ids[1]}
											options={Array.from({ length: idLength }, (_, i) => ({ value: i }))}
											onChange={(value) => {
												const newGroups = deepClone(allGroups);
												newGroups[index].ids[1] = value;
												onChange(newGroups);
											}}
										/>,
									]}
									addonAfter="days"
									valueFormatter={86400}
									onChange={(min, max, minInclusive, maxInclusive) => {
										const newGroups = deepClone(allGroups);
										newGroups[index].time_span_condition = {
											min: !min ? undefined : { value: min, inclusive: minInclusive },
											max: !max ? undefined : { value: max, inclusive: maxInclusive },
										};
										onChange(newGroups);
									}}
								/>
							</Flex>
							{isEdit && !disabled && (
								<Button
									type="primary"
									icon={<MinusOutlined />}
									danger
									onClick={() => {
										const newGroups = deepClone(allGroups);
										newGroups.splice(index, 1);
										onChange(newGroups);
									}}
								/>
							)}
						</Flex>
						<Divider />
					</div>
				))
			)}
		</>
	);
}
