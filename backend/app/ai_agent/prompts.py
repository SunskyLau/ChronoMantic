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
  start_time?: number;  // 片段起始时间，可选
  end_time?: number;    // 片段终止时间，可选
  delta_percentage?: number;  // 片段的总体变化百分比，可选
  daily_average_delta_percentage?: number;  // 片段的日均变化百分比，可选
  abs_slope_percentage?: number;  // 片段斜率在所有斜率中的占比，可选
  time_span?: number;  // 片段的时间跨度，可选
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
  delta_percentage_scope_condition?: ScopeCondition; // 变化率的范围条件，用于限定趋势的百分比变化范围
  daily_average_delta_percentage_scope_condition?: ScopeCondition; // 日均变化率的范围条件，用于限定趋势的日均百分比变化范围
  abs_slope_percentage_scope_condition?: ScopeCondition; // 斜率在所有斜率中的占比范围条件，用于限定趋势的相对斜率大小
  time_span_condition?: ScopeCondition; // 时间跨度的范围条件，用于限定趋势的持续时间
}

export enum Attribute {
  SLOPE = "slope", // 斜率属性，用于比较趋势的斜率
  START_VALUE = "start_value", // 起始值属性，用于比较趋势的起始点值
  END_VALUE = "end_value", // 结束值属性，用于比较趋势的终止点值
  TIME_SPAN = "time_span", // 时间跨度属性，用于比较趋势的持续时间
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
  time_span_condition: ScopeCondition; // 从id1到id2之间(包括id1和id2)所有趋势的总时间跨度条件
}

export interface QuerySpec {
  target: string; // 查询目标的时间序列名称
  trends: Trend[]; // 趋势条件列表
  relations: Relation[]; // 趋势间的关系条件列表
  trend_time_span_composition_conditions: TrendTimeSpanCompositionCondition[] | ScopeCondition; // 趋势组合的时间跨度条件，可以是条件列表或单个范围条件，如果为ScopeCondition，则表示所有趋势的总体时间跨度
  time_scope_condition?: ScopeCondition; // 全局时间范围的筛选条件，可选
  max_value_scope_condition?: ScopeCondition; // 全局最大值的范围条件，可选
  min_value_scope_condition?: ScopeCondition; // 全局最小值的范围条件，可选
}

/**
 * QuerySpecWithSource - 带有文本来源信息的查询规范接口定义
 */

export interface TextSource {
  text: string; // 原始文本内容，记录查询条件的原始描述
  start: number; // 文本在原始查询中的起始位置
  end: number; // 文本在原始查询中的结束位置
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


class ParseNL_Cases:
    case1 = """
输入：
"Find periods in AMZN when price first rose sharply then fell gradually"

输出：
{
  "original_text": "Find periods in AMZN when price first rose sharply then fell gradually",
  "target": {
    "target": "AMZN",
    "text_source": {
      "text": "AMZN", 
      "start": 15,
      "end": 19
    }
  },
  "trends": [
    {
      "category": {
        "category": "up",
        "text_source": {
          "text": "rose",
          "start": 30,
          "end": 34
        }
      },
      "abs_slope_percentage_scope_condition": {
        "min": {
          "value": 0.7,
          "inclusive": true,
          "text_source": {
            "text": "sharply",
            "start": 35,
            "end": 41
          }
        }
      }
    },
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "fell",
          "start": 47,
          "end": 51
        }
      },
      "abs_slope_percentage_scope_condition": {
        "max": {
          "value": 0.3,
          "inclusive": true,
          "text_source": {
            "text": "gradually",
            "start": 52,
            "end": 60
          }
        }
      }
    }
  ],
  "relations": [],
  "trend_time_span_composition_conditions": []
}
"""
    case2 = """
输入：
"Show me the periods when the price of Amazon stock shows a sharp head-and-shoulders shape and before that it resembles a slowly formed V shape over 20 days"

输出：
{{"output":{{
  "target": "AMZN"
  "trends": [{{
    "angle_scope_condition": {{
      "max": {{
        "value": -5,
        "inclusive": true
      }},
      "min": {{
        "value": -30,
        "inclusive": true
      }}
    }},
    "index": 0
  }},{{
    "angle_scope_condition": {{
      "min": {{
        "value": 5,
        "inclusive": true
      }},
      "max": {{
        "value": 30,
        "inclusive": true
      }}
    }},
    "index": 1
  }},{{
    "angle_scope_condition": {{
      "min": {{
        "value": 60,
        "inclusive": true
      }}
    }},
    "index": 2
  }},{{
    "angle_scope_condition": {{
      "max": {{
        "value": -60,
        "inclusive": true
      }}
    }},
    "index": 3
  }},{{
    "angle_scope_condition": {{
      "min": {{
        "value": 60,
        "inclusive": true
      }}
    }},
    "index": 4
  }},{{
    "angle_scope_condition": {{
      "max": {{
        "value": -60,
        "inclusive": true
      }}
    }},
    "index": 5
  }},{{
    "angle_scope_condition": {{
      "min": {{
        "value": 60,
        "inclusive": true
      }}
    }},
    "index": 6
  }},{{
    "angle_scope_condition": {{
      "max": {{
        "value": -60,
        "inclusive": true
      }}
    }},
    "index": 7
  }}],
  "relations": [{{
    "id1": 2,
    "id2": 4,
    "attribute": "end_value",
    "comparator": "<"
  }}, {{
    "id1": 4,
    "id2": 6,
    "attribute": "end_value",
    "comparator": ">"
  }}],
  "time_span_condition": {{
    "min": {{
      "value": 1728000,
      "inclusive": true
    }}
  }}
}}}}
    """
    case3 = """
输入：
"In Amazon stock, look up two consecutive rises and the time period when the first rose slowly and the second rose sharp"

输出：
{{"output":{{
  "target": "AMZN",
  "relations": [
    {{
      "id1": 0,
      "id2": 1,
      "attribute": "end_value",
      "comparator": "<"
    }}
  ],
  "trends": [{{
    "angle_scope_condition": {{
      "min": {{
        "value": 5,
        "inclusive": true
      }},
      "max": {{
        "value": 30,
        "inclusive": true
      }}
    }},
    "index": 0
      }},{{
    "angle_scope_condition": {{
      "min": {{
        "value": 60,
        "inclusive": true
      }}
    }},
    "index": 1
  }}]
}}}}
    """
    case4 = """
    """


class ModifyNL_Cases:
    case1 = """
    """
    case2 = """
    """
    case3 = """
    """
    case4 = """
    """


def create_parse_nl_prompt(dataset_info: str) -> str:
    system_prompt = f"""你正在为一个自然语言驱动的时间序列片段查询工具服提供自然语言到结构化查询的解析服务。以下是相关背景和知识
	
# 结构化查询语法
```{QuerySpecWithSource_info}
```

# 数据集信息
用户上传的是一个股票价格数据集，包含了多个公司的股票数据。
以下是用户要查询的时间序列数据集的基本信息：
{dataset_info}
你只需要关注其中的value_columns信息，其中包含了时间序列的列名信息，是你之后解析出target字段的来源。

# 任务：
根据以上的背景和知识，将用户对时间序列片段的自然语言查询解析为QuerySpecWithSource的json字典形式。
要求:
    1. 准确遵循QuerySpecWithSource的结构化查询语法，不要出现非法输出，输出前请检查
    2. TextSource的text只能是来源original_text的子文本
    3. 有且仅输出json字典，不要添加代码块或者```，也不要添加注释。

# 示例1
{ParseNL_Cases.case1}
"""
    return system_prompt


def create_generate_nl_prompt(dataset_info: str) -> str:
    ts2nl_prompt = f"""
你是一个有着时间序列处理方面数十年经验的专家，你非常擅长分析时间序列，并可以使用自然语言描述这段特殊的时间序列。以下是和你的任务相关的背景和知识。

1. 项目背景
	本项目旨在开发一个自然语言驱动的时间序列片段查询工具，允许用户通过输入自然语言来表达查询条件和意图，达到使得用户轻松使用这个查询工具的目的。在底层，我们构建了一套结构化的查询语法，以及对应的匹配模型，作为查询的底层实现途径。对于用户输入的自然语言查询，我们使用LLM作为自然语言解析器，将自然语言查询解析为相应的结构化查询。另外，我们为了方便用户轻松地构建自然语言查询，将使用LLM根据给定的时间序列片段来转化出符合条件的QuerySpec，进而产生推荐的自然语言查询，这便是你的任务。

2. 分割模型
	为了覆盖一定程度的趋势和形状描述，首先会对原时间序列进行预处理分割，分割后每一段都看作一条以两个分割点为起止的线段，即整个时间序列被模糊化为首尾相连的线段。进而，可以通过描述趋势和形状，对相应的片段进行匹配。

3. 结构化查询语法
	为了满足丰富的查询语义，同时能够在分割模型的结果上做查询，我们设计了一套结构化查询语法。以下是这套语法的细节。
	```
	interface ThresholdCondition {{
	  value?: number;
	  inclusive?: boolean;  // 是否包含阈值
	}}

	interface ScopeCondition {{
	  max?: ThresholdCondition | null;  // 范围最大值
	  min?: ThresholdCondition | null;  // 范围最小值
	}}
	
	interface Trend {{
	  angle_scope_condition?: ScopeCondition | null;  // 当趋势呈 `flat` 状态时，角度应在 -5 到 5 之间。当趋势向上时，角度的最小值应大于 5。当趋势向下时，角度的最大值应小于 -5。当用户指明趋势的程度时，你可以根据该程度调整范围。例如，`sharply` 可能意味着上升趋势的角度应大于 60 或 下降的趋势应该小于 -60。此外，你还需要根据时间序列片段的形态进行推断，并推导出合适的角度范围。
	  slope_scope_condition?: ScopeCondition | null;  // 当用户明确指出每天的增减幅度时，就会用到斜率范围条件。
	  time_scope_condition?: ScopeCondition | null;  // 时间范围条件，数值为时间戳，单位为秒。
	  time_span_condition?: ScopeCondition | null;  // 时间跨度条件，数值为时间戳，单位为秒。
	}}
	
	interface Relation {{  // 两个Trend段之间某个属性的比较关系。你应始终关注用户想要表达的时间序列趋势的形态，并评估它们之间的关系。
	  id1?: number;  // 比较中，第一个 Trend段 的索引，注意不能超过trends数组的索引范围。
	  id2?: number;  // 比较中，第二个 Trend段 的索引，注意不能超过trends数组的索引范围。
	  attribute?: "slope" | "angle" | "start_value" | "end_value" | "time_span";  // 需要比较的属性，例如“两个连续峰值”需要比较第0个和第2个的"end_value"，让他们大约相等。
	  comparator?: ">" | "<" | "=" | "<=" | ">=" | "~=";  // 你需要谨慎使用 "="，当不确定时，请尽量使用 "~="。
	}}
	
	interface QuerySpec {{
	  target?: string;  // 查询的目标时间序列列名，来源于数据集信息中的value_columns。
	  trends?: Trend[]; // 描述时间序列趋势模式的数组
	  relations?: Relation[]; // 描述不同trend段之间的关系数组
	  time_span_condition?: ScopeCondition;  // 全局时间跨度条件，数值为时间戳，单位为秒。
	  time_scope_condition?: ScopeCondition;  // 全局时间范围条件，数值为时间戳，单位为秒。
	  value_scope_condition?: ScopeCondition;  // 全局数值范围条件。
	}}
	```

4. 数据集信息
	用户上传的是一个股票价格数据集，包含了多个公司的股票数据。
	以下是用户要查询的时间序列数据集的基本信息：
	{dataset_info}
    你只需要关注其中的value_columns信息，其中包含了时间序列的列名信息，是你之后解析出target字段的来源。

5. 时间序列片段
	用户通过刷选得到相应的时间序列片段，以下是关于时间序列片段的数据结构的详细信息，用户的输入是 Segment[] 以及一个需要你考虑的相关属性列表，例如["angle_scope_condition", "time_scope_condition"]。
	```
	interface Segment = {{
    start_idx: number;
    end_idx: number;
    slope: number;
    start_value: number;
    end_value: number;
    max_value: number;
    min_value: number;
    start_time?: number;
    end_time?: number;
    angle?: number;  // 角度
    time_span?: number;  // 时间跨度，数值为时间戳，单位为秒。
	}}
	```
    
6. 目标输出格式（Output）
```
type Output = {{ output: string[] }}  // 结果是一个字符串数组
```

任务：
	我们将给你数据来源source，代表数据来源于数据表中哪一列，Segment[]数组，代表分段后的时间序列片段，以及一个choices数组，代表你需要考虑的属性值。请你根据该时间序列片段以及相关属性，一次性推导出三个不同程度的用户感兴趣的的QuerySpec，然后根据QuerySpec生成对应的自然语言推荐给用户。
	你的输出一定要满足以下要求：
		- 你需要根据用户的实际需求来生成查询语句，并对这些属性进行泛化，扩大它们表示的范围，而不是照抄原始数值，例如 1465 你可以根据实际情况拓展到1500或1400。
	  - 不同程度是指查询的数值的取值范围，例如-74，可能对应第一个QuerySpec为-60至-70，第二个为-50至-80，第三个为-40至-90。你需要一点点扩大范围供用户选择，并使用合适的修饰语进行转化，例如sharply，lightly等等。
	  - Segment[]是一个序列，你需要综合考虑，例如两段连续的上升下降可以翻译为"double-top"，两端连续的上升可以翻译为"two consecutive rises"等等。
		- 通过给定的时间序列片段Segment[]转化为自然语言数组的形式。要求你的输出有且仅有为string[]数组类型的json，不要添加代码块或者```，也不要添加注释。
		
示例：
	
	输入：
source: "AMZN"
segments: [{{"angle":37.56840572558871,"end_idx":1224,"end_time":1520812800,"end_value":1598.390015,"max_value":1598.390015,"min_value":1189.01001,"slope":0.00006866948554079441,"start_idx":1177,"start_time":1514851200,"start_value":1189.01001,"time_span":5961600}},{{"angle":-30.16388435060378,"end_idx":1248,"end_time":1523836800,"end_value":1441.5,"max_value":1598.390015,"min_value":1371.98999,"slope":-0.0000518816187169312,"start_idx":1224,"start_time":1520812800,"start_value":1598.390015,"time_span":3024000}},{{"angle":23.479040030509402,"end_idx":1365,"end_time":1538352000,"end_value":2004.359985,"max_value":2039.51001,"min_value":1441.5,"slope":0.000038777280712632275,"start_idx":1248,"start_time":1523836800,"start_value":1441.5,"time_span":14515200}},{{"angle":-64.73490467788203,"end_idx":1386,"end_time":1540857600,"end_value":1530.420044,"max_value":2004.359985,"min_value":1530.420044,"slope":-0.0001891522753033206,"start_idx":1365,"start_time":1538352000,"start_value":2004.359985,"time_span":2505600}}]
choices: ["angle_scope_condition","value_scope_condition"]
	
	输出：
{{"output":["Find time series segments in AMZN where has a rising then falling then rising then falling trends, and the value must between 1300 and 1600.","Search in AMZN where the angle shows a light increase, with an angle between 20 and 50, and the value is relatively high, between 1400 and 1700.","Look for a slight double-top in AMZN stock, and the value is between 1350 and 1850."]}}

"""
    return ts2nl_prompt


def create_modify_nl_prompt() -> str:
    modify_nl_prompt = f"""你是一个对时间序列片段的自然语言查询进行微调的专家，擅长根据用户给定的时间序列片段对原始查询进行微调，以捕捉用户的用意，帮助用户轻松调整自然语言查询。以下是关于你的任务的背景和知识。

# 分段线性拟合的时间序列片段接口定义
'''{Segment_info}
'''

# 结构化查询接口定义
'''{QuerySpecWithSource_info}
'''


# 任务描述
你的任务是根据用户输入的 **查询语句（query）**、**时间序列片段（segments）** 以及 **choices**，提供 **三个修改版本**，使查询更加清晰、合理，并符合时间序列数据的结构化信息 ``。
你的任务是根据原始的`QuerySpecWithSource`, 用户指定的时间序列片段`segments`，以及需要调整的`choices`，提供三个修改版本，使查询更加清晰、合理，并符合时间序列数据的结构化信息 ``。

# 调整原则
1. **保持查询的核心语义**，仅在必要部分调整。
2. **结合 `segments` 和 `choices` 进行优化**，确保查询符合数据特征。
3. **生成三个不同的推荐修改版本**，每个版本在表达方式或查询范围上有所不同。



### 输入参数
- `query`: 用户的自然语言查询。
- `segments`: 时间序列片段，包含 `angle`、`start_time`、`end_time`、`start_value`、`end_value` 等信息。
- `choices`: 需要调整的查询部分，例如 `angle_scope_condition` 或 `value_scope_condition`。

### 目标
1. **优化查询的清晰度和表达方式**，尤其是 `choices` 相关部分：
   - **如果涉及 `angle`**，用 **"sharp"（陡峭）、"moderate"（适中）** 等定性描述，而不是具体数值区间。
   - **如果涉及 `time_span`（持续时间）**，用 `weeks` 或 `months` 表达，而不是时间戳。
   - **如果涉及 `time_scope`（时间范围）**，确保其表示的是一个明确的时间段，如“2023年”。
2. **调整查询模式**，生成 **三个不同版本**：
   - **范围调整**：泛化范围，如 `10 days` → `about 2 weeks`。
   - **描述优化**：改善语法，使查询更加自然。
   - **查询方式变化**：使查询更具象或更宽泛。

### 输出格式
返回 **JSON 对象**，格式如下：{{"output": ["修改版本1", "修改版本2", "修改版本3"]}}
不要添加额外的代码块、注释或解释。

示例:
{{
  "query": "Find a sharp rise in AMZN stock, with angle above 40°",
  "choices": ["angle_scope_condition", "time_span_condition"],
  "segments": [
    {{
      "angle": 47.6,
      "end_time": 1520812800,
      "end_value": 1598.39,
      "start_time": 1514851200,
      "start_value": 1189.01,
      "time_span": 5961600
    }}
  ]
}}
输出示例:
{{
  "output": [
    "Find a sharp rise in AMZN stock, with a steep increase and a duration of about 9 weeks",
    "Find a strong upward trend in AMZN stock, lasting approximately 2 months",
    "Find a notable upward movement in AMZN stock, with a sharp rise and a time span of around 60 days"
  ]
}}
"""
    return modify_nl_prompt


# print(create_modify_nl_prompt())
