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
  start_time: number;  // 片段起始时间，单位是秒
  end_time: number;    // 片段终止时间，单位是秒
  relative_slope: number;  // 片段斜率在所有斜率中的占比，单位是%
  duration: number;  // 片段的时间跨度，单位是秒
  unit: Unit;  // 片段的跨度单位（即duration、slope的范围）
  category: TrendCategory;  // 片段的趋势类别
}
"""

SegmentGroup_info = """
/**
 * SegmentGroup - 分段线性拟合的时间序列片段组接口定义
 */
export interface SegmentGroup {
  ids: [number, number]; // 片段组中包含的片段ID列表，ids[1]>=ids[0]，id是来源于Segments的id
  duration?: number; // 片段组的时间跨度，单位是秒，可选
}
"""

QuerySpecWithSource_info = """
```
/**
 * Basic condition interface definition
 */
export interface ThresholdCondition {
  value: number; // Threshold value used to define specific numeric ranges
  inclusive: boolean; // Whether the threshold is inclusive, true means inclusive, false means exclusive
}

export interface ScopeCondition {
  max?: ThresholdCondition; // Maximum value condition of the range, optional
  min?: ThresholdCondition; // Minimum value condition of the range, optional
}

export enum SingleAttribute {
  SLOPE = "slope", // Slope attribute, used to compare trend slopes
  START_VALUE = "start_value", // Start value attribute, used to compare starting point values of trends
  END_VALUE = "end_value", // End value attribute, used to compare ending point values of trends
  DURATION = "duration", // Time span attribute, used to compare duration of trends
  RELATIVE_SLOPE = "relative_slope" // Relative slope percentage attribute, unit is %
}

export enum GroupAttribute {
  DURATION = "duration", // Time span attribute
}

export enum Comparator {
  GREATER = ">", // Greater than comparison operator
  LESS = "<", // Less than comparison operator
  EQUAL = "=", // Equal to comparison operator
  NO_GREATER = "<=", // Less than or equal to comparison operator
  NO_LESS = ">=", // Greater than or equal to comparison operator
  APPROXIMATELY_EQUAL_TO = "~=", // Approximately equal to comparison operator
}

export interface SingleRelation {
  id1: number; // ID identifier for the first trend used in relation comparisons
  id2: number; // ID identifier for the second trend used in relation comparisons
  attribute: SingleAttribute; // Attribute type to be compared
  comparator: Comparator; // Comparison relationship operator
}

export interface GroupRelation {
  group1: [number, number]; // First trend group's ID list, group1[1] >= group1[0], indicating all segments from group1[0] to group1[1], e.g., [1,4] includes segments 1, 2, 3, 4
  group2: [number, number]; // Second trend group's ID list, group2[1] >= group2[0], indicating all segments from group2[0] to group2[1], e.g., [2,3] includes segments 2, 3
  attribute: GroupAttribute; // Attribute type to be compared
  comparator: Comparator; // Comparison relationship operator
}

/**
 * QuerySpecWithSource - Interface definition for query specifications with text source information
 */
export interface TextSource {
  text: string; // Original text fragment
  index: number; // Used to distinguish text fragments that are the same but different in position within the original text; index=0 indicates the first, index=1 indicates the second, etc.
}

export interface WithSource {
  text_source_id: number; // Source from which TextSource array element this originates
}

export enum TrendCategory {
  FLAT = "flat", // Flat
  UP = "up", // Upward
  DOWN = "down" // Downward
}

// Unit types
export type Unit = "number" | "second" | "minute" | "hour" | "day" | "week" | "month" | "year";   

export interface WithUnit {
  unit?: Unit; // Unit
}

// ScopeCondition WithSource version
export interface ScopeConditionWithSource extends WithSource, ScopeCondition {}

// ScopeCondition WithSource and WithUnit version
export interface ScopeConditionWithSourceWithUnit extends ScopeConditionWithSource, WithUnit {}   

// Single trend WithSource version
export interface TrendWithSource {
  category: CategoryWithSource; // Trend category, can be "flat" (steady), "up" (rising), "down" (falling)
  slope_scope_condition?: ScopeConditionWithSourceWithUnit; // Range condition for slope, limiting the slope range of the trend
  relative_slope_scope_condition?: ScopeConditionWithSource; // Range condition for relative slope among all slopes, limiting the relative slope size of the trend, unit is %, e.g., 30 represents 30%
  duration_condition?: ScopeConditionWithSourceWithUnit; // Range condition for time span, limiting the duration of the trend
}

// Single trend relation WithSource version
export interface SingleRelationWithSource extends SingleRelation, WithSource {}

// Trend group WithSource version
export interface TrendGroupWithSource {
  ids: [number, number]; // List of trend IDs within the group, ids[1] >= ids[0]
  duration_condition?: ScopeConditionWithSource; // Time span condition for the group
}

// Group relation WithSource version
export interface GroupRelationWithSource extends GroupRelation, WithSource {}

export interface TargetWithSource extends WithSource {
  target: string; // Target time series name
}

export interface ComparatorWithSource extends WithSource {
  comparator: Comparator; // The comparator
}

// QuerySpecWithSource interface definition, You should output `json` format of this interface.
export interface QuerySpecWithSource {
  original_text: string; // Original query text
  text_sources: TextSource[]; // All text sources involved in QuerySpec, sorted by their order in the original text        
  targets: TargetWithSource[]; // Query target list, empty if no explicit target is mentioned in the query text
  trends: TrendWithSource[]; // Trend list
  single_relations: SingleRelationWithSource[]; // Single trend relation list
  trend_groups: TrendGroupWithSource[]; // Trend group list
  group_relations: GroupRelationWithSource[]; // Group relation list
  duration_condition?: ScopeConditionWithSourceWithUnit; // Total time span range condition
  time_scope_condition?: ScopeConditionWithSource; // Time range condition
  max_value_scope_condition?: ScopeConditionWithSource; // Maximum value range condition
  min_value_scope_condition?: ScopeConditionWithSource; // Minimum value range condition
  comparator_between_start_end_value?: ComparatorWithSource; // The comparator between start_value and end_value
}
```
"""

intentions_info = """
/**
 * Intentions
 */

export enum SingleChoice {
  USER = "user", // 用户指定的，需要添加相关描述
  RESULT = "result", // 结果生成的，不需要添加相关描述，已经在原有查询规范中，只需要对应text_source_id
  SLOPE = "slope", // 斜率属性
  RELATIVE_SLOPE = "relative_slope", // 斜率占比属性,单位是%
  DURATION = "duration", // 时间跨度属性,单位是秒
}

export enum GroupChoice {
  DURATION = "duration", // 趋势组合的时间跨度条件
}

export enum SingleRelationChoice {
  SLOPE = "slope", // 斜率关系
  START_VALUE = "start_value", // 起始值关系
  END_VALUE = "end_value", // 结束值关系
  DURATION = "duration", // 时间跨度关系
  RELATIVE_SLOPE = "relative_slope", // 斜率占比关系
}

export enum GroupRelationChoice {
  DURATION = "duration", // 时间跨度关系
}

export interface SingleSegmentIntention {
  id: number; // Segment的ID标识
  single_choices: SingleChoice[]; // 该Segment需要考虑的属性列表
}

export interface SegmentGroupIntention {
  ids: [number, number]; // 组合中包含的Segment ID列表,ids[1]>=ids[0]，例如[1,3]表示从1到3的所有片段，即片段1、2、3
  group_choices: GroupChoice[]; // 该组合需要考虑的属性列表
}

export interface SingleRelationIntention {
  id1: number; // 第一个Segment的ID标识的ID
  id2: number; // 第二个Segment的ID标识的ID
  relation_choices: SingleRelationChoice[]; // 需要比较的关系属性
}

export interface GroupRelationIntention {
  group1: [number, number]; // 第一个Segment的ID标识组合的ID列表,group1[1]>=group1[0]，例如[1,1]表示片段1
  group2: [number, number]; // 第二个Segment的ID标识组合的ID列表,group2[1]>=group2[0]，例如[2,3]表示从2到3的所有片段，即片段2、3
  relation_choices: GroupRelationChoice[]; // 需要比较的关系属性
}

export interface Intentions {
  single_segment_intentions: SingleSegmentIntention[]; // 单个Segment的意图列表，你只需要关心这个id所在的segment的属性，不需要关心与他相关的relation或者segment_group的属性，你需要始终考虑这个trend的category
  segment_group_intentions: SegmentGroupIntention[]; // Segment组合的意图列表，你只需要关心这个ids所在的组合的属性，不需要关心这其中每一个segment的属性
  single_relation_intentions: SingleRelationIntention[]; // 两个Segment关系的意图列表，你只需要关心这个id1和id2所在的relation的各项属性，不需要关心其他group_relation或者segment_group或者segment的属性
  group_relation_intentions: GroupRelationIntention[]; // 两个Segment组合关系的意图列表，你只需要关心这个group1和group2所在的relation的各项属性，不需要关心其他group_relation或者segment_group或者segment的属性
}
"""

model_info = """
为了满足对时间序列片段的趋势和形状描述，我们使用线段拟合分割方法对时间序列进行不同模糊等级的分割预处理。分割后的时间序列是许多连续线段组成的数组，它们首尾相连形成整个通过分割模糊化后的时间序列。每一段都是一条以两个分割点为起止点的线段。通过这种线段拟合分段的方式，可以满足基本的趋势和形状查询，只需要从原段序列中匹配出满足趋势或者形状的子段序列即可。
"""

parse_nl_logic_info = f"""
1. Parse vague range expressions (e.g., "about 2 weeks") into `ScopeConditionWithSource`, with `min` and `max` forming a range based on `{FUZZY_FACTOR}`. For example, "about 2 weeks" becomes `min={(1 - FUZZY_FACTOR) * 2}` weeks and `max={(1 + FUZZY_FACTOR) * 2}` weeks in `ScopeConditionWithSourceWithUnit`. Ensure `min != max`. Use the provided unit if explicitly stated.

2. Parse trend and shape descriptions into `TrendWithSource`. Map `category` to the trend type and `text_source` to the description. Capture characteristics of trends and shapes into corresponding fields.

3. You should pay attention to all the described trends and not miss any of them. For example, if the user specifies 'a rising trend followed by a head-and-shoulders shape', then you should generate the up->up->down->up->down->up->down trend, because this rising trend is not covered in head-and-shoulders but rather a separate paragraph. Therefore, you should not only resolve the trend inside head-and-shoulders, but all the described trends.

4. Parse precise descriptions (e.g., "20~30 days") into `duration_condition`, setting `min` and `max` accordingly. Accurately identify the condition type.

5. Parse vague trend intensity descriptions (e.g., "gradual rise") into `relative_slope_scope_condition` based on semantics.

6. Ensure `text` in `TextSource` is a continuous sub-text of the original text. Elements in `text_sources` must follow the original order without overlap. Only include utilized `text_source`.

7. Identify implicit and explicit relations:
  - Implicit: "Head-and-shoulders" means that there are three alternating uptrend and downtrend shape, and the middle "head" (`trend_id=2`) is higher than the "shoulders" (`trend_id=0` and `trend_id=4`).
  - Explicit: "Two consecutive rises, left faster than right" means the slope of `trend_id=0` > `trend_id=1`.
  Avoid redundant relations (e.g., "rise sharply then slowly").

8. For duration descriptions, determine whether to use:
  - Overall `duration_condition` for total time.
  - `trend_group`'s `duration_condition` for combined times.
  - Individual `trend`'s `duration_condition` for single trends.

9. Differentiate between upward and downward trends when handling slopes:
  - Upward trends: Use positive slopes. For "steeper than 10/month," set `min=10`, do not set `max`.
  - Downward trends: Use negative slopes. For "steeper than 10/month," set `max=-10`, do not set `min`.

10. For trend descriptions:
  - Default to seconds if no unit is provided.
  - If a unit is provided (e.g., "falling almost 20/year"), parse it into `min={-20 * (1 + FUZZY_FACTOR)}`, `max={-20 * (1 - FUZZY_FACTOR)}` with the unit as "year" in `ScopeConditionWithSourceWithUnit`.
"""

modify_nl_logic_info = """
## 任务说明
你需要根据调整意图(intentions)和新的查询规范，为时间序列查询生成合适的文本描述和文本来源映射。这个过程需要保持查询语义的一致性，同时确保文本描述的自然性。

## 输入输出
输入:
- old_queryspec_with_source: 原始查询规范，包含原始文本和映射关系
- new_queryspec_with_source_without_text_sources: 新的查询规范(不含文本相关字段)
- intentions: 调整意图，指明需要关注和修改的属性

输出:
- new_queryspec_with_source: 完整的新查询规范，需要补充:
  - original_text: 描述查询意图的自然语言文本
  - text_sources: 文本片段来源数组
  - text_source_id: 各属性对应的文本来源索引
- 除了这三个内容需要调整，其他内容需要和 new_queryspec_with_source_without_text_sources 保持完全一致，不允许出现任何差异

## 处理步骤

### 1. 生成 original_text
要求:
- 参考原始文本(old_queryspec_with_source.original_text)
- 关注 intentions 中标记为 user 的趋势，这些属性需要添加到 original_text 中
- 原始文本中已有内容需要尽可能全部保留
- 需要根据新规范的属性变化和 intentions 进行调整
- 保持语言表达的自然性和连贯性
- 确保完整表达所有新规范中的属性
- 避免引入未在新规范中定义的属性

### 2. 构建 text_sources
规则:
1. 文本来源要求:
  - text_sources 中的每个 text 必须是 original_text 中的连续子文本
  - 不允许对原文进行任何修改或重组

2. 顺序和重叠规则:
  - text_sources 数组中的元素必须按照它们在 original_text 中出现的顺序排列
  - 不同的 text_sources 之间不允许有重叠部分

3. 文本复用处理:
  - 当相同的文本片段在 original_text 中多次出现时:
    - 使用 index 字段区分不同位置的相同文本
    - index 从 0 开始计数
    - 第一次出现 index=0，第二次出现 index=1，以此类推
   
4. 有效性原则:
  - 只保留被实际引用的文本片段
  - 如果某个文本片段没有被任何属性引用，不应该出现在 text_sources 中

### 3. 分配 text_source_id
要求:
- 为每个属性分配正确的 text_source_id
- text_source_id 必须对应已定义的 text_sources 索引
- 确保所有属性都有对应的 text_source_id，并且为最符合语义的text_source_id

## 关键规则和示例

### 文本映射规则

1. 重复文本处理:
```json
// 原文: "rise then rise then rise"
{
  "text_sources": [
    {"text": "rise", "index": 0},
    {"text": "rise", "index": 1},
    {"text": "rise", "index": 2}
  ],
  "trends": [
    {"category": "up", "text_source_id": 0},
    {"category": "up", "text_source_id": 1},
    {"category": "up", "text_source_id": 2}
  ]
}
```

2. 不同文本处理:
```json
// 原文: "rise then fall then rose"
{
  "text_sources": [
    {"text": "rise", "index": 0},
    {"text": "fall", "index": 0},
    {"text": "rose", "index": 0}
  ],
  "trends": [
    {"category": "up", "text_source_id": 0},
    {"category": "down", "text_source_id": 1},
    {"category": "up", "text_source_id": 2}
  ]
}
```

3. 特殊形状描述：
```json
// 原文: "Find periods when price presented a head-and-shoulders shape"
{
  "text_sources": [
    {"text": "head-and-shoulders", "index": 0}
  ],
  "trends": [
    {"category": "up", "text_source_id": 0},
    {"category": "down", "text_source_id": 0},
    {"category": "up", "text_source_id": 0},
    {"category": "down", "text_source_id": 0},
    {"category": "up", "text_source_id": 0},
    {"category": "down", "text_source_id": 0}
  ],
  "single_relations": [
    {"id1": 0, "id2": 2, "attribute": "end_value", "comparator": "<"},
    {"id1": 2, "id2": 4, "attribute": "end_value", "comparator": ">"}
  ]
}
```

### 属性变更原则

1. 新增属性:
   - 在 original_text 中添加对应描述
   - 确保新描述与现有文本自然衔接

2. 修改属性:
   - 在 original_text 中更新对应描述
   - 尽可能保持原有文本结构

3. 删除属性:
   - 从 original_text 中移除对应描述
   - 确保剩余文本保持连贯

### 注意事项

1. 文本一致性:
   - text_sources 必须是 original_text 的连续子串
   - 保持文本片段的原始顺序
   - 避免文本重叠

2. 索引完整性:
   - 每个属性都必须有对应的 text_source_id
   - text_source_id 必须指向有效的 text_sources 索引

3. 语义准确性:
   - 确保生成的文本准确表达查询意图
   - 避免引入歧义或冗余描述
"""
