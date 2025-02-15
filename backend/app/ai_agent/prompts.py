from .parse_nl_cases import ParseNL_Cases
from .shared_info import QuerySpecWithSource_info, parse_nl_logic_info, Segment_info


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

# 自然语言解析逻辑
{parse_nl_logic_info}

# 任务：
根据以上的背景和知识，将用户对时间序列片段的自然语言查询解析为QuerySpecWithSource的json字典形式。
要求:
    1. 准确遵循QuerySpecWithSource的结构化查询语法，不要出现非法输出，输出前请检查
    2. 有且仅输出json字典，不要添加代码块或者```，也不要添加注释。

# 示例1
{ParseNL_Cases.case1}

# 示例2
{ParseNL_Cases.case2}

# 示例3
{ParseNL_Cases.case3}
"""
    return system_prompt


def create_generate_nl_prompt(dataset_info: str) -> str:
    ts2nl_prompt = f"""
你是一个有着时间序列处理方面数十年经验的专家，你非常擅长分析时间序列，并可以使用自然语言描述这段特殊的时间序列。以下是和你的任务相关的背景和知识。


# 结构化查询语法
```{QuerySpecWithSource_info}
```

# 数据集信息
用户上传的是一个股票价格数据集，包含了多个公司的股票数据。
以下是用户要查询的时间序列数据集的基本信息：
{dataset_info}
你只需要关注其中的value_columns信息，其中包含了时间序列的列名信息，是你之后解析出target字段的来源。

# 分段线性拟合的时间序列片段接口定义
'''{Segment_info}
'''
    

# 任务


# 示例
		

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
