import { Button, Divider, Empty, Flex, Select, Typography } from "antd";
import { TrendWithSource } from "../../../types/QuerySpec";
import { deepClone } from "../../../utils/deepclone";
import Span from "../Span";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { ReactNode, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setCurTrend } from "../../../app/slice/stateSlice";
import { classnames } from "../../../utils/classname";
import { getColorFromMap } from "../../../utils/color";

interface TrendProps {
	title?: string;
	trends: TrendWithSource[];
	start?: number;
	isEdit?: boolean;
	disabled?: boolean;
	onChange: (trends: TrendWithSource[]) => void;
}

export default function Trend({ title, trends, onChange, start = 0, isEdit, disabled }: TrendProps) {
	const allTrends = isEdit
		? deepClone(trends).map((trend) => ({
				category: trend.category,
				slope_scope_condition: trend.slope_scope_condition || {},
				delta_percentage_scope_condition: trend.delta_percentage_scope_condition || {},
				daily_average_delta_percentage_scope_condition: trend.daily_average_delta_percentage_scope_condition || {},
				abs_slope_percentage_scope_condition: trend.abs_slope_percentage_scope_condition || {},
				time_span_condition: trend.time_span_condition || {},
		  }))
		: trends;
	const trendRefs = useRef<(HTMLDivElement | null)[]>([]);
	const dispatch = useAppDispatch();
	const colorMap = useAppSelector((state) => state.states.colorMap);

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
					{title ?? "Trend"}
				</Typography.Title>
				{isEdit && !disabled && (
					<Button
						icon={<PlusOutlined />}
						onClick={() => {
							const newTrends = deepClone(allTrends);
							newTrends.push({
								category: {
									category: "",
								},
								slope_scope_condition: {},
								delta_percentage_scope_condition: {},
								daily_average_delta_percentage_scope_condition: {},
								abs_slope_percentage_scope_condition: {},
								time_span_condition: {},
							});
							onChange(newTrends);
						}}
					></Button>
				)}
			</Flex>
			{!trends.length ? (
				<Empty description="no trends"></Empty>
			) : (
				allTrends.map((trend, index) => {
					return (
						<div
							key={index}
							ref={(el) => (trendRefs.current[index] = el)}
							onClick={() => {
								dispatch(setCurTrend(index));
							}}
						>
							<div className="trend-item">
								<Flex
									justify="space-between"
									align="center"
								>
									<Typography.Title level={5}>No.{index + start}</Typography.Title>
									{isEdit && !disabled && (
										<Button
											type="primary"
											icon={<MinusOutlined />}
											danger
											onClick={() => {
												const newTrends = deepClone(allTrends);
												newTrends.splice(index, 1);
												onChange(newTrends);
											}}
										></Button>
									)}
								</Flex>
								{Object.keys(trend).map((key, i) => {
									const k = key as keyof TrendWithSource;
									const components: ReactNode[] = [];
									components.push(<Typography.Paragraph key={i}>{k}</Typography.Paragraph>);
									switch (k) {
										case "category":
											components.push(
												<div style={{ width: 'fit-content', padding: 4, borderRadius: 4, backgroundColor: getColorFromMap(colorMap, trend[k].text_source) }} key={k}><Select
													popupMatchSelectWidth={false}
													value={trend[k].category}
													options={[
														{
															label: "flat",
															value: "flat",
														},
														{
															label: "up",
															value: "up",
														},
														{
															label: "down",
															value: "down",
														},
													]}
													onChange={(value) => {
														const newTrends = deepClone(allTrends);
														newTrends[index][k].category = value;
														onChange(newTrends);
													}}
												></Select></div>
											);
											break;
										case "time_span_condition":
										case "slope_scope_condition":
										case "delta_percentage_scope_condition":
										case "daily_average_delta_percentage_scope_condition":
										case "abs_slope_percentage_scope_condition":
											components.push(
												<Span
													disabled={disabled}
													key={k}
													min={trend[k]?.min?.value ?? null}
													max={trend[k]?.max?.value ?? null}
													minActiveColor={getColorFromMap(colorMap, trend[k]?.min?.text_source)}
													maxActiveColor={getColorFromMap(colorMap, trend[k]?.max?.text_source)}
													minInclusive={!!trend[k]?.min?.inclusive}
													maxInclusive={!!trend[k]?.max?.inclusive}
													onChange={(min, max, minInclusive, maxInclusive) => {
														const newTrends = deepClone(allTrends);
														const change = {
															[k]: {
																min:
																	!min && min !== 0
																		? undefined
																		: {
																				value: min,
																				inclusive: minInclusive,
																				text_source: {
																					text: trend[k]?.min?.text_source?.text || "",
																					index: trend[k]?.min?.text_source?.index || 0,
																				},
																		  },
																max:
																	!max && max !== 0
																		? undefined
																		: {
																				value: max,
																				inclusive: maxInclusive,
																				text_source: {
																					text: trend[k]?.max?.text_source?.text || "",
																					index: trend[k]?.max?.text_source?.index || 0,
																				},
																		  },
															},
														};
														newTrends[index] = {
															...newTrends[index],
															...change,
														};
														onChange(newTrends);
													}}
												/>
											);
											break;
										default:
											break;
									}

									return (
										<div
											key={i}
											className={classnames("trend-item-attr")}
										>
											{components}
										</div>
									);
								})}
							</div>
							<Divider></Divider>
						</div>
					);
				})
			)}
		</>
	);
}
