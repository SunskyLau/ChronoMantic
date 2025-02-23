from .modify_nl_cases import ModifyNL_Cases
from .parse_nl_cases import ParseNL_Cases
from .shared_info import QuerySpecWithSource_info, SegmentGroup_info, parse_nl_logic_info, Segment_info, modify_nl_logic_info, intentions_info

parse_nl_cases = f"""## 示例1
{ParseNL_Cases.case1}

## 示例2
{ParseNL_Cases.case2}

## 示例3
{ParseNL_Cases.case3}

## 示例4
{ParseNL_Cases.case4}

## 示例5
{ParseNL_Cases.case5}
"""

modify_nl_cases = f"""## 示例1
{ModifyNL_Cases.case1}
"""


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

# 示例
{parse_nl_cases}
"""
    return system_prompt


def create_modify_nl_prompt() -> str:
    modify_nl_prompt = f"""你正在为一个自然语言驱动的时间序列查询系统提供自然语言查询的自动化调整服务。以下是关于你的任务的背景和知识。

# Segment接口定义
```{Segment_info}
```

# SegmentGroup接口定义
```{SegmentGroup_info}
```

# 带文本来源的结构化查询接口定义
```{QuerySpecWithSource_info}
```

# 整体查询意图接口定义
```{intentions_info}
```

# 自然语言查询的解析逻辑
{parse_nl_logic_info}

# 自然语言查询的解析示例
{parse_nl_cases}

# 自然语言查询的调整逻辑
{modify_nl_logic_info}

# 任务描述
你的任务是根据原始的`old_queryspec_with_source`，用户指定的连续时间序列片段`segments`，用户指定的时间序列片段组`segment_groups`，以及用户的调整意图`intentions`，根据用户意图输出调整后的`new_queryspec_with_source`。
要求:
    1. 准确严格地遵循`new_queryspec_with_source`的数据结构定义`QuerySpecWithSource`，不要出现非法输出，输出前请检查
    2. 有且仅输出json字典，不要添加代码块或者```，也不要添加注释。

# 示例
{modify_nl_cases}
"""
    return modify_nl_prompt


# print(create_modify_nl_prompt())
