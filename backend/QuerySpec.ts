export enum TimeGranularity {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
}

export enum Comparator {
  GREATER = ">",
  LESS = "<",
  EQUAL = "=",
  NO_LESS = ">=",
  NO_GREATER = "<=",
}

export enum Trend {
  UP = "up",
  DOWN = "down",
  FLAT = "flat",
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

export type QuerySpec = {
  source: string | Metadata; //可以直接指定source，也可以间接指定其metadata
  patterns: Pattern[] | null;
  y_max_condition: ValueCondition | null;
  y_min_condition: ValueCondition | null;
  start_time_condition: string | null;
  end_time_condition: string | null;
  time_span: [number, number] | null;
};

export type Metadata = {
  [key: string]: [];
};

export type Segment = {
  start_idx: number;
  end_idx: number;
  slope: number | null;
  theta: number | null;
  trend: string | null;
  extent: string | null;
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
