import { Divider } from "antd";
import "./index.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useMemo } from "react";
import { setQuery } from "../../app/slice/stateSlice";
import { deepClone } from "../../utils/deepclone";
import Target from "../NlqueryBox/Target";
import Scope from "../NlqueryBox/Scope";
import Relation from "../NlqueryBox/Relation";
import Trend from "../NlqueryBox/Trend";
import { getColorFromMap } from "../../utils/color";

export default function QueryCondition() {
	const query = useAppSelector((state) => state.states.query);
	const memoizedQuery = useMemo(
		() =>
			deepClone(query) || {
				original_text: "",
				target: {
					target: "",
					text_source: { text: "", index: 0 },
				},
				trends: [],
				relations: [],
				trend_time_span_composition_conditions: [],
			},
		[query]
	);
	const values = useAppSelector((state) => state.dataset.dataset?.valueColumns) || [];
	const dispatch = useAppDispatch();
	const data = useAppSelector((state) => state.dataset.dataset?.data) || {};
	const value = (data[memoizedQuery.target.target || ""] as number[]) || [];
	const maxValue = Math.floor(Math.max(...value));
	const minValue = Math.ceil(Math.min(...value));
	const time = useAppSelector((state) => state.dataset.dataset?.data[state.dataset.dataset.timeStampColumn]) || [];
	const date = time.map((t) => new Date(t).getTime());
	const minDate = Math.min(...date);
	const maxDate = Math.max(...date);
	const curRelation = useAppSelector((state) => state.states.curRelation);
	const colorMap = useAppSelector((state) => state.states.colorMap);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="query-condition"
		>
			<section>
				<Target
					value={memoizedQuery.target.target || ""}
					color={getColorFromMap(colorMap, memoizedQuery.target.text_source)}
					options={values}
					onChange={(val) => {
						const newQuery = deepClone(memoizedQuery);
						newQuery.target.target = val;
						dispatch(setQuery(newQuery));
					}}
				></Target>
				<Divider></Divider>
			</section>
			<section>
				<Trend
					isEdit={true}
					trends={memoizedQuery.trends || []}
					onChange={(trends) => {
						const newQuery = deepClone(memoizedQuery);
						newQuery.trends = trends;
						dispatch(setQuery(newQuery));
					}}
				/>
			</section>
			<section>
				<Relation
					highlight={curRelation ?? -1}
					isEdit={true}
					relations={memoizedQuery.relations || []}
					idLength={memoizedQuery.trends?.length || 0}
					onChange={(relations) => {
						const newQuery = deepClone(memoizedQuery);
						newQuery.relations = relations;
						dispatch(setQuery(newQuery));
					}}
				/>
			</section>
			<section>
				{Array.isArray(memoizedQuery.trend_time_span_composition_conditions) ? (
					memoizedQuery.trend_time_span_composition_conditions.map((condition, index) => (
						<div key={index}>
							<Scope
								title={`Trends Time Span`}
								min={condition.time_span_condition?.min?.value ?? null}
								max={condition.time_span_condition?.max?.value ?? null}
								minInclusive={!!condition.time_span_condition?.min?.inclusive}
								maxInclusive={!!condition.time_span_condition?.max?.inclusive}
								addonBefore={[`Trend ${condition.id1}`, `Trend ${condition.id2}`]}
								onChange={(min, max, minInclusive, maxInclusive) => {
									const newQuery = deepClone(memoizedQuery);
									if (Array.isArray(newQuery.trend_time_span_composition_conditions)) {
										newQuery.trend_time_span_composition_conditions[index] = {
											...condition,
											time_span_condition: {
												min: !min ? undefined : { value: min, inclusive: minInclusive },
												max: !max ? undefined : { value: max, inclusive: maxInclusive },
											},
										};
									}
									dispatch(setQuery(newQuery));
								}}
							/>
							<Divider />
						</div>
					))
				) : (
					<>
						<Scope
							title="Total Time Span"
							addonAfter="days"
							min={memoizedQuery.trend_time_span_composition_conditions?.min?.value ?? null}
							max={memoizedQuery.trend_time_span_composition_conditions?.max?.value ?? null}
							minActiveColor={getColorFromMap(colorMap, memoizedQuery.trend_time_span_composition_conditions?.min?.text_source)}
							maxActiveColor={getColorFromMap(colorMap, memoizedQuery.trend_time_span_composition_conditions?.max?.text_source)}
							minInclusive={!!memoizedQuery.trend_time_span_composition_conditions?.min?.inclusive}
							maxInclusive={!!memoizedQuery.trend_time_span_composition_conditions?.max?.inclusive}
							valueFormatter={86400}
							onChange={(min, max, minInclusive, maxInclusive) => {
								const newQuery = deepClone(memoizedQuery);
								if (!Array.isArray(memoizedQuery.trend_time_span_composition_conditions)) {
									newQuery.trend_time_span_composition_conditions = {
										min: !min ? undefined : { value: min, inclusive: minInclusive, text_source: { text: memoizedQuery.trend_time_span_composition_conditions?.min?.text_source?.text || "", index: memoizedQuery.trend_time_span_composition_conditions?.min?.text_source?.index || 0 } },
										max: !max ? undefined : { value: max, inclusive: maxInclusive, text_source: { text: memoizedQuery.trend_time_span_composition_conditions?.max?.text_source?.text || "", index: memoizedQuery.trend_time_span_composition_conditions?.max?.text_source?.index || 0 } },
									};
								}
								dispatch(setQuery(newQuery));
							}}
						/>
						<Divider />
					</>
				)}
			</section>
			<section>
				<Scope
					title="Time Scope"
					min={memoizedQuery.time_scope_condition?.min?.value ?? null}
					max={memoizedQuery.time_scope_condition?.max?.value ?? null}
					minInclusive={!!memoizedQuery.time_scope_condition?.min?.inclusive}
					maxInclusive={!!memoizedQuery.time_scope_condition?.max?.inclusive}
					minValue={minDate}
					maxValue={maxDate}
					minActiveColor={getColorFromMap(colorMap, memoizedQuery.time_scope_condition?.min?.text_source)}
					maxActiveColor={getColorFromMap(colorMap, memoizedQuery.time_scope_condition?.max?.text_source)}
					onChange={(min, max, minInclusive, maxInclusive) => {
						const newQuery = deepClone(memoizedQuery);
						newQuery.time_scope_condition = {
							min: !min ? undefined : { value: min, inclusive: minInclusive, text_source: { text: memoizedQuery.time_scope_condition?.min?.text_source?.text || "", index: memoizedQuery.time_scope_condition?.min?.text_source?.index || 0 } },
							max: !max ? undefined : { value: max, inclusive: maxInclusive, text_source: { text: memoizedQuery.time_scope_condition?.max?.text_source?.text || "", index: memoizedQuery.time_scope_condition?.max?.text_source?.index || 0 } },
						};
						dispatch(setQuery(newQuery));
					}}
				/>
				<Divider></Divider>
			</section>
			<section>
				<Scope
					title="Max Value Scope"
					min={memoizedQuery.max_value_scope_condition?.min?.value ?? null}
					max={memoizedQuery.max_value_scope_condition?.max?.value ?? null}
					minValue={minValue}
					maxValue={maxValue}
					minActiveColor={getColorFromMap(colorMap, memoizedQuery.max_value_scope_condition?.min?.text_source)}
					maxActiveColor={getColorFromMap(colorMap, memoizedQuery.max_value_scope_condition?.max?.text_source)}
					minInclusive={!!memoizedQuery.max_value_scope_condition?.min?.inclusive}
					maxInclusive={!!memoizedQuery.max_value_scope_condition?.max?.inclusive}
					onChange={(min, max, minInclusive, maxInclusive) => {
						const newQuery = deepClone(memoizedQuery);
						newQuery.max_value_scope_condition = {
							min: !min ? undefined : { value: min, inclusive: minInclusive, text_source: { text: memoizedQuery.max_value_scope_condition?.min?.text_source?.text || "", index: memoizedQuery.max_value_scope_condition?.min?.text_source?.index || 0 } },
							max: !max ? undefined : { value: max, inclusive: maxInclusive, text_source: { text: memoizedQuery.max_value_scope_condition?.max?.text_source?.text || "", index: memoizedQuery.max_value_scope_condition?.max?.text_source?.index || 0 } },
						};
						dispatch(setQuery(newQuery));
					}}
				/>
				<Divider></Divider>
			</section>
			<section>
				<Scope
					title="Min Value Scope"
					min={memoizedQuery.min_value_scope_condition?.min?.value ?? null}
					max={memoizedQuery.min_value_scope_condition?.max?.value ?? null}
					minValue={minValue}
					maxValue={maxValue}
					minActiveColor={getColorFromMap(colorMap, memoizedQuery.min_value_scope_condition?.min?.text_source)}
					maxActiveColor={getColorFromMap(colorMap, memoizedQuery.min_value_scope_condition?.max?.text_source)}
					minInclusive={!!memoizedQuery.min_value_scope_condition?.min?.inclusive}
					maxInclusive={!!memoizedQuery.min_value_scope_condition?.max?.inclusive}
					onChange={(min, max, minInclusive, maxInclusive) => {
						const newQuery = deepClone(memoizedQuery);
						newQuery.min_value_scope_condition = {
							min: !min ? undefined : { value: min, inclusive: minInclusive, text_source: { text: memoizedQuery.min_value_scope_condition?.min?.text_source?.text || "", index: memoizedQuery.min_value_scope_condition?.min?.text_source?.index || 0 } },
							max: !max ? undefined : { value: max, inclusive: maxInclusive, text_source: { text: memoizedQuery.min_value_scope_condition?.max?.text_source?.text || "", index: memoizedQuery.min_value_scope_condition?.max?.text_source?.index || 0 } },
						};
						dispatch(setQuery(newQuery));
					}}
				/>
			</section>
		</form>
	);
}
