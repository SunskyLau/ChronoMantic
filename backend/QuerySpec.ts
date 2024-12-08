enum TimeGranularity {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
}

enum Comparator {
  GREATER = ">",
  LESS = "<",
  EQUAL = "=",
  NO_LESS = ">=",
  NO_GREATER = "<=",
}

type ValueCondition = {
  comparator: Comparator | null;
  value: number | null;
};

type FrequenceAndSpan = {
  type: string | null;
};

type Pattern = {
  trend: string | null;
  extent: string | null;
};

type QuerySpec = {
  TimeGranularity: TimeGranularity | null;
  valueColumnName: string | null;
  patterns: Pattern[] | null;
  y_max_condition: ValueCondition | null;
  y_min_condition: ValueCondition | null;
  start_time: string | null;
  end_time: string | null;
};

type Segment = {
  start_idx: number | null;
  end_idx: number | null;
  slope: number | null;
  theta: number | null;
  trend: string | null;
  extent: string | null;
};

type Fragment = {
  start_idx: number | null;
  end_idx: number | null;
  segments: Segment[] | null;
};

type FragmentList = {
  csv_name: string | null;
  value_column_name: string | null;
  time_column_name: string | null;
  fragments: Fragment[] | null;
};

type TrendConfig = {
  flat_threshold: number | null;
  weak_threshold: number | null;
  strong_threshold: number | null;
};
