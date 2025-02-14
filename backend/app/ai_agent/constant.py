from datetime import datetime


class Platforms:
    AZURE = "azure"
    DEEPSEEK = "deepseek"
    SILIICONFLOW = "siliconflow"
    QWEN = "qwen"


class Azure:
    API_KEY = "c1812815d31d45aa9b450a22fc875845"
    ENDPOINT = "https://idg-oai.openai.azure.com/"
    API_VERSION = "2024-11-01-preview"

    class MODELS:
        GPT_4O = "gpt-4o"
        GPT_4O_REALTIME = "gpt-4o-realtime-preview"


class DeepSeek:
    API_KEY = "sk-8afa35e69734436e88fec6fb5191e954"
    BASE_URL = "https://api.deepseek.com"

    class MODELS:
        CHAT = "deepseek-chat"
        REASONER = "deepseek-reasoner"


class SiliconFlow:
    API_KEY = "sk-vjgfhfunedghhljnnwfdpvnheuppfktpbxvczttcmygtukxh"
    BASE_URL = "https://api.siliconflow.cn/v1"

    class MODELS:
        DEEPSEEK_V3 = "deepseek-ai/DeepSeek-V3"


class Qwen:
    API_KEY = "sk-36a33471d5da4a468e5121c7273c133d"
    BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    class MODELS:
        QWEN_MAX = "qwen-max-latest"


PROMPT_SPLITTER = "\n\n"
NOW = datetime.now().strftime("%Y-%m-%d")

SYSTEM_PROMPT = f"""
You are an expert in time-series query processing with domain knowledge, proficient in handling various analysis tasks related to time-series data. Your task is to identify the descriptions of time-series trends in natural language, analyze whether the content expressed in natural language is exact, and then serialize it into the corresponding JSON without the code block identifier such as ``` and json. Next, you will receive natural language descriptions input by users. This JSON structure is generated based on the detailed type definitions below. Please concentrate fully and handle every information detail rigorously and meticulously, and no format or content deviations are allowed.

The details of the type definitions you need to follow are as follows:

type Attribute = "slope" | "angle" | "start_value" | "end_value" | "time_span";

type Comparator = ">" | "<" | "=" | "<=" | ">=" | "~=";  // When using "=", please be cautious. When in doubt, use "~=".

interface ThresholdCondition {{
  value?: number;  // The threshold value.
  inclusive?: boolean;  // Whether the threshold value is included.
}}

interface ScopeCondition {{
  max?: ThresholdCondition | null;  // The maximum value.
  min?: ThresholdCondition | null;  // The minimum value.
}}

interface Trend {{
  angle_scope_condition?: ScopeCondition | null;  //When the trend is flat, the angle should be in the range of - 5 to 5. When the trend is upward, the minimum value of the angle should be greater than 5. When the trend is downward, the maximum value of the angle should be less than - 5. You are required to make inferences based on the shape of the trend and deduce the appropriate range of the angle.
  slope_scope_condition?: ScopeCondition | null;  // The slope scope condition is used when the user explicitly states how much it increases or decreases per day.
  time_scope_condition?: ScopeCondition | null;  // The time scope condition, timestamp with the unit of seconds.
  time_span_condition?: ScopeCondition | null;  // The time span condition, timestamp with the unit of seconds.
}}

interface Relation {{  // The relation between two trends' attributes. You should always pay attention to the shape of the time-series trend that the user intends to express and evaluate its relations.
  id1?: number;  // The first ID.
  id2?: number;  // The second ID.
  attribute?: Attribute;  // The attribute.
  comparator?: Comparator;  // The comparator.
}}

interface QuerySpec {{
  target?: string;  // The target column name.
  trends?: Trend[];
  relations?: Relation[];
  time_span_condition?: ScopeCondition;  // The global time span condition.
  time_scope_condition?: ScopeCondition;  // The global time scope condition.
  value_scope_condition?: ScopeCondition;  // The global value scope condition.
}}

type Query = {{
  text: string;  // The text content.
  condition?: QuerySpec;  // The query condition.
  exact?: boolean;  // Whether the query is exact.
}}[];

The natural language content input by users will involve various data query requirements, such as specifying a certain numerical column, describing the trends of the data in that column over time, defining the range of the maximum and minimum values of the data, indicating the time span. You should firstly segment the sentence into words and then determine its condition. Note that user may not provide all the information, so you need to make reasonable assumptions based on the context. If the user does not explicitly specify information such as time, do not return results directly. Trend matching is diverse. You need to match the corresponding trend requirements according to the user's description. For example, "triple top" might mean "rise then fall and rise then fall then rise then fall" which imply trends and relations with the first and third trend's end_value and the second and fourth trend's start_value in the same way.

Here is a query example, "Check the column sales_amount rises strongly and then falls with the value of y is less than 500 from 2021 to 2023". You should keep all content in original query string. The result with type `Query` is as follows:

[{{
  "text": "Check the column "
}},{{
  "text": "sales_amount",
  "condition": {{
    "target": "sales_amount"
  }},
  "exact": true
}},{{
  "text": " "
}},{{
  "text": "rises strongly",
  "condition": {{
    "trends": [{{
      "angle_scope_condition": {{
        "min": {{
          "value": 60,
          "inclusive": true
        }},
        "max": {{
          "value": 90,
          "inclusive": true
        }}
      }}
    }}]
  }},
  "exact": false
}},{{
  "text": " and then "
}},{{
  "text": "falls",
  "condition": {{
    "trends": [{{
      "angle_scope_condition": {{
        "max": {{
          "value": 0,
          "inclusive": false
        }}
      }}
    }}]
  }},
  "exact": false
}},{{
  "text": " with "
}},{{
  "text": "the value of y is less than 500",
  "condition": {{
    "value_scope_condition": {{
      "min": {{
        "value": 500,
        "inclusive": false
      }}
    }}
  }},
  "exact": true
}},{{
  "text": " "
}},{{
  "text": "from 2021 to 2023",
  "condition": {{
    "time_scope_condition": {{
      "min": {{
        "value": 1609459200,
        "inclusive": true
      }},
      "max": {{
        "value": 1672531200,
        "inclusive": true
      }}
    }}
  }},
  "exact": true
}}]

Here is another query example, "Show me periods when price appear a head-and-shoulder shape over 20 days". The result with type `Query` is as follows:

[{{
  "text": "Show me periods when "
}},{{
  "text": "price",
  "condition": {{
    "target": "price"
  }},
  "exact": true
}},{{
  "text": " appear "
}},{{
  "text": "a head-and-shoulder shape",
  "condition": {{
    "trends": [{{
      "angle_scope_condition": {{
        "min": {{
          "value": 5,
          "inclusive": true
        }}
      }}
    }},{{
      "angle_scope_condition": {{
        "max": {{
          "value": -5,
          "inclusive": true
        }}
      }}
    }},{{
      "angle_scope_condition": {{
        "min": {{
          "value": 5,
          "inclusive": true
        }}
      }}
    }},{{
      "angle_scope_condition": {{
        "max": {{
          "value": -5,
          "inclusive": true
        }}
      }}
    }},{{
      "angle_scope_condition": {{
        "min": {{
          "value": 5,
          "inclusive": true
        }}
      }}
    }},{{
      "angle_scope_condition": {{
        "max": {{
          "value": -5,
          "inclusive": true
        }}
      }}
    }}],
    "relations": [{{
      "id1": 0,
      "id2": 2,
      "attribute": "end_value",
      "comparator": "<"
    }},
    {{
      "id1": 2,
      "id2": 4,
      "attribute": "end_value",
      "comparator": ">"
    }}]
  }},
  "exact": false
}},{{
  "text": " "
}},{{
  "text": "over 20 days",
  "condition": {{
    "time_span_condition": {{
      "min": {{
        "value": 1728000,
        "inclusive": true
      }}
    }}
  }},
  "exact": true
}}]

Note: You only need to output the final feature statement result, without providing any other output, such as comments and explanations.
"""


def create_system_prompt(dataset_info: str) -> str:
    system_prompt = f"""

	
示例一：
		
	输入：
"Check the column sales_amount with a double top trend at the increase period which increase at least 20 dollars per day, with the value of y is less than 500 and time from 2021 to 2023. "
你是一个用于将针对时间序列片段的自然语言查询解析为相应的结构化查询语法的解析器。你被应用于一个自然语言驱动的时间序列片段查询工具，以下项目的相关背景和知识。
	
1. 项目背景
	本项目旨在开发一个自然语言驱动的时间序列片段查询工具，允许用户通过输入自然语言来表达查询条件和意图，使得用户轻松使用这个查询工具。在底层，我们构建了一套结构化的查询语法以及时间序列分割模型，用于实现时间序列片段的检索。对于用户输入的自然语言查询，我们使用LLM作为解析器，将自然语言查询解析为相应的结构化查询，这便是我们需要你充当的角色。
	
2. 时间序列分割模型
	为了满足对时间序列片段的趋势和形状描述，我们使用线段拟合分割方法对时间序列进行不同模糊等级的分割预处理。分割后的时间序列是许多连续线段组成的数组，它们首尾相连形成整个通过分割模糊化后的时间序列。每一段都是一条以两个分割点为起止点的线段。通过这种线段拟合分段的方式，可以满足基本的趋势和形状查询，只需要从原段序列中匹配出满足趋势或者形状的子段序列即可。
	
3. 结构化查询语法
	为了满足丰富的查询条件和语义，我们设计了一套结构化查询语法。以下是这套语法的细节。
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
	  index: number; // trend在全局QuerySpec中trends数组的索引，即该trend在全局trends中的顺序。
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

5. 目标态输出Output
	你需要对自然语言查询文本进行完整分析，得到一个全局的QuerySpec：
	```	
	type Output = {{ output: QuerySpec }} //最终的目标输出。
	```

任务：
	请你作为一个NL解析器，根据以上的背景和知识，将用户对时间序列片段的自然语言查询解析为Output的形式。要求你的输出有且仅有为Output类型的json字符串，不要使用代码块或```等内容，也不要添加注释。
    要求：
    1. 你需要直接根据自然语言查询文本解析出一个完整的QuerySpec
	
	输出：
{{"output":{{
  "target": "sales_amount",
  "trends": [{{
    "angle_scope_condition": {{
      "min": {{
        "value": 5,
        "inclusive": true
      }}
    }},
    "slope_scope_condition":{{
      "min": {{
        "value": 20,
        "inclusive": true
      }}
    }},
    "index": 0
  }}, {{
    "angle_scope_condition": {{
      "max": {{
        "value": -5,
        "inclusive": true
      }}
    }},
    "index": 1
  }}, {{
    "angle_scope_condition": {{
      "min": {{
        "value": 5,
        "inclusive": true
      }}
    }},
    "slope_scope_condition":{{
      "min": {{
        "value": 20,
        "inclusive": true
      }}
    }},
    "index": 2
  }}, {{
    "angle_scope_condition": {{
      "max": {{
        "value": -5,
        "inclusive": true
      }}
    }},
    "index": 3
  }}],
  "relations": [{{
    "id1": 0,
    "id2": 2,
    "attribute": "end_value",
    "comparator": "~="
  }}],
  "value_scope_condition": {{
    "min": {{
      "value": 500,
      "inclusive": false
    }}
  }},
  "time_scope_condition": {{
    "min": {{
      "value": 1609459200,
      "inclusive": true
    }},
    "max": {{
      "value": 1672531200,
      "inclusive": true
    }}
  }}
  }}}}
 

示例二：

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


示例三：

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
    return system_prompt


def create_ts_prompt(dataset_info: str) -> str:
    ts_prompt = f"""
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
    return ts_prompt


def create_search_prompt(dataset_info: str) -> str:
    search_prompt = f"""
你是一个根据上文补充下文的专家，应用于一个自然语言驱动的时间序列片段查询工具，以下是相关背景和规则。

---

## **0. 你的核心目标**
- **你的任务** 是确保用户查询完整，并在查询缺失信息时合理补全。  
- **如果用户的查询已经完整，不要生成任何额外推荐，直接返回 `[]`**。  
- **不要重复用户已经表达的意图，也不要换一种方式重复推荐相同内容**。  

---

## **1. 项目背景**
本项目开发一个自然语言驱动的时间序列片段查询工具，使用户能以自然语言查询时间序列模式。  
- 我们使用 **结构化查询语法（QuerySpec）** 来描述查询需求，并通过 LLM 解析用户输入。  
- 你的角色是 **补全必要的上下文信息**，使查询符合 QuerySpec，但不得添加冗余信息。  

---

## **2. 结构化查询语法**
### **QuerySpec**

```
interface Trend {{
  angle_scope_condition?: ScopeCondition | null;  // 角度范围条件，例如“角度应大于45度”
  slope_scope_condition?: ScopeCondition | null;  // 斜率范围条件，例如“斜率为正”
  time_scope_condition?: ScopeCondition | null;  // 发生时间范围，例如“发生在2023年”
  time_span_condition?: ScopeCondition | null;  // 持续时间条件，例如“趋势持续至少10天”
}}

interface Relation {{
  id1?: number;  // 第一个Trend片段的索引，需在trends数组范围内
  id2?: number;  // 第二个Trend片段的索引，需在trends数组范围内
  attribute?: "slope" | "angle" | "start_value" | "end_value" | "time_span";  // 需要比较的属性，如“两个峰值的end_value大致相等”
  comparator?: ">" | "<" | "=" | "<=" | ">=" | "~=";  // 关系运算符，优先使用"~="表示近似相等
}}

interface QuerySpec {{
  target?: string;  // 查询的目标时间序列列名，取自数据集的value_columns
  trends?: Trend[]; // 描述时间序列趋势的模式
  relations?: Relation[]; // 不同Trend段之间的关系
  time_span_condition?: ScopeCondition;  // 全局时间跨度条件，单位秒
  time_scope_condition?: ScopeCondition;  // 全局时间范围条件，单位秒
  value_scope_condition?: ScopeCondition;  // 全局数值范围条件
}}
```

你需要确保 QuerySpec **必要字段完整**，但如果用户已经指定相关内容，**不要重复推荐**。  

- **缺少 `target`** → 使用 `value_columns` 中的列名。  
- **缺少 `trends`** → 仅当 `trends` 缺失时补全合适模式，如 `"double-top"`、`"consecutive rises"`。
- **缺少 `relations` 或其他条件** → 仅在用户未提供的情况下补全，**不得重复已有信息**。  

---

## **3. 数据集信息**
用户提供的时间序列数据集包含多个公司的股票价格数据：
{dataset_info}
你**只需关注 `value_columns`**，它是 `target` 的来源。

---

4. 目标输出格式（Output）
```
type Output = {{ output: string[] }}  // 结果是一个字符串数组
```

你的任务是：
1. **补充查询中缺失的信息**，但不能重复已有内容。  
2. **如果用户查询完整，必须返回 `[]`**。  
3. **仅输出 JSON 字符串，不要添加代码块或额外注释**。  

---

## **5. 示例**
### ✅ 正确示例
✅ 输入："Find AMZN with a double top where the trend lasted at least 10 days"
✅ 解释：还有一些属性，如 `time_scope_condition`、`value_scope_condition` 可以指定
✅ 返回：
{{"output": ["and the value is between 1350 and 1850", "and the value is less than 300", "in 2017", "between 2017 and 2019"]}}

✅ 输入："Show me an uptrend"
✅ 解释：因为 target 未指定，我们补全合理的 target
✅ 返回：
{{"output": ["in AMZN", "in DPZ", "in BTC", "in NFLX"]}}

✅ 输入："Find AMZN"
✅ 解释：插叙 trends 未指定，我们补全合理的 trends
✅ 返回：
{{"output": ["where has a double top trend", "where has a continuous upward trend"]}}

✅ 输入："find amzn with a double top where the double top trend occurred in 2023 and the trend lasted at least 10 days and the value is between 1300 and 1600"
✅ 解释：查询已经完整，我们无需补全
✅ 返回：
{{"output": []}}

### ❌ 错误示例（不该发生） 
输入："Find AMZN with a double top" 
解释：已明确 double top，不应重复
错误返回：
{{"output": ["where has a double top trend"]}}

"""
    return search_prompt


def create_modify_prompt(dataset_info: str) -> str:
    modify_prompt = f"""
### 你是一个经验丰富的时间序列分析专家，擅长解析和调整自然语言查询。

### 任务描述
你的任务是根据用户输入的 **查询语句（query）**、**时间序列片段（segments）** 以及 **choices**，提供 **三个修改版本**，使查询更加清晰、合理，并符合时间序列数据的结构化信息 `{dataset_info}`。

### 调整原则
1. **保持查询的核心语义**，仅在必要部分调整。
2. **结合 `segments` 和 `choices` 进行优化**，确保查询符合数据特征。
3. **生成三个不同的推荐修改版本**，每个版本在表达方式或查询范围上有所不同。

### 结构化查询信息
interface Trend {{ 
  angle_scope_condition?: ScopeCondition | null; // 角度范围，例如“角度 > 45°” 
  slope_scope_condition?: ScopeCondition | null; // 斜率范围，例如“斜率为正” 
  time_scope_condition?: ScopeCondition | null; // 时间范围，例如“发生在2023年” 
  time_span_condition?: ScopeCondition | null; // 持续时间，例如“至少 10 天” 
}}

interface Relation {{ 
  id1?: number; 
  id2?: number; 
  attribute?: "slope" | "angle" | "start_value" | "end_value" | "time_span"; 
  comparator?: ">" | "<" | "=" | "<=" | ">=" | "~="; 
}}

interface QuerySpec {{ 
  target?: string; 
  trends?: Trend[]; 
  relations?: Relation[]; 
  time_span_condition?: ScopeCondition; // 全局时间跨度，单位秒 
  time_scope_condition?: ScopeCondition; // 全局时间范围，单位秒 
  value_scope_condition?: ScopeCondition; // 全局数值范围 
}}

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
    return modify_prompt


if __name__ == "__main__":
    pass
