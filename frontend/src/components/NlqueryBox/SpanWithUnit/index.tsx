import { Select, Typography } from "antd";
import { Unit } from "../../../types/QuerySpec";
import Span from "../Span";
import { getSecondsOfUnit } from "../../../utils/query-spec";
import { ReactNode } from "react";

interface SpanWithUnitProps {
	disabled?: boolean;
	title?: string;
	min?: number | null;
	max?: number | null;
	minInclusive?: boolean;
	maxInclusive?: boolean;
	activeColor?: string;
	addonBefore?: ReactNode | ReactNode[];
	unit?: Unit;
	isSlope?: boolean;
	onChange: (params: { min?: { value: number; inclusive: boolean }; max?: { value: number; inclusive: boolean }; unit?: Unit }) => void;
}

const UNIT_OPTIONS = Object.values(Unit).map((unit) => ({
	label: unit,
	value: unit,
}));

const convertValue = (value: number | null, fromUnit: string, toUnit: string, isSlope = false): number | null => {
	if (value === null) return null;
	const fromSeconds = getSecondsOfUnit(fromUnit as Unit);
	const toSeconds = getSecondsOfUnit(toUnit as Unit);

	if (isSlope) {
		return value * (toSeconds / fromSeconds);
	} else {
		return value * (fromSeconds / toSeconds);
	}
};

export default function SpanWithUnit({ title, disabled, min, max, minInclusive, maxInclusive, activeColor, unit, onChange, addonBefore, isSlope = false }: SpanWithUnitProps) {
	return (
		<>
			{title && (
				<Typography.Title
					level={4}
					keyboard
				>
					{title}
				</Typography.Title>
			)}
			<Span
				disabled={disabled}
				min={min ?? null}
				max={max ?? null}
				addonBefore={addonBefore ?? undefined}
				activeColor={activeColor}
				minInclusive={minInclusive ?? false}
				maxInclusive={maxInclusive ?? false}
				addonAfter={
					unit && (
						<Select
							disabled={disabled}
							value={unit}
							popupMatchSelectWidth={false}
							options={UNIT_OPTIONS}
							onChange={(newUnit) => {
								const oldUnit = unit;
								const newMin = min !== null ? convertValue(min ?? 0, oldUnit, newUnit, isSlope) : null;
								const newMax = max !== null ? convertValue(max ?? 0, oldUnit, newUnit, isSlope) : null;

								onChange({
									min:
										typeof newMin === "number"
											? {
													value: newMin,
													inclusive: !!minInclusive,
											  }
											: undefined,
									max:
										typeof newMax === "number"
											? {
													value: newMax,
													inclusive: !!maxInclusive,
											  }
											: undefined,
									unit: newUnit,
								});
							}}
						/>
					)
				}
				onChange={(newMin, newMax, newMinInclusive, newMaxInclusive) => {
					onChange({
						min:
							typeof newMin === "number"
								? {
										value: newMin,
										inclusive: newMinInclusive,
								  }
								: undefined,
						max:
							typeof newMax === "number"
								? {
										value: newMax,
										inclusive: newMaxInclusive,
								  }
								: undefined,
						unit,
					});
				}}
			/>
		</>
	);
}
