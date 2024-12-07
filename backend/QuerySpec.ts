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

export type ValueCondition = {
  comparator: Comparator;
  value: number;
};

export type FrequenceAndSpan = {
  type: string; // 类型：真实世界频率还是自定义频率
};

export type Pattern = {
  trend: string | null; // 趋势: up, down, flat
  extent: string | null; // 程度：strong, moderate, weak
};

export type QuerySpec = {
  value_column_name: string; // 数值列名
  time_stamp_column_name: string; // 时间戳列名
  patterns: Pattern[]; // 趋势列表：["up", "down", "flat"]，代表先上升后下降最后平坦
  y_max_condition: ValueCondition | null; // y最大值大于或小于某个值
  y_min_condition: ValueCondition | null; // y最小值大于或小于某个值
  time_granularity: TimeGranularity;
  start_time: string | null;
  end_time: string | null;
};

export type Segment = {
  start_idx: number;
  end_idx: number;
  slope: number; // 斜率
  theta: number | null; // 角度
  trend: string | null; // 趋势
  extent: string | null; // 程度：strong, moderate, weak
};

export type Fragment = {
  column_name: string;
  start_idx: number;
  end_idx: number;
  segments: Segment[];
};

export type TrendConfig = {
  flat_threshold: number;
  weak_threshold: number;
  strong_threshold: number;
};
