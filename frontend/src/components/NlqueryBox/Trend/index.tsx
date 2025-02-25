import { Button, Divider, Empty, Flex, Select, Typography } from "antd";
import { TrendWithSource } from "../../../types/QuerySpec";
import { deepClone } from "../../../utils/deepclone";
import Span from "../Span";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { ReactNode, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setCurTrend } from "../../../app/slice/stateSlice";
import { classnames } from "../../../utils/classname";
import { getColorFromMap } from "../../../utils/color";
import { TrendCategory, TrendTextMap } from "../../../types/QuerySpec";

interface TrendProps {
	title?: string;
	trends: TrendWithSource[];
	start?: number;
	isEdit?: boolean;
	disabled?: boolean;
	onChange: (trends: TrendWithSource[]) => void;
}

export default function Trend({ title, trends, onChange, start = 0, isEdit, disabled }: TrendProps) {
	const allTrends = trends;
	const trendRefs = useRef<(HTMLDivElement | null)[]>([]);
	const dispatch = useAppDispatch();
	const colorMap = useAppSelector((state) => state.states.colorMap);
	const curTrend = useAppSelector((state) => state.states.curTrend);

	useEffect(() => {
		if (curTrend) {
			const trendRef = trendRefs.current[curTrend];
			if (trendRef) {
				trendRef.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}
	}, [curTrend]);

	const getAvailableOptions = () => {
		return Object.entries(TrendTextMap).filter(([key]) => key !== "category").map(([key, value]) => ({
			label: value,
			value: key,
		}));
	};

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
									category: TrendCategory.ARBITRARY,
									text_source_id: -1,
								}
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
							style={{ backgroundColor: curTrend === index ? "#f0f0f0" : "transparent" }}
						>
							<div className="trend-item">
								<Flex
									justify="space-between"
									align="center"
								>
									<Typography.Title level={5}>No.{index + start}</Typography.Title>
									{isEdit && !disabled && (
										<Flex
											gap={4}
											className="trend-item-attr"
										>
											<Select
												mode="multiple"
												options={getAvailableOptions()}
												popupMatchSelectWidth={false}
												value={Object.keys(trend).filter((key) => key !== "category")}
												onChange={(values) => {
													const newTrends = deepClone(allTrends);
													newTrends[index] = {
														category: {
															category: trend.category.category,
															text_source_id: trend.category.text_source_id,
														},
													};
													values.forEach((value) => {
														const k = value as keyof TrendWithSource;
														if (k === "category") return;
														newTrends[index][k] = trend[k];
													});
													onChange(newTrends);
												}}
											></Select>
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
										</Flex>
									)}
								</Flex>
								{Object.keys(trend).map((key, i) => {
									const k = key as keyof TrendWithSource;
									const components: ReactNode[] = [];
									components.push(<Typography.Paragraph key={i}>{TrendTextMap[k]}</Typography.Paragraph>);
									switch (k) {
										case "category":
											components.push(
												<div
													className="active-component"
													style={{ backgroundColor: getColorFromMap(colorMap, trend[k].text_source_id) }}
													key={k}
												>
													<Select
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
													></Select>
												</div>
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
													addonAfter={k.includes("span") ? "days" : undefined}
													valueFormatter={k.includes("span") ? 86400 : undefined}
													min={trend[k]?.min?.value ?? null}
													max={trend[k]?.max?.value ?? null}
													activeColor={getColorFromMap(colorMap, trend[k]?.text_source_id)}
													minInclusive={!!trend[k]?.min?.inclusive}
													maxInclusive={!!trend[k]?.max?.inclusive}
													onChange={(min, max, minInclusive, maxInclusive) => {
														const newTrends = deepClone(allTrends);
														const change = {
															[k]: {
																text_source_id: trend[k]?.text_source_id,
																min: !min ? undefined : {
																	value: min,
																	inclusive: minInclusive
																},
																max: !max ? undefined : {
																	value: max,
																	inclusive: maxInclusive
																}
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
