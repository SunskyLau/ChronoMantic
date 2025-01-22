/**
 * Foundamental Data
 */

export interface DatasetInfo {
  time_column: string;
  value_columns: string[];
  column_ratio_dict: { [key: string]: number };
}

export interface Segment {
  start_idx: number;
  end_idx: number;
  slope: number;
  start_value: number;
  end_value: number;
  max_value: number;
  min_value: number;
  start_time?: number;
  end_time?: number;
  angle?: number;
  time_span?: number;
}

export interface ApproximationSegments {
  segments: Segment[];
  approximation_level: number;
}

export interface ApproximationSegmentsContainer {
  source: string;
  approximation_segments_list: ApproximationSegments[];
  max_approximation_level: number;
}

/**
 * QuerySpec
 */
export interface ThresholdCondition {
  value: number;
  inclusive: boolean; // 是否包含该值
}

export interface SlopeScopeCondition {
  max?: ThresholdCondition;
  min?: ThresholdCondition;
}

export interface AngleScopeCondition {
  max?: ThresholdCondition;
  min?: ThresholdCondition;
}

export interface ValueScopeCondition {
  max?: ThresholdCondition;
  min?: ThresholdCondition;
}

export interface TimeScopeCondition {
  max?: ThresholdCondition;
  min?: ThresholdCondition;
}

export interface TimeSpanCondition {
  max?: ThresholdCondition;
  min?: ThresholdCondition;
}

export interface Trend {
  slope_scope_condition?: SlopeScopeCondition; // 斜率的范围条件
  angle_scope_condition?: AngleScopeCondition; // 角度的范围条件
  time_scope_condition?: TimeScopeCondition; // 时间的范围条件
  time_span_condition?: TimeSpanCondition; // 时间跨度的范围条件
}

export enum Attribute {
  SLOPE = "slope",
  ANGLE = "angle",
  START_VALUE = "start_value",
  END_VALUE = "end_value",
  TIME_SPAN = "time_span",
}

export enum Comparator {
  GREATER = ">",
  LESS = "<",
  EQUAL = "=",
  NO_GREATER = "<=",
  NO_LESS = ">=",
  APPROXIMATELY_EQUAL_TO = "~=",
}

export interface Relation {
  id1: number;
  id2: number;
  attribute: Attribute;
  comparator: Comparator;
}

export interface QuerySpec {
  target: string;
  trends?: Trend[];
  relations?: Relation[];
  time_span_condition?: TimeSpanCondition;
  time_scope_condition?: TimeScopeCondition;
  value_scope_condition?: ValueScopeCondition;
}
