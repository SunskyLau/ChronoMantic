from .constant import FUZZY_FACTOR

Segment_info = """
/**
 * Segment - 分段线性拟合的时间序列片段接口定义
 */
export enum Source {
  RESULT = "result", // 来源于查询结果
  USER = "user", // 来源于用户指定
}

export interface Segment {
  source: Source; // 片段的来源，可以是"result"或者"user",分别代表来源于查询结果和用户指定新增的
  slope: number;      // 片段的斜率，表示变化趋势
  start_value: number;  // 片段起始点的值
  end_value: number;    // 片段终止点的值
  start_time?: number;  // 片段起始时间，单位是秒，可选
  end_time?: number;    // 片段终止时间，单位是秒，可选
  abs_slope_percentage?: number;  // 片段斜率在所有斜率中的占比，单位是%，可选
  time_span?: number;  // 片段的时间跨度，单位是秒，可选
}
"""

SegmentGroup_info = """
/**
 * SegmentGroup - 分段线性拟合的时间序列片段组接口定义
 */
export interface SegmentGroup {
  ids: [number, number]; // 片段组中包含的片段ID列表，ids[1]>=ids[0]，id是来源于Segments的id
  time_span?: number; // 片段组的时间跨度，单位是秒，可选
}
"""

QuerySpecWithSource_info = """
/**
 * 基础条件接口定义
 */
export interface ThresholdCondition {
  value: number; // 阈值值，用于定义范围的具体数值
  inclusive: boolean; // 是否包含该阈值，true表示包含，false表示不包含
}

export interface ScopeCondition {
  max?: ThresholdCondition; // 范围的最大值条件，可选
  min?: ThresholdCondition; // 范围的最小值条件，可选
}

export enum SingleAttribute {
  SLOPE = "slope", // 斜率属性，用于比较趋势的斜率
  START_VALUE = "start_value", // 起始值属性，用于比较趋势的起始点值
  END_VALUE = "end_value", // 结束值属性，用于比较趋势的终止点值
  TIME_SPAN = "time_span", // 时间跨度属性，用于比较趋势的持续时间
  ABS_SLOPE_PERCENTAGE = "abs_slope_percentage" // 斜率占比属性，单位是%
}

export enum GroupAttribute {
  TIME_SPAN = "time_span", // 时间跨度属性
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

export interface GroupRelation {
  group1: [number, number]; // 第一个趋势组合的ID列表，group1[1]>=group1[0]
  group2: [number, number]; // 第二个趋势组合的ID列表，group2[1]>=group2[0]
  attribute: GroupAttribute; // 要比较的属性类型
  comparator: Comparator; // 比较关系的运算符
}

/**
 * QuerySpecWithSource - 带有文本来源信息的查询规范接口定义
 */

export interface TextSource {
  text: string; // 原始文本片段
  index: number; // 用于区分text相同但是在原文中位置不同的文本片段，index=0表示第一个，index=1表示第二个，以此类推
}

export interface WithSource {
  text_source_id: number; // 来源于哪个text_sources数组中的哪个TextSource
}

// 基础条件的 WithSource 版本
export interface CategoryWithSource extends WithSource {
  category: TrendCategory; // 趋势类别
}

// 单位
export type Unit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year";

export interface WithUnit {
  unit?: Unit; // 单位
}

export interface ScopeConditionWithSource extends WithSource, ScopeCondition {}

export interface ScopeConditionWithSourceWithUnit extends ScopeConditionWithSource, WithUnit {}

// 单趋势的 WithSource 版本
export interface TrendWithSource {
  category: CategoryWithSource; // 趋势类别，可以是"flat"(平稳),"up"(上升),"down"(下降)
  slope_scope_condition?: ScopeConditionWithSourceWithUnit; // 斜率的范围条件，用于限定趋势的斜率范围
  abs_slope_percentage_scope_condition?: ScopeConditionWithSource; // 斜率在所有斜率中的占比范围条件，用于限定趋势的相对斜率大小，单位是%，例如30就代表30%
  time_span_condition?: ScopeConditionWithSourceWithUnit; // 时间跨度的范围条件，用于限定趋势的持续时间
}

// 单趋势关系的 WithSource 版本
export interface SingleRelationWithSource extends SingleRelation, WithSource {}

// 趋势组合的 WithSource 版本
export interface TrendGroupWithSource {
  ids: [number, number]; // 组内趋势的id列表,ids[1]>=ids[0]
  time_span_condition?: ScopeConditionWithSource; // 该组的时间跨度条件
}

// 组合关系的 WithSource 版本
export interface GroupRelationWithSource extends GroupRelation, WithSource {}

export interface TargetWithSource extends WithSource {
  target: string; // 目标时间序列名
}

export interface QuerySpecWithSource {
  original_text: string; // 原始查询文本
  text_sources: TextSource[]; // QuerySpec中涉及到的所有文本来源，按照处于原文中的顺序排序
  targets: TargetWithSource[]; // 查询目标列表，查询文本中未提及明确目标时为空
  trends: TrendWithSource[]; // 趋势列表
  single_relations: SingleRelationWithSource[]; // 单趋势关系列表
  trend_groups: TrendGroupWithSource[]; // 趋势组合列表
  group_relations: GroupRelationWithSource[]; // 组合关系列表
  time_span_condition?: ScopeConditionWithSourceWithUnit; // 总时间跨度的范围条件
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
  ABS_SLOPE_PERCENTAGE = "abs_slope_percentage", // 斜率占比属性,单位是%
  TIME_SPAN = "time_span", // 时间跨度属性,单位是秒
}

export enum GroupChoice {
  TIME_SPAN = "time_span", // 趋势组合的时间跨度条件
}

export enum SingleRelationChoice {
  SLOPE = "slope", // 斜率关系
  START_VALUE = "start_value", // 起始值关系
  END_VALUE = "end_value", // 结束值关系
  TIME_SPAN = "time_span", // 时间跨度关系
  ABS_SLOPE_PERCENTAGE = "abs_slope_percentage", // 斜率占比关系
}

export enum GroupRelationChoice {
  TIME_SPAN = "time_span", // 时间跨度关系
}

export interface SingleSegmentIntention {
  id: number; // Segment的ID标识
  single_choices: SingleChoice[]; // 该Segment需要考虑的属性列表
}

export interface SegmentGroupIntention {
  ids: [number, number]; // 组合中包含的Segment ID列表,ids[1]>=ids[0]
  group_choices: GroupChoice[]; // 该组合需要考虑的属性列表
}

export interface SingleRelationIntention {
  id1: number; // 第一个Segment的ID标识的ID
  id2: number; // 第二个Segment的ID标识的ID
  relation_choices: SingleRelationChoice[]; // 需要比较的关系属性
}

export interface GroupRelationIntention {
  group1: [number, number]; // 第一个Segment的ID标识组合的ID列表,group1[1]>=group1[0]
  group2: [number, number]; // 第二个Segment的ID标识组合的ID列表,group2[1]>=group2[0]
  relation_choices: GroupRelationChoice[]; // 需要比较的关系属性
}

export interface Intentions {
  single_segment_intentions: SingleSegmentIntention[]; // 单个Segment的意图列表
  segment_group_intentions: SegmentGroupIntention[]; // Segment组合的意图列表
  single_relation_intentions: SingleRelationIntention[]; // 单个Segment关系的意图列表
  group_relation_intentions: GroupRelationIntention[]; // Segment组合关系的意图列表
}
"""

model_info = """
为了满足对时间序列片段的趋势和形状描述，我们使用线段拟合分割方法对时间序列进行不同模糊等级的分割预处理。分割后的时间序列是许多连续线段组成的数组，它们首尾相连形成整个通过分割模糊化后的时间序列。每一段都是一条以两个分割点为起止点的线段。通过这种线段拟合分段的方式，可以满足基本的趋势和形状查询，只需要从原段序列中匹配出满足趋势或者形状的子段序列即可。
"""

parse_nl_logic_info = f"""
1. 自然语言中如果出现模糊的范围表达，解析成ScopeConditionWithSource的时候需要让min和max构成一个满足模糊表达的范围，min和max不应该相等。例如，"about 2 weeks"需要根据模糊程度：{FUZZY_FACTOR}，解析成min对应{(1 - FUZZY_FACTOR) * 2}weeks，max对应{(1 + FUZZY_FACTOR) * 2}weeks的ScopeConditionWithSourceWithUnit，也就是允许一个比原数值更小的数和更大的数来组成这个模糊的范围。因此，你需要根据语义恰当地解析出一个范围。当用户明确给出单位的时候，你需要使用用户给出的单位。
2. 自然语言中对于趋势和形状的描述，需要解析成TrendWithSource，其中category需要解析成趋势的类别，text_source需要解析成趋势的描述来源。你需要捕捉趋势和形状的特征并翻译为相应的字段。
3. 自然语言中如果是确切的描述，如"a duration of 20~30days"，需要解析成time_span_condition，其中min和max需要解析成相应的数值。诸如此类，需要精准识别应该解析为什么condition。
4. 有关趋势程度的模糊描述，根据语义解析为abs_slope_percentage_scope_condition。
5. TextSource的text只能是来源original_text的连续子文本。text_sources数组中的元素应该严格遵循原文中的顺序，不重叠地输出。解析出来的text_source必须是被使用的，否则不应该出现在text_sources中。
6. 你需要识别出自然语言中对于relation的描述，这种描述也可以分为隐式的和显式的。隐式的relation描述通常隐藏在形状的描述中，例如，"head-and-shoulders"中，中间的"head"应该要高于左右两个shoulders，这就意味着第二次上升趋势(trend_id=2)的end_value应该要大于第一次和第三次上升趋势(trend_id=0和trend_id=4)的end_value，这里relation就应该被解析出来。显式的relation描述通常是直接描述的，例如，"连续的两次上升，左边的上升速度比右边的上升速度更快"，这意味着第一次上升趋势(trend_id=0)的slope应该要大于第二次上升趋势(trend_id=1)的slope，这里relation就应该被解析出来。最后，你还需要避免引入无效的relation，例如，"rise sharply then rise slowly"，这里面"sharply"和"slowly"已经被解析成trend中的条件，再引入relation是多余的。
7. 对于自然语言中存在的持续时间描述，你需要判断使用整体的time_span_condition，还是使用trend_group中的time_span_condition，抑或是使用trend中的time_span_condition。如果是对于整体时间的描述，则使用整体time_span_condition；如果是对于组合时间的描述，则使用trend_group中的time_span_condition，如果是对于单个trend的持续时间描述，则使用trend中的time_span_condition。 
8. 尽可能保证多轮对话解析中的稳定性和一致性。
9. 趋势有上升下降的区别，所以在处理斜率（slope）时，需要区分上升和下降的斜率，上升的时候应该使用正斜率；下降的时候应该使用负斜率。并注意设置大小关系，例如，"each trend's slope should be steeper than 10 per month"，这意味着每个趋势的斜率应该大于10，所以当趋势上升应该设置min为10，max为无穷大；当趋势下降应该设置max为-10，min为无穷小。
10. 对于趋势的描述，如果用户没有明确给出单位，默认使用秒，如果用户给出单位，例如“falling almost 20/year”，则需要根据模糊程度：{FUZZY_FACTOR}，解析成min对应{(1 + FUZZY_FACTOR) * (-20)}，max对应{(1 - FUZZY_FACTOR) * (-20)}，单位是“year”的ScopeConditionWithSourceWithUnit。
"""

modify_nl_logic_info = """
输入参数
- `old_queryspec_with_source: QuerySpecWithSource`：原始的查询规范
- `segments:Segment[]`：用户选择的连续时间序列片段
- `segment_groups:SegmentGroup[]`：用户选择的时间序列片段组
- `intentions:Intentions`：用户对于查询调整的意图
输出参数
- `new_queryspec_with_source: QuerySpecWithSource`：调整后的查询规范

1. 总体来说，你需要根据以上输入参数，输出调整后的`new_queryspec_with_source`，需要进行调整的地方依据`intentions`，具体如何调整依据`segments`中涉及的属性数值，根据相应的数值提供一定的范围性条件。
2. TextSource的text只能是来源original_text的连续子文本。text_sources数组中的元素应该严格遵循原文中的顺序，不重叠地输出。解析出来的text_source必须是被使用的，否则不应该出现在text_sources中。
3. 调整需要同时体现在original_text和QuerySpec的修改需要有严格的对应关系。新增的条件应该也对应到text中描述的新增，修改的条件应该也对应到text中描述的修改，删除的条件应该也对应到text中描述的删除。
4. 不涉及调整意图的condition字段，要正确保留不要发生调整。最后，尽可能保证调整后的original_text和调整前不发生太大变化。
5. `new_queryspec_with_source`中的text_sources也要保证是来自于original_text的连续子文本，并且text_sources数组中的元素应该严格遵循原文中的顺序，不重叠地输出。
6. 对于`SingleRelationIntention`中，需要根据具体的`relation_choices`，选择相应的`segments`中对应的属性进行精确比较，然后对QuerySpecWithSource进行调整， 同时符合相应的语义。
"""
