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
  delta_percentage?: number;
  daily_average_delta_percentage?: number;
  abs_slope_percentage?: number;
  time_span?: number;
}

export interface ApproximationSegments {
  segments: Segment[];
  approximation_level: number;
}

export interface ApproximationSegmentsContainer {
  source: string;
  approximation_segments_list: ApproximationSegments[]; // 近似的连续分段列表
  max_approximation_level: number;
}

/**
 * QuerySpec
 */
export interface ThresholdCondition {
  value: number; // 阈值
  inclusive: boolean; // 是否包含该值
}

export interface ScopeCondition {
  max?: ThresholdCondition; // 最大值
  min?: ThresholdCondition; // 最小值
}

export interface Trend {
  category: string; // "flat","up","down"
  slope_scope_condition?: ScopeCondition; // 斜率的范围条件
  delta_percentage_scope_condition?: ScopeCondition; // 变化率的范围条件
  daily_average_delta_percentage_scope_condition?: ScopeCondition; // 平均变化率的范围条件
  abs_slope_percentage_scope_condition?: ScopeCondition; // 斜率在所有斜率中的占比范围条件
  time_span_condition?: ScopeCondition; // 时间跨度的范围条件
}

export enum Attribute {
  SLOPE = "slope", // 斜率
  START_VALUE = "start_value", // 起始值
  END_VALUE = "end_value", // 结束值
  TIME_SPAN = "time_span", // 时间跨度
}

export enum Comparator {
  GREATER = ">", // 大于
  LESS = "<", // 小于
  EQUAL = "=", // 等于
  NO_GREATER = "<=", // 小于等于
  NO_LESS = ">=", // 大于等于
  APPROXIMATELY_EQUAL_TO = "~=", // 近似等于
}

export interface Relation {
  id1: number; // 趋势1的id
  id2: number; // 趋势2的id
  attribute: Attribute; // 比较的属性
  comparator: Comparator; // 比较关系
}

export interface TrendTimeSpanCompositionCondition {
  id1: number; // 趋势1的id，其中id1应该小于id2
  id2: number; // 趋势2的id，其中id1应该小于id2
  time_span_condition: ScopeCondition; // 代表从id1到id2的之间(包括id1和id2)所有趋势的总体时间跨度
}

export interface QuerySpec {
  target: string; // 查询的目标时间序列名
  trends: Trend[]; // 趋势列表
  relations: Relation[]; // 不同趋势之间的属性比较关系列表
  trend_time_span_composition_conditions: TrendTimeSpanCompositionCondition[] | ScopeCondition; // 趋势时间跨度组合条件列表，如果为ScopeCondition，则表示所有趋势的总体时间跨度
  time_scope_condition?: ScopeCondition; // 搜索时间的范围条件
  max_value_scope_condition?: ScopeCondition; // 最大值的范围条件
  min_value_scope_condition?: ScopeCondition; // 最小值的范围条件
}

/**
 * QuerySpecWithSource
 */

export interface TextSource {
  text: string; // 原始文本片段
  start: number; // 在原文中的起始位置
  end: number; // 在原文中的结束位置
}

// 基础条件的 WithSource 版本
export interface CategoryWithSource {
  category: string;
  text_source: TextSource;
}

export interface ThresholdConditionWithSource extends ThresholdCondition {
  text_source: TextSource;
}

export interface ScopeConditionWithSource {
  max?: ThresholdConditionWithSource;
  min?: ThresholdConditionWithSource;
}

// 趋势的 WithSource 版本
export interface TrendWithSource {
  category: CategoryWithSource;
  slope_scope_condition?: ScopeConditionWithSource;
  delta_percentage_scope_condition?: ScopeConditionWithSource;
  daily_average_delta_percentage_scope_condition?: ScopeConditionWithSource;
  abs_slope_percentage_scope_condition?: ScopeConditionWithSource;
  time_span_condition?: ScopeConditionWithSource;
}

// 关系的 WithSource 版本
export interface RelationWithSource {
  id1: number;
  id2: number;
  attribute: Attribute;
  comparator: Comparator;
  text_source: TextSource;
}

// 时间跨度组合条件的 WithSource 版本
export interface TrendTimeSpanCompositionConditionWithSource {
  id1: number;
  id2: number;
  time_span_condition: ScopeCondition;
  text_source: TextSource;
}

export interface TargetWithSource {
  target: string;
  text_source: TextSource;
}

// 查询规范的 WithSource 版本
export interface QuerySpecWithSource {
  original_text: string;
  target: TargetWithSource;
  trends: TrendWithSource[];
  relations: RelationWithSource[];
  trend_time_span_composition_conditions: TrendTimeSpanCompositionConditionWithSource[] | ScopeConditionWithSource;
  time_scope_condition?: ScopeConditionWithSource;
  max_value_scope_condition?: ScopeConditionWithSource;
  min_value_scope_condition?: ScopeConditionWithSource;
}
