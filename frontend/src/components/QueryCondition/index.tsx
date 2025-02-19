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
import TrendGroup from "../NlqueryBox/TrendGroup";
import GroupRelation from "../NlqueryBox/GroupRelation";
import { getColorFromMap } from "../../utils/color";
import { QuerySpecWithSource, ScopeConditionWithSource } from "../../types/QuerySpec";

const emptyQuerySpec: QuerySpecWithSource = {
	original_text: "",
	target: {
		target: "",
	},
	trends: [],
	single_relations: [],
	trend_groups: [],
	group_relations: [],
	time_span_condition: {},
	time_scope_condition: {},
	max_value_scope_condition: {},
	min_value_scope_condition: {},
};

const updateScopeCondition = (condition: ScopeConditionWithSource, min: number | null, max: number | null, minInclusive: boolean, maxInclusive: boolean): ScopeConditionWithSource => {
	return {
		min: !min ? undefined : { value: min, inclusive: minInclusive },
		max: !max ? undefined : { value: max, inclusive: maxInclusive },
		text_source: condition.text_source,
	};
};

type ScopeConditionKeys = Extract<keyof QuerySpecWithSource, `${string}_condition`>;

export default function QueryCondition() {
	const query = useAppSelector((state) => state.states.query);
	const memoizedQuery = useMemo(() => deepClone(query) || emptyQuerySpec, [query]);
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

	const scopeConfigs = [
		{
			title: "Time Span",
			condition: memoizedQuery.time_span_condition,
			addonAfter: "days",
			valueFormatter: 86400,
		},
		{
			title: "Time Scope",
			condition: memoizedQuery.time_scope_condition,
			minValue: minDate,
			maxValue: maxDate,
		},
		{
			title: "Max Value Scope",
			condition: memoizedQuery.max_value_scope_condition,
			minValue: minValue,
			maxValue: maxValue,
		},
		{
			title: "Min Value Scope",
			condition: memoizedQuery.min_value_scope_condition,
			minValue: minValue,
			maxValue: maxValue,
		},
	];

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
				/>
				<Divider />
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
					relations={memoizedQuery.single_relations || []}
					idLength={memoizedQuery.trends?.length || 0}
					onChange={(relations) => {
						const newQuery = deepClone(memoizedQuery);
						newQuery.single_relations = relations;
						dispatch(setQuery(newQuery));
					}}
				/>
			</section>

			<section>
				<TrendGroup
					isEdit={true}
					groups={memoizedQuery.trend_groups || []}
					idLength={memoizedQuery.trends?.length || 0}
					onChange={(groups) => {
						const newQuery = deepClone(memoizedQuery);
						newQuery.trend_groups = groups;
						dispatch(setQuery(newQuery));
					}}
				/>
				<Divider />
			</section>

			<section>
				<GroupRelation
					isEdit={true}
					relations={memoizedQuery.group_relations || []}
					trends={memoizedQuery.trends || []}
					onChange={(relations) => {
						const newQuery = deepClone(memoizedQuery);
						newQuery.group_relations = relations;
						dispatch(setQuery(newQuery));
					}}
				/>
				<Divider />
			</section>

			{scopeConfigs.map(({ title, condition, ...props }, index) => (
				<section key={index}>
					<Scope
						title={title}
						min={condition?.min?.value ?? null}
						max={condition?.max?.value ?? null}
						activeColor={getColorFromMap(colorMap, condition?.text_source)}
						minInclusive={!!condition?.min?.inclusive}
						maxInclusive={!!condition?.max?.inclusive}
						{...props}
						onChange={(min, max, minInclusive, maxInclusive) => {
							const newQuery = deepClone(memoizedQuery);
							const key = (title.toLowerCase().replace(/\s/g, "_") + "_condition") as ScopeConditionKeys;
							newQuery[key] = updateScopeCondition(condition || {}, min, max, minInclusive, maxInclusive);
							dispatch(setQuery(newQuery));
						}}
					/>
					<Divider />
				</section>
			))}
		</form>
	);
}
