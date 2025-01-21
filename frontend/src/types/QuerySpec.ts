export enum TimeGranularity {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
}

export enum Extent {
  WEAK = "weak",
  MODERATE = "moderate",
  STRONG = "strong",
}

export type ValueCondition = {
  comparator: Comparator | null;
  value: number | null;
};

export type FrequenceAndSpan = {
  type: string | null;
};

export type Pattern = {
  trend: string | null;
  extent: string | null;
};

export type Segment = {
  start_idx: number;
  end_idx: number;
  slope: number;
  start_value: number;
  end_value: number;
  start_time: number | null;
  end_time: number | null;
  angle: number | null;
  time_span: number | null;
};

export type Fragment = {
  start_idx: number;
  end_idx: number;
  segments: Segment[] | null;
  avg_loss?: number | undefined;
  source: string;
};

export type FragmentList = {
  csv_name: string | null;
  value_column_name: string | null;
  time_column_name: string | null;
  fragments: Fragment[] | null;
};

export type TrendConfig = {
  flat_threshold: number | null;
  weak_threshold: number | null;
  strong_threshold: number | null;
};

export enum Attribute {
  SLOPE = "slope",
  ANGLE = "angle",
  START_VALUE = "start_value",
  END_VALUE = "end_value",
  TIME_SPAN = "time_span"
}

export enum Comparator {
  GREATER = ">",
  LESS = "<",
  EQUAL = "=",
  NO_GREATER = "<=",
  NO_LESS = ">=",
  APPROXIMATELY_EQUAL_TO = "~="
}

export interface ThresholdCondition {
  value?: number;
  inclusive?: boolean;
}

export interface ScopeCondition {
  max?: ThresholdCondition | null;
  min?: ThresholdCondition | null;
}

export interface Trend {
  slope_scope_condition?: ScopeCondition | null;
  angle_scope_condition?: ScopeCondition | null;
  time_scope_condition?: ScopeCondition | null;
  time_span_condition?: ScopeCondition | null;
}

export interface Relation {
  id1?: number;
  id2?: number;
  attribute?: Attribute;
  comparator?: Comparator;
}

export interface QuerySpec {
  target?: string;
  trends?: Trend[];
  relations?: Relation[];
  time_span_condition?: ScopeCondition;
  time_scope_condition?: ScopeCondition;
  value_scope_condition?: ScopeCondition;
}

export type Query = { text: string; condition?: QuerySpec }[];