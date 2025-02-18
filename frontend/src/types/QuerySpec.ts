/**
 * Foundamental Data
 */

export interface DatasetInfo {
  time_column: string;
  value_columns: string[];
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
  // 近似的连续分段
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
  delta_percentage_scope_condition?: ScopeCondition; // 变化率的范围条件, 单位是%，例如70就代表70%
  daily_average_delta_percentage_scope_condition?: ScopeCondition; // 日平均变化率的范围条件, 单位是%/day，例如5就代表5%/day
  abs_slope_percentage_scope_condition?: ScopeCondition; // 斜率在所有斜率中的占比范围条件, 单位是%，例如30就代表30%
  time_span_condition?: ScopeCondition; // 时间跨度的范围条件, 单位是秒
}

export enum Attribute {
  SLOPE = "slope", // 斜率
  START_VALUE = "start_value", // 起始值
  END_VALUE = "end_value", // 结束值
  TIME_SPAN = "time_span", // 时间跨度, 单位是秒
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
  // 不同trend之间的属性比较关系
  id1: number; // 趋势1的id
  id2: number; // 趋势2的id
  attribute: Attribute; // 比较的属性
  comparator: Comparator; // 比较关系
}

export interface TrendTimeSpanCompositionCondition {
  // 趋势时间跨度组合条件
  id1: number; // 趋势1的id，其中id1应该小于id2
  id2: number; // 趋势2的id，其中id1应该小于id2
  time_span_condition: ScopeCondition; // 代表从id1到id2的之间(包括id1和id2)所有趋势的总体时间跨度, 单位是秒
}

export interface QuerySpec {
  target: string; // 查询的目标时间序列名
  trends: Trend[]; // 趋势列表
  relations: Relation[]; // 不同趋势之间的属性比较关系列表
  trend_time_span_composition_conditions: TrendTimeSpanCompositionCondition[] | ScopeCondition; // 趋势时间跨度组合条件列表，如果为ScopeCondition，则表示所有趋势的总体时间跨度, 单位是秒
  time_scope_condition?: ScopeCondition; // 搜索时间的范围条件
  max_value_scope_condition?: ScopeCondition; // 最大值的范围条件
  min_value_scope_condition?: ScopeCondition; // 最小值的范围条件
}

/**
 * QuerySpecWithSource
 */

export interface TextSource {
  text: string; // 原始文本片段
  index: number; // 用于区分text相同但是在原文中位置不同的文本片段，index=0表示第一个，index=1表示第二个，以此类推
  disabled?: boolean; // 是否禁用
}

export interface WithSource {
  text_source?: TextSource;
}

// 基础条件的 WithSource 版本
export interface CategoryWithSource extends WithSource {
  category: string;
}

export interface ThresholdConditionWithSource extends ThresholdCondition, WithSource { }

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
export interface RelationWithSource extends Relation, WithSource { }

// 时间跨度组合条件的 WithSource 版本
export interface TrendTimeSpanCompositionConditionWithSource extends TrendTimeSpanCompositionCondition, WithSource { }

export interface TargetWithSource extends WithSource {
  target: string;
}

// 查询规范的 WithSource 版本
export interface QuerySpecWithSource {
  original_text: string;
  target: TargetWithSource;
  trends: TrendWithSource[];
  relations?: RelationWithSource[];
  trend_time_span_composition_conditions?: TrendTimeSpanCompositionConditionWithSource[] | ScopeConditionWithSource;
  time_scope_condition?: ScopeConditionWithSource;
  max_value_scope_condition?: ScopeConditionWithSource;
  min_value_scope_condition?: ScopeConditionWithSource;
}

export function formatQuerySpec(query: QuerySpecWithSource): QuerySpec {
  // 格式化 ScopeCondition
  const formatScopeCondition = (scope?: ScopeConditionWithSource): ScopeCondition | undefined => {
    if (!scope) return undefined;
    return {
      max: scope.max && !scope.max.text_source?.disabled ? {
        value: scope.max.value,
        inclusive: scope.max.inclusive
      } : undefined,
      min: scope.min && !scope.min.text_source?.disabled ? {
        value: scope.min.value,
        inclusive: scope.min.inclusive
      } : undefined
    };
  };

  // 格式化 Trend
  const formatTrend = (trend: TrendWithSource): Trend => ({
    category: trend.category.category,
    slope_scope_condition: formatScopeCondition(trend.slope_scope_condition),
    delta_percentage_scope_condition: formatScopeCondition(trend.delta_percentage_scope_condition),
    daily_average_delta_percentage_scope_condition: formatScopeCondition(trend.daily_average_delta_percentage_scope_condition),
    abs_slope_percentage_scope_condition: formatScopeCondition(trend.abs_slope_percentage_scope_condition),
    time_span_condition: formatScopeCondition(trend.time_span_condition)
  });

  // 格式化 Relation，过滤掉禁用的关系
  const formatRelation = (relation: RelationWithSource): Relation | null => {
    if (relation.text_source?.disabled) return null;
    return {
      id1: relation.id1,
      id2: relation.id2,
      attribute: relation.attribute,
      comparator: relation.comparator
    };
  };

  // 格式化 TrendTimeSpanCompositionCondition，过滤掉禁用的条件
  const formatTimeSpanComposition = (condition: TrendTimeSpanCompositionConditionWithSource): TrendTimeSpanCompositionCondition | null => {
    if (condition.text_source?.disabled) return null;
    return {
      id1: condition.id1,
      id2: condition.id2,
      time_span_condition: formatScopeCondition(condition.time_span_condition) || { min: undefined, max: undefined }
    };
  };

  // 格式化 trend_time_span_composition_conditions
  const formatTimeSpanConditions = (conditions?: TrendTimeSpanCompositionConditionWithSource[] | ScopeConditionWithSource) => {
    if (!conditions) return undefined;
    if (Array.isArray(conditions)) {
      const filteredConditions = conditions
        .map(formatTimeSpanComposition)
        .filter((condition): condition is TrendTimeSpanCompositionCondition => condition !== null);
      return filteredConditions;
    }
    return formatScopeCondition(conditions);
  };

  // 过滤掉禁用的趋势
  const filteredTrends = query.trends
    .filter(trend => !trend.category.text_source?.disabled)
    .map(formatTrend);

  // 过滤掉禁用的关系
  const filteredRelations = (query.relations || [])
    .map(formatRelation)
    .filter((relation): relation is Relation => relation !== null);

  return {
    target: query.target.target,
    trends: filteredTrends,
    relations: filteredRelations,
    trend_time_span_composition_conditions: formatTimeSpanConditions(query.trend_time_span_composition_conditions) || [],
    time_scope_condition: formatScopeCondition(query.time_scope_condition),
    max_value_scope_condition: formatScopeCondition(query.max_value_scope_condition),
    min_value_scope_condition: formatScopeCondition(query.min_value_scope_condition)
  };
}

/**
 * Intentions
 */

/**
 * SingleChoice - 单个趋势的可选属性枚举
 */
export enum SingleChoice {
  CATEGORY = "category", // 趋势类别
  SLOPE = "slope", // 斜率属性
  DELTA_PERCENTAGE = "delta_percentage", // 变化率属性,单位是%
  DAILY_AVERAGE_DELTA_PERCENTAGE = "daily_average_delta_percentage", // 日均变化率属性,单位是%/day
  ABS_SLOPE_PERCENTAGE = "abs_slope_percentage", // 斜率占比属性,单位是%
  TIME_SPAN = "time_span", // 时间跨度属性,单位是秒
}

/**
 * GroupChoice - 趋势组合的可选属性枚举
 */
export enum GroupChoice {
  TREND_TIME_SPAN_COMPOSITION_CONDITION = "trend_time_span_composition_condition", // 趋势组合的时间跨度条件
}

/**
 * SingleIntention - 单个趋势的意图接口定义
 */
export interface SingleIntention {
  id: number; // 趋势的ID标识
  single_choices: SingleChoice[]; // 该趋势需要考虑的属性列表
}

/**
 * GroupIntention - 趋势组合的意图接口定义
 */
export interface GroupIntention {
  ids: number[]; // 组合中包含的趋势ID列表
  group_choice: GroupChoice; // 该组合需要考虑的属性
}

/**
 * RelationChoice - 趋势关系的可选属性枚举
 */
export enum RelationChoice {
  SLOPE = "slope", // 斜率关系
  START_VALUE = "start_value", // 起始值关系
  END_VALUE = "end_value", // 结束值关系
  TIME_SPAN = "time_span", // 时间跨度关系
}

/**
 * RelationIntention - 趋势关系的意图接口定义
 */
export interface RelationIntention {
  id1: number; // 第一个趋势的ID
  id2: number; // 第二个趋势的ID
  relation_choice: RelationChoice; // 需要比较的关系属性
}

/**
 * Intentions - 整体查询意图的接口定义
 */
export interface Intentions {
  single_intentions: SingleIntention[]; // 单个趋势的意图列表
  group_intentions: GroupIntention[]; // 趋势组合的意图列表
  relation_intentions: RelationIntention[]; // 趋势关系的意图列表
}
