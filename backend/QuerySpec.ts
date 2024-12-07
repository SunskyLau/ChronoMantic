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
  comparator: Comparator;
  value: number;
};

type FrequenceAndSpan = {
  type: string; // 类型：真实世界频率还是自定义频率
};

type Pattern = {
  trend: string | null; // 趋势: up, down, flat
  extent: string | null; // 程度：strong, moderate, weak
};

type QuerySpec = {
  patterns: Pattern[]; // 趋势列表：["up", "down", "flat"]，代表先上升后下降最后平坦
  y_max_condition: ValueCondition | null; // y最大值大于或小于某个值
  y_min_condition: ValueCondition | null; // y最小值大于或小于某个值
  start_time: string | null;
  end_time: string | null;
};

type Segment = {
  start_idx: number;
  end_idx: number;
  slope: number; // 斜率
  theta: number | null; // 角度
  trend: string | null; // 趋势
  extent: string | null; // 程度：strong, moderate, weak
};

type Fragment = {
  start_idx: number;
  end_idx: number;
  segments: Segment[];
};

type FragmentList = {
  csv_name: string;
  value_column_name: string;
  time_column_name: string;
  fragments: Fragment[];
};

type TrendConfig = {
  flat_threshold: number;
  weak_threshold: number;
  strong_threshold: number;
};

// TrendConfig的默认值可以这样设置：
const defaultTrendConfig: TrendConfig = {
  flat_threshold: Math.PI / 18,
  weak_threshold: Math.PI / 6,
  strong_threshold: Math.PI / 3,
};
