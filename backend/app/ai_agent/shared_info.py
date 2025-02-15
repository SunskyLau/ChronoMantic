Segment_info = """
/**
 * Segment - 分段线性拟合的时间序列片段接口定义
 */
export interface Segment {
  start_idx: number;  // 片段起始点在原始数据中的索引位置
  end_idx: number;    // 片段终止点在原始数据中的索引位置
  slope: number;      // 片段的斜率，表示变化趋势
  start_value: number;  // 片段起始点的值
  end_value: number;    // 片段终止点的值
  max_value: number;    // 片段中的最大值
  min_value: number;    // 片段中的最小值
  start_time?: number;  // 片段起始时间，单位是秒，可选
  end_time?: number;    // 片段终止时间，单位是秒，可选
  delta_percentage?: number;  // 片段的总体变化百分比，单位是%，可选
  daily_average_delta_percentage?: number;  // 片段的日均变化百分比，单位是%，可选
  abs_slope_percentage?: number;  // 片段斜率在所有斜率中的占比，单位是%，可选
  time_span?: number;  // 片段的时间跨度，单位是秒，可选
}
"""

QuerySpecWithSource_info = """
/**
 * QuerySpec - 基础查询规范接口定义
 */
export interface ThresholdCondition {
  value: number; // 阈值值，用于定义范围的具体数值
  inclusive: boolean; // 是否包含该阈值，true表示包含，false表示不包含
}

export interface ScopeCondition {
  max?: ThresholdCondition; // 范围的最大值条件，可选
  min?: ThresholdCondition; // 范围的最小值条件，可选
}

export interface Trend {
  category: string; // 趋势类别，可以是"flat"(平稳),"up"(上升),"down"(下降)
  slope_scope_condition?: ScopeCondition; // 斜率的范围条件，用于限定趋势的斜率范围
  delta_percentage_scope_condition?: ScopeCondition; // 变化率的范围条件，用于限定趋势的百分比变化范围，单位是%，例如70就代表70%
  daily_average_delta_percentage_scope_condition?: ScopeCondition; // 日平均变化率的范围条件，用于限定趋势的日均百分比变化范围，单位是%/day，例如5就代表5%/day
  abs_slope_percentage_scope_condition?: ScopeCondition; // 斜率在所有斜率中的占比范围条件，用于限定趋势的相对斜率大小，单位是%，例如30就代表30%
  time_span_condition?: ScopeCondition; // 时间跨度的范围条件，用于限定趋势的持续时间，单位是秒，例如3600就代表1小时，1天是86400秒
}

export enum Attribute {
  SLOPE = "slope", // 斜率属性，用于比较趋势的斜率
  START_VALUE = "start_value", // 起始值属性，用于比较趋势的起始点值
  END_VALUE = "end_value", // 结束值属性，用于比较趋势的终止点值
  TIME_SPAN = "time_span", // 时间跨度属性，用于比较趋势的持续时间，单位是秒
}

export enum Comparator {
  GREATER = ">", // 大于比较符
  LESS = "<", // 小于比较符
  EQUAL = "=", // 等于比较符
  NO_GREATER = "<=", // 小于等于比较符
  NO_LESS = ">=", // 大于等于比较符
  APPROXIMATELY_EQUAL_TO = "~=", // 近似等于比较符
}

export interface Relation {
  id1: number; // 第一个趋势的ID标识，用于关系比较
  id2: number; // 第二个趋势的ID标识，用于关系比较
  attribute: Attribute; // 要比较的属性类型
  comparator: Comparator; // 比较关系的运算符
}

export interface TrendTimeSpanCompositionCondition {
  id1: number; // 起始趋势的ID，必须小于id2
  id2: number; // 结束趋势的ID，必须大于id1
  time_span_condition: ScopeCondition; // 从id1到id2之间(包括id1和id2)所有趋势的总时间跨度条件，单位是秒，例如3600就代表1小时，1天是86400秒
}

export interface QuerySpec {
  target: string; // 查询目标的时间序列名称
  trends: Trend[]; // 趋势条件列表
  relations: Relation[]; // 趋势间的关系条件列表
  trend_time_span_composition_conditions: TrendTimeSpanCompositionCondition[] | ScopeCondition; // 趋势组合的时间跨度条件，可以是条件列表或单个范围条件，如果为ScopeCondition，则表示所有趋势的总体时间跨度，单位是秒
  time_scope_condition?: ScopeCondition; // 全局时间范围的筛选条件，单位是秒，可选
  max_value_scope_condition?: ScopeCondition; // 全局最大值的范围条件，可选
  min_value_scope_condition?: ScopeCondition; // 全局最小值的范围条件，可选
}

/**
 * QuerySpecWithSource - 带有文本来源信息的查询规范接口定义
 */

export interface TextSource {
  text: string; // 来源于原始文本的文本片段，记录查询条件的原始描述
  index: number; // 用于区分text相同但是在原文中位置不同的文本来源片段，index=0表示第一个，index=1表示第二个，以此类推...
}

// 带有文本来源信息的基础条件接口
export interface CategoryWithSource {
  category: string; // 趋势类别
  text_source: TextSource; // 类别描述的文本来源信息
}

export interface ThresholdConditionWithSource extends ThresholdCondition {
  text_source: TextSource; // 阈值条件的文本来源信息
}

export interface ScopeConditionWithSource {
  max?: ThresholdConditionWithSource; // 带文本来源的最大值条件
  min?: ThresholdConditionWithSource; // 带文本来源的最小值条件
}

// 带有文本来源信息的趋势接口
export interface TrendWithSource {
  category: CategoryWithSource; // 带文本来源的趋势类别
  slope_scope_condition?: ScopeConditionWithSource; // 带文本来源的斜率范围条件
  delta_percentage_scope_condition?: ScopeConditionWithSource; // 带文本来源的变化率范围条件
  daily_average_delta_percentage_scope_condition?: ScopeConditionWithSource; // 带文本来源的日均变化率范围条件
  abs_slope_percentage_scope_condition?: ScopeConditionWithSource; // 带文本来源的相对斜率范围条件
  time_span_condition?: ScopeConditionWithSource; // 带文本来源的时间跨度条件
}

// 带有文本来源信息的关系接口
export interface RelationWithSource {
  id1: number; // 第一个趋势的ID
  id2: number; // 第二个趋势的ID
  attribute: Attribute; // 比较属性
  comparator: Comparator; // 比较运算符
  text_source: TextSource; // 关系描述的文本来源信息
}

// 带有文本来源信息的时间跨度组合条件接口
export interface TrendTimeSpanCompositionConditionWithSource {
  id1: number; // 起始趋势ID
  id2: number; // 结束趋势ID
  time_span_condition: ScopeCondition; // 时间跨度条件
  text_source: TextSource; // 时间跨度描述的文本来源信息
}

export interface TargetWithSource {
  target: string; // 查询目标名称
  text_source: TextSource; // 目标描述的文本来源信息
}

// 带有文本来源信息的完整查询规范接口
export interface QuerySpecWithSource {
  original_text: string; // 原始查询文本
  target: TargetWithSource; // 带文本来源的查询目标时间序列
  trends: TrendWithSource[]; // 带文本来源的趋势条件列表
  relations: RelationWithSource[]; // 带文本来源的关系条件列表
  trend_time_span_composition_conditions: TrendTimeSpanCompositionConditionWithSource[] | ScopeConditionWithSource; // 带文本来源的时间跨度组合条件
  time_scope_condition?: ScopeConditionWithSource; // 带文本来源的全局时间范围条件
  max_value_scope_condition?: ScopeConditionWithSource; // 带文本来源的全局最大值条件
  min_value_scope_condition?: ScopeConditionWithSource; // 带文本来源的全局最小值条件
}
"""

model_info = """
为了满足对时间序列片段的趋势和形状描述，我们使用线段拟合分割方法对时间序列进行不同模糊等级的分割预处理。分割后的时间序列是许多连续线段组成的数组，它们首尾相连形成整个通过分割模糊化后的时间序列。每一段都是一条以两个分割点为起止点的线段。通过这种线段拟合分段的方式，可以满足基本的趋势和形状查询，只需要从原段序列中匹配出满足趋势或者形状的子段序列即可。
"""

parse_nl_logic_info = """
1. 自然语言中如果出现模糊的范围表达，解析成ScopeConditionWithSource的时候需要让min和max构成一个满足模糊表达的范围，min和max不应该相等。例如，"about 2 weeks"需要解析成min对应12days，max对应16days的ScopeConditionWithSource，也就是允许一定的范围来满足模糊化的表达。因此，你需要根据语义恰当地解析出一个范围。
2. 自然语言中对于趋势和形状的描述，需要解析成TrendWithSource，其中category需要解析成趋势的类别，text_source需要解析成趋势的描述来源。比如，"rise"需要解析成"up"，"fall"需要解析成"down"，"constant"需要解析成"flat"。另外，形状的描述通常是趋势的组合，比如"two-tops"需要解析成["up","down","up","down"]的组合，"head-and-shoulders"需要解析成["up","down","up","down","up","down"]的组合。通常来讲，一个top或者peak的描述，对应一组["up","down"]的组合，一个bottom或者valley的描述，对应一组["down","up"]的组合。
3. 自然语言中如果是确切的描述，如"a duration of 20~30days"，需要解析成time_span_condition，其中min和max需要解析成相应的数值。诸如此类，需要精准识别应该解析为什么condition。
4. 如果是金融相关数据集，如自然语言中对于趋势程度的描述没有明确指定是abs_slope_percentage还是daily_average_delta_percentage，则默认解析为daily_average_delta_percentage，例如，"rose sharply"中的"sharply"需要解析为一个你认为较高的daily_average_delta_percentage_scope_condition。如果是非金融相关数据集，则默认解析为abs_slope_percentage，例如，"rose sharply"中的"sharply"需要解析为一个你认为较高的abs_slope_percentage_scope_condition。
5. TextSource的text只能是来源original_text的子文本，并且TextSource不可以和其他TextSource重叠
6. 你需要识别出自然语言中对于relation的描述，这种描述也可以分为隐式的和显式的。隐式的relation描述通常隐藏在形状的描述中，例如，"head-and-shoulders"中，中间的"head"应该要高于左右两个shoulders，这就意味着第二次上升趋势(trend_id=2)的end_value应该要大于第一次和第三次上升趋势(trend_id=0和trend_id=4)的end_value，这里relation就应该被解析出来。显式的relation描述通常是直接描述的，例如，"连续的两次上升，左边的上升速度比右边的上升速度更快"，这意味着第一次上升趋势(trend_id=0)的slope应该要大于第二次上升趋势(trend_id=1)的slope，这里relation就应该被解析出来。
"""
# TODO 7. 有关trend_time_span_composition_conditions和time_span_condition

modify_nl_logic_info = """

"""
