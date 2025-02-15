from .modify_nl_cases import ModifyNL_Cases
from .parse_nl_cases import ParseNL_Cases
from .shared_info import QuerySpecWithSource_info, parse_nl_logic_info, Segment_info, modify_nl_logic_info


def create_parse_nl_prompt(dataset_info: str) -> str:
    system_prompt = f"""你正在为一个自然语言驱动的时间序列片段查询工具服提供自然语言到结构化查询的解析服务。以下是相关背景和知识
	
# 带文本来源的结构化查询接口
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
    1. 准确严格地遵循QuerySpecWithSource的结构化查询接口定义，不要出现非法输出，输出前请检查
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


# 带文本来源的结构化查询语法
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
    modify_nl_prompt = f"""你正在为一个自然语言驱动的时间序列查询系统提供自然语言查询的自动化调整服务。以下是关于你的任务的背景和知识。

# 分段线性拟合的时间序列片段接口定义
'''{Segment_info}
'''

# 带文本来源的结构化查询接口定义
'''{QuerySpecWithSource_info}
'''

# 自然语言查询的调整逻辑
{modify_nl_logic_info}


# 任务描述
你的任务是根据原始的`QuerySpecWithSource`, 用户指定的时间序列片段`segments`，以及需要调整的`choices`，使查询更加清晰、合理，并符合时间序列数据的结构化信息。

## 输入参数
- `query`: 用户的自然语言查询。
- `segments`: 时间序列片段，包含 `angle`、`start_time`、`end_time`、`start_value`、`end_value` 等信息。
- `choices`: 需要调整的查询部分，例如 `angle_scope_condition` 或 `value_scope_condition`。

## 输出格式
返回 **JSON 对象**，格式如下：{{"output": ["修改版本1", "修改版本2", "修改版本3"]}}
不要添加额外的代码块、注释或解释。

# 示例1
{ModifyNL_Cases.case1}

# 示例2
{ModifyNL_Cases.case2}

# 示例3
{ModifyNL_Cases.case3}
"""
    return modify_nl_prompt


# print(create_modify_nl_prompt())
