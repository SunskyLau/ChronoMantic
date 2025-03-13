from .modify_nl_cases import ModifyNL_Cases
from .parse_nl_cases import ParseNL_Cases
from .shared_info import QuerySpecWithSource_info, SegmentGroup_info, parse_nl_logic_info, Segment_info, modify_nl_logic_info, intentions_info

parse_nl_cases = f"""## Example 1
{ParseNL_Cases.case1}

## Example 2
{ParseNL_Cases.case2}

## Example 3
{ParseNL_Cases.case3}

## Example 4
{ParseNL_Cases.case4}

## Example 5
{ParseNL_Cases.case5}

## Example 6
{ParseNL_Cases.case6}
"""

modify_nl_cases = f"""## Example 1
{ModifyNL_Cases.case1}

## Example 2
{ModifyNL_Cases.case2}

## Example 3
{ModifyNL_Cases.case3}

## Example 4
{ModifyNL_Cases.case4}
"""

parse_nl_system_prompt = "You are providing a natural language to structured query parsing service for a natural language-driven time series segment querying tool. Below is the relevant background and knowledge."
modify_nl_system_prompt = "你是一个专门处理时间序列查询文本调整的AI助手。你需要根据用户的调整意图，生成新的查询文本并建立文本映射关系。"


def create_parse_nl_info(dataset_info: str) -> str:
    parse_nl_info = f"""
# Structured QuerySpecWithSource Interface
{QuerySpecWithSource_info}

# Dataset Information
The user has uploaded a dataset containing the following columns of time series: {dataset_info}. The target you parse can only be selected from these contents and cannot be chosen from other contents. If the user does not explicitly specify the target, simply return an empty array.

# Natural Language Parsing Logic
{parse_nl_logic_info}

# Task:
Based on the above background and knowledge, parse the user's natural language query about time series segments into a JSON dictionary format following the `QuerySpecWithSource` structure.
Requirements:
    1. Accurately and strictly follow the `QuerySpecWithSource` structured query interface definition without illegal outputs. Check before outputting.
    2. Output only the JSON dictionary without code blocks, comments, or additional annotations.

# Reference
## Parse Natural Language Examples
{parse_nl_cases}
"""
    return parse_nl_info


def create_modify_nl_info() -> str:
    modify_nl_info = f"""# 核心任务
输入:
- old_queryspec_with_source: 原始查询规范
- new_queryspec_with_source_without_text_sources: 新查询规范(不含文本相关字段)
- intentions: 调整意图

输出:
- new_queryspec_with_source: 完整的新查询规范，包含:
  - original_text: 新的查询文本
  - text_sources: 文本片段来源
  - text_source_id: 属性与文本的映射关系

# 关键接口定义
## QuerySpecWithSource 结构
```{QuerySpecWithSource_info}```

## Intentions 结构
```{intentions_info}```

# 文本调整规则
{modify_nl_logic_info}

# 参考信息
## 解析规则
{parse_nl_logic_info}

## 示例
{modify_nl_cases}

# 输出要求
1. 严格遵循 QuerySpecWithSource 数据结构
2. 仅输出 JSON 对象
3. 不要添加代码块标记(```)
4. 不要添加任何注释
5. 输出前检查数据完整性和合法性
"""
    return modify_nl_info
