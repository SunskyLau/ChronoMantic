Segment_info = """
/**
 * Segment - 分段线性拟合的时间序列片段接口定义
 */
export interface Segment {
  source: string; // 片段的来源，可以是"result"或者"user",分别代表来源于查询结果和用户指定新增的
  slope: number;      // 片段的斜率，表示变化趋势
  start_value: number;  // 片段起始点的值
  end_value: number;    // 片段终止点的值
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
  delta_percentage_scope_condition?: ScopeCondition; // 变化率的范围条件，用于限定趋势的百分比变化范围，单位是%，例如70就代表70%,可以是负数
  daily_average_delta_percentage_scope_condition?: ScopeCondition; // 日平均变化率的范围条件，用于限定趋势的日均百分比变化范围，单位是%/day，例如5就代表5%/day，可以是负数
  abs_slope_percentage_scope_condition?: ScopeCondition; // 斜率在所有斜率中的占比范围条件，用于限定趋势的相对斜率大小，单位是%，例如30就代表30%
  time_span_condition?: ScopeCondition; // 时间跨度的范围条件，用于限定趋势的持续时间，单位是秒，例如3600就代表1小时，1天是86400秒
}

export enum SingleAttribute {
  SLOPE = "slope", // 斜率属性，用于比较趋势的斜率
  START_VALUE = "start_value", // 起始值属性，用于比较趋势的起始点值
  END_VALUE = "end_value", // 结束值属性，用于比较趋势的终止点值
  TIME_SPAN = "time_span", // 时间跨度属性，用于比较趋势的持续时间，单位是秒
  DELTA_PERCENTAGE = "delta_percentage", // 变化率属性，单位是%
  DAILY_AVERAGE_DELTA_PERCENTAGE = "daily_average_delta_percentage", // 日均变化率属性，单位是%/day
  ABS_SLOPE_PERCENTAGE = "abs_slope_percentage" // 斜率占比属性，单位是%
}

export enum GroupAttribute {
  TIME_SPAN = "time_span", // 时间跨度属性，单位是秒
}

export enum Comparator {
  GREATER = ">", // 大于比较符
  LESS = "<", // 小于比较符
  EQUAL = "=", // 等于比较符
  NO_GREATER = "<=", // 小于等于比较符
  NO_LESS = ">=", // 大于等于比较符
  APPROXIMATELY_EQUAL_TO = "~=", // 近似等于比较符
}

export interface SingleRelation {
  id1: number; // 第一个趋势的ID标识，用于关系比较
  id2: number; // 第二个趋势的ID标识，用于关系比较
  attribute: SingleAttribute; // 要比较的属性类型
  comparator: Comparator; // 比较关系的运算符
}

export interface TrendGroup {
  ids: [number, number]; // 组合中包含的趋势ID列表，ids[1]>=ids[0]
  time_span_condition: ScopeCondition; // 时间跨度条件，单位是秒
}

export interface GroupRelation {
  group1: [number, number]; // 第一个趋势组合的ID列表，group1[1]>=group1[0]
  group2: [number, number]; // 第二个趋势组合的ID列表，group2[1]>=group2[0]
  attribute: GroupAttribute; // 要比较的属性类型
  comparator: Comparator; // 比较关系的运算符
}

export interface QuerySpec {
  target: string; // 查询目标的时间序列名称
  trends: Trend[]; // 趋势条件列表
  single_relations: SingleRelation[]; // 趋势间的关系条件列表
  trend_groups: TrendGroup[]; // 趋势组合列表
  group_relations: GroupRelation[]; // 组合关系列表
  time_span_condition?: ScopeCondition; // 全局时间跨度条件，单位是秒，可选
  time_scope_condition?: ScopeCondition; // 全局时间范围的筛选条件，单位是秒，可选
  max_value_scope_condition?: ScopeCondition; // 全局最大值的范围条件，可选
  min_value_scope_condition?: ScopeCondition; // 全局最小值的范围条件，可选
}

/**
 * QuerySpecWithSource - 带有文本来源信息的查询规范接口定义
 */

export interface TextSource {
  text: str; // 原始文本片段
  index: int; // 用于区分text相同但是在原文中位置不同的文本片段，index=0表示第一个，index=1表示第二个，以此类推
}

export interface WithSource {
  text_source: TextSource; // 对应的原始文本信息
}

// 基础条件的 WithSource 版本
export interface CategoryWithSource extends WithSource {
  category: TrendCategory; // 趋势类别
}

export interface ScopeConditionWithSource extends WithSource, ScopeCondition {}

// 单趋势的 WithSource 版本
export interface TrendWithSource {
  category: CategoryWithSource; // 趋势类别
  slope_scope_condition?: ScopeConditionWithSource; // 斜率的范围条件
  delta_percentage_scope_condition?: ScopeConditionWithSource; // 变化率的范围条件
  daily_average_delta_percentage_scope_condition?: ScopeConditionWithSource; // 日平均变化率的范围条件
  abs_slope_percentage_scope_condition?: ScopeConditionWithSource; // 斜率占比的范围条件
  time_span_condition?: ScopeConditionWithSource; // 时间跨度的范围条件
}

// 单趋势关系的 WithSource 版本
export interface SingleRelationWithSource extends SingleRelation, WithSource {}

// 趋势组合的 WithSource 版本
export interface TrendGroupWithSource extends TrendGroup, WithSource {}

// 组合关系的 WithSource 版本
export interface GroupRelationWithSource extends GroupRelation, WithSource {}

export interface TargetWithSource extends WithSource {
  target: string; // 目标时间序列名
}

export interface QuerySpecWithSource {
  original_text: string; // 原始查询文本
  target: TargetWithSource; // 查询目标
  trends: TrendWithSource[]; // 趋势列表
  single_relations: SingleRelationWithSource[]; // 单趋势关系列表
  trend_groups: TrendGroupWithSource[]; // 趋势组合列表
  group_relations: GroupRelationWithSource[]; // 组合关系列表
  time_span_condition?: ScopeConditionWithSource; // 总时间跨度的范围条件
  time_scope_condition?: ScopeConditionWithSource; // 时间范围的范围条件
  max_value_scope_condition?: ScopeConditionWithSource; // 最大值的范围条件
  min_value_scope_condition?: ScopeConditionWithSource; // 最小值的范围条件
}
"""

intentions_info = """
/**
 * Intentions
 */

export enum SingleChoice {
  CATEGORY = "category", // 趋势类别
  SLOPE = "slope", // 斜率属性
  DELTA_PERCENTAGE = "delta_percentage", // 变化率属性,单位是%
  DAILY_AVERAGE_DELTA_PERCENTAGE = "daily_average_delta_percentage", // 日均变化率属性,单位是%/day
  ABS_SLOPE_PERCENTAGE = "abs_slope_percentage", // 斜率占比属性,单位是%
  TIME_SPAN = "time_span", // 时间跨度属性,单位是秒
}

export enum GroupChoice {
  TIME_SPAN = "time_span", // 时间跨度属性
}

export interface SingleIntention {
  id: number; // 趋势的ID标识
  single_choices: SingleChoice[]; // 该趋势需要考虑用作自然语言查询调整的属性列表
}

export interface GroupIntention {
  ids: [number, number]; // 组合中包含的趋势ID列表，ids[1]>=ids[0]
  group_choices: GroupChoice[]; // 该组合需要考虑用作自然语言查询调整的属性列表
}

export enum SingleRelationChoice {
  SLOPE = "slope", // 斜率关系
  START_VALUE = "start_value", // 起始值关系
  END_VALUE = "end_value", // 结束值关系
  TIME_SPAN = "time_span", // 时间跨度关系
  DELTA_PERCENTAGE = "delta_percentage", // 变化率关系
  DAILY_AVERAGE_DELTA_PERCENTAGE = "daily_average_delta_percentage", // 日均变化率关系
  ABS_SLOPE_PERCENTAGE = "abs_slope_percentage", // 斜率占比关系
}

export enum GroupRelationChoice {
  TIME_SPAN = "time_span", // 时间跨度关系
}

export interface SingleRelationIntention {
  id1: number; // 第一个趋势的ID
  id2: number; // 第二个趋势的ID
  relation_choices: SingleRelationChoice[]; // 考虑作为自然语言查询调整的单个趋势间比较属性
}

export interface GroupRelationIntention {
  group1: [number, number]; // 第一个趋势组合的ID列表，group1[1]>=group1[0]
  group2: [number, number]; // 第二个趋势组合的ID列表，group2[1]>=group2[0]
  relation_choices: GroupRelationChoice[]; // 考虑作为自然语言查询调整的组合间比较属性
}

export interface Intentions {
  single_intentions: SingleIntention[]; // 单个趋势的意图列表
  group_intentions: GroupIntention[]; // 趋势组合的意图列表
  single_relation_intentions: SingleRelationIntention[]; // 单个趋势关系的意图列表
  group_relation_intentions: GroupRelationIntention[]; // 趋势组合关系的意图列表
}
"""

model_info = """
为了满足对时间序列片段的趋势和形状描述，我们使用线段拟合分割方法对时间序列进行不同模糊等级的分割预处理。分割后的时间序列是许多连续线段组成的数组，它们首尾相连形成整个通过分割模糊化后的时间序列。每一段都是一条以两个分割点为起止点的线段。通过这种线段拟合分段的方式，可以满足基本的趋势和形状查询，只需要从原段序列中匹配出满足趋势或者形状的子段序列即可。
"""

parse_nl_logic_info = """
1. 自然语言中如果出现模糊的范围表达，解析成ScopeConditionWithSource的时候需要让min和max构成一个满足模糊表达的范围，min和max不应该相等。例如，"about 2 weeks"需要解析成min对应12days，max对应16days的ScopeConditionWithSource，也就是允许一个比原数值更小的数和更大的数来组成这个模糊的范围。因此，你需要根据语义恰当地解析出一个范围。
2. 自然语言中对于趋势和形状的描述，需要解析成TrendWithSource，其中category需要解析成趋势的类别，text_source需要解析成趋势的描述来源。比如，"rise"需要解析成"up"，"fall"需要解析成"down"，"constant"需要解析成"flat"。另外，形状的描述通常是趋势的组合，比如"two-tops"需要解析成["up","down","up","down"]的组合，"head-and-shoulders"需要解析成["up","down","up","down","up","down"]的组合。通常来讲，一个top或者peak的描述，对应一组["up","down"]的组合，一个bottom或者valley的描述，对应一组["down","up"]的组合。
3. 自然语言中如果是确切的描述，如"a duration of 20~30days"，需要解析成time_span_condition，其中min和max需要解析成相应的数值。例如"Rising at an average rate of 7% per day"，需要解析成daily_average_delta_percentage_scope_condition，其中min和max需要解析成相应的数值。诸如此类，需要精准识别应该解析为什么condition。
4. 如果是金融相关数据集，如自然语言中对于趋势程度的描述没有明确指定是abs_slope_percentage还是daily_average_delta_percentage，则默认解析为daily_average_delta_percentage，例如，"rose sharply"中的"sharply"需要解析为一个你认为较高的daily_average_delta_percentage_scope_condition。如果是非金融相关数据集，则默认解析为abs_slope_percentage，例如，"rose sharply"中的"sharply"需要解析为一个你认为较高的abs_slope_percentage_scope_condition。
5. TextSource的text只能是来源original_text的子文本，并且TextSource不可以和其他TextSource重叠。例如，"two consecutive rises", 如果"rises"被解析为一个TextSource，那么"two consecutive rises"就不应该被解析为TextSource，因为"two consecutive rises"已经包含了"rises"，不允许出现重叠的TextSource。
6. 你需要识别出自然语言中对于relation的描述，这种描述也可以分为隐式的和显式的。隐式的relation描述通常隐藏在形状的描述中，例如，"head-and-shoulders"中，中间的"head"应该要高于左右两个shoulders，这就意味着第二次上升趋势(trend_id=2)的end_value应该要大于第一次和第三次上升趋势(trend_id=0和trend_id=4)的end_value，这里relation就应该被解析出来。显式的relation描述通常是直接描述的，例如，"连续的两次上升，左边的上升速度比右边的上升速度更快"，这意味着第一次上升趋势(trend_id=0)的slope应该要大于第二次上升趋势(trend_id=1)的slope，这里relation就应该被解析出来。最后，你还需要避免引入无效的relation，例如，"rise sharply then rise slowly"，这里面"sharply"和"slowly"已经被解析成trend中的条件，再引入relation是多余的。
7. 对于自然语言中存在的持续时间描述，你需要判断使用整体的time_span_condition，还是使用trend_group中的time_span_condition，抑或是使用trend中的time_span_condition。如果是对于整体时间的描述，则使用整体time_span_condition；如果是对于组合时间的描述，则使用trend_group中的time_span_condition，如果是对于单个trend的持续时间描述，则使用trend中的time_span_condition。
"""

modify_nl_logic_info = """
输入参数
- `old_queryspec_with_source: QuerySpecWithSource`：原始的查询规范
- `segments:Segment[]`：用户选择的连续时间序列片段
- `intentions:Intentions`：用户对于查询调整的意图
输出参数
- `new_queryspec_with_source: QuerySpecWithSource`：调整后的查询规范

1. 总体来说，你需要根据以上输入参数，输出调整后的`new_queryspec_with_source`，需要进行调整的地方依据`intentions`，具体如何调整依据`segments`中涉及的属性数值，根据相应的数值提供一定的范围性条件。
2. 调整需要同时体现在original_text和QuerySpec的修改需要有严格的对应关系。新增的条件应该也对应到text中描述的新增，修改的条件应该也对应到text中描述的修改，删除的条件应该也对应到text中描述的删除。
3. 不涉及调整意图的condition字段，要正确保留不要发生调整。最后，尽可能保证调整后的original_text和调整前不发生太大变化。
4. `new_queryspec_with_source`中的text_source也要保证是来自于original_text的连续子文本，并且text_source不可以和其他text_source重叠。
5. 对于`SingleRelationIntention`中，需要根据具体的`relation_choices`，选择相应的`segments`中对应的属性进行精确比较，然后对QuerySpecWithSource进行调整， 同时符合相应的语义。
"""
