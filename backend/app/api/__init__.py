import json
from typing import List, Tuple
from app.ai_agent.prompts import create_parse_nl_prompt, create_modify_nl_prompt
from flask import Blueprint
from app.query import query
from ..config import Config
from flask import Blueprint, request, jsonify
import numpy as np
import pandas as pd
from app.utils.file import process_csv_file
from app.services.banking_to_45degree import find_optimal_aspect_ratio
from ..MyTypes import DatasetInfo, QuerySpec, Segment, SegmentGroup
from ..model import approximate_dataset
from numpy.typing import NDArray
from ..shared_data import (
    dataset_info_container,
    dataset_container,
    approximation_segments_containers_container,
    parse_nl_agent,
    modify_nl_agent,
)
from app.utils.queryspec import add_category_to_intentions, fix_text_source_id, modify_queryspec_by_intentions, get_segment_info

bus_bp = Blueprint("bus", __name__)


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, o):
        # 处理NumPy数据类型
        if isinstance(o, (np.int64, np.int32)):
            return int(o)
        if isinstance(o, (np.float64, np.float32)):
            return float(o)

        # 处理NumPy数组
        if isinstance(o, np.ndarray):
            return o.tolist()

        # 如果对象有to_dict方法，优先使用该方法
        if hasattr(o, "to_dict") and callable(getattr(o, "to_dict")):
            return o.to_dict()

        # 如果对象是可迭代的（但不是字符串），转换为列表
        if hasattr(o, "__iter__") and not isinstance(o, (str, bytes, bytearray)):
            return list(o)

        # 尝试将对象转换为字典
        try:
            return o.__dict__
        except AttributeError:
            pass

        # 如果以上方法都失败，尝试直接转换为字符串
        try:
            return str(o)
        except:
            return super().default(o)


def filter_json(data):
    return json.loads(json.dumps(data, cls=CustomJSONEncoder))


@bus_bp.route("/get_scale_ratio", methods=["POST"])
def get_scale_ratio():
    """
    | 参数名 | 必填 | 类型 | 说明 |
    |--------|------|------|------|
    | csvName | 是   | str  | CSV文件名  |
    | timeStampColumnName  | 是   | str  | 时间戳列名  |
    | valueColumnName | 是   | str  | 值列名  |

    return:
    ratio: 单位数量的横纵长度比例
    """
    csv_name: str = request.json.get("csvName")
    time_stamp_name: str = request.json.get("timeStampColumnName")
    valueColumnName: str = request.json.get("valueColumnName")
    df = pd.read_csv(Config.UPLOAD_FOLDER + csv_name)

    time_stamp: NDArray[np.float64] = pd.to_datetime(df[time_stamp_name]).astype("int64") // 10**9
    value = df[valueColumnName].values
    ratio = find_optimal_aspect_ratio(time_stamp, value)
    return jsonify(filter_json(ratio))


@bus_bp.route("/upload_csv_file", methods=["POST"])
def upload_csv_file():
    """
    | 参数名       | 必填 | 类型 | 说明       |
    |--------------|------|------|------------|
    | file         | 是   | File | CSV文件    |
    | dataset_info | 是   | JSON | 数据集信息 |
    return:
    code: 状态码
    """
    parse_nl_agent.delete_chat_history()
    modify_nl_agent.delete_chat_history()
    try:
        if "file" not in request.files:
            return jsonify({"code": 400, "message": "No file uploaded"}), 400

        file = request.files["file"]

        # 处理文件和数据集信息
        df, result = process_csv_file(file)

        # 保存数据到shared_data
        dataset_container.set_data(df)

        return jsonify({"code": 200, "message": "File uploaded successfully", **result})

    except ValueError as e:
        return jsonify({"code": 400, "message": str(e)}), 400
    except Exception as e:
        return jsonify({"code": 500, "message": f"Error uploading file: {str(e)}"}), 500


@bus_bp.route("/process_dataset", methods=["POST"])
def process_dataset():
    dataset_info = DatasetInfo.from_dict(request.json.get("datasetInfo"))
    dataset_info_str = json.dumps(dataset_info.to_dict(), cls=CustomJSONEncoder)
    parse_nl_system_prompt = create_parse_nl_prompt(dataset_info_str)
    parse_nl_agent.set_system_prompt(parse_nl_system_prompt)
    modify_nl_system_prompt = create_modify_nl_prompt()
    modify_nl_agent.set_system_prompt(modify_nl_system_prompt)
    dataset_info_container.set_data(dataset_info)
    dataset = dataset_container.get_data()
    approxiamation_segments_containers = approximate_dataset(dataset, dataset_info)
    approximation_segments_containers_container.set_data(approxiamation_segments_containers)
    # 将List[ApproximationSegmentsContainer]转换为可序列化的格式
    serialized_containers = [container.to_dict() for container in approxiamation_segments_containers]
    return jsonify({"code": 200, "message": "Dataset processed successfully", "approximationSegmentsContainers": filter_json(serialized_containers)})


@bus_bp.route("/query_by_specification", methods=["POST"])
def query_by_specification():
    """根据结构化查询规范查询时间序列片段

    | 参数名 | 类型 | 说明 |
    |--------|------|------|
    | querySpec | QuerySpec | 结构化查询规范 |

    | 返回字段 | 类型 | 说明 |
    |----------|------|------|
    | code | int | 状态码 |
    | message | str | 状态信息 |
    | results | Dict | 查询结果 |
    """
    try:
        query_spec_dict = request.json.get("querySpec")
        if not query_spec_dict:
            return jsonify({"code": 400, "message": "QuerySpec is required"}), 400

        query_spec = QuerySpec.from_dict(query_spec_dict)
        if not query_spec:
            return jsonify({"code": 400, "message": "Invalid QuerySpec format"}), 400

        approximation_segments_containers = approximation_segments_containers_container.get_data()
        df = dataset_container.get_data()
        results_dict = query(query_spec, approximation_segments_containers, df)
        return jsonify({"code": 200, "message": "Query successful", "results": filter_json(results_dict)})
    except ValueError as e:
        return jsonify({"code": 400, "message": str(e)}), 400
    # except Exception as e:
    #     return jsonify({"code": 500, "message": f"Error processing query: {str(e)}"}), 500


@bus_bp.route("/parse_nl_query", methods=["POST"])
def parse_nl_query():
    """将自然语言查询解析为结构化查询

    | 参数名 | 类型 | 说明 |
    |--------|------|------|
    | nl_query | str | 自然语言查询字符串 |

    | 返回字段 | 类型 | 说明 |
    |----------|------|------|
    | code | int | 状态码 |
    | message | str | 状态信息 |
    | results | QuerySpecWithSource | 解析后的结构化查询 |
    """
    nl_query = request.json.get("nl_query")
    queryspec_with_source_str = parse_nl_agent.send_prompt(nl_query, False)
    # 将字符串解析为Python字典
    queryspec_with_source = json.loads(queryspec_with_source_str)
    return jsonify({"code": 200, "message": "Parse nl query successful", "results": filter_json(queryspec_with_source)})


@bus_bp.route("/modify_nl_query", methods=["POST"])
def modify_nl_query():
    """根据用户意图修改结构化查询

    | 参数名 | 类型 | 说明 |
    |--------|------|------|
    | old_queryspec_with_source | QuerySpecWithSource | 原始结构化查询 |
    | segments | List[SimplifiedSegment] | 用户指定的连续时间序列片段 |
    | intentions | List[Intention] | 用户的调整意图 |

    | 返回字段 | 类型 | 说明 |
    |----------|------|------|
    | code | int | 状态码 |
    | message | str | 状态信息 |
    | results | QuerySpecWithSource | 修改后的结构化查询 |
    """
    old_queryspec_with_source = request.json.get("old_queryspec_with_source")
    segments = request.json.get("segments")
    segments = get_segment_info(segments)
    intentions = request.json.get("intentions")
    new_queryspec_with_source = modify_queryspec_by_intentions(old_queryspec_with_source, segments, intentions)
    intentions["single_segment_intentions"] = add_category_to_intentions(segments, intentions["single_segment_intentions"])

    old_queryspec_with_source_str = json.dumps(old_queryspec_with_source, indent=2)
    intentions_str = json.dumps(intentions, indent=2)

    input = f"""old_queryspec_with_source
```{old_queryspec_with_source_str}
```

new_queryspec_with_source_without_text_sources
```{new_queryspec_with_source}
```

intentions
```{intentions_str}
```
    """
    new_queryspec_with_source_str = modify_nl_agent.send_prompt(input, False)
    new_queryspec_with_source = json.loads(new_queryspec_with_source_str)
    new_queryspec_with_source = fix_text_source_id(new_queryspec_with_source)
    return jsonify({"code": 200, "message": "Modify nl query successful", "results": new_queryspec_with_source})


def calculate_segment_groups(segments: List[Segment], trend_groups: List[Tuple[int, int]]) -> List[SegmentGroup]:
    """计算连续时间序列片段的组信息

    | 参数名 | 类型 | 说明 |
    |--------|------|------|
    | segments | List[Segment] | 用户指定的连续时间序列片段 |
    | trend_groups | List[Tuple[int, int]] | 用户指定的趋势组 |

    | 返回字段 | 类型 | 说明 |
    |----------|------|------|
    | segment_groups | List[SegmentGroup] | 连续时间序列片段的组信息 |
    """
    segment_groups = []
    for trend_group in trend_groups:
        if trend_group[0] >= len(segments) or trend_group[1] >= len(segments) or trend_group[0] < 0 or trend_group[1] < 0:
            continue
        if trend_group[0] > trend_group[1]:
            continue
        duration = float(segments[trend_group[1]].end_time - segments[trend_group[0]].start_time)
        segment_group = SegmentGroup(ids=trend_group, duration=duration)
        segment_groups.append(segment_group)
    return segment_groups


@bus_bp.route("/add_chat_history", methods=["POST"])
def add_chat_history():
    """添加聊天历史

    | 参数名 | 类型 | 说明 |
    |--------|------|------|
    | user_prompt | str | 用户提示 |
    | assistant_prompt | str | 助手提示 |
    """
    user_prompt = request.json.get("user_prompt")
    assistant_prompt = request.json.get("assistant_prompt")
    parse_nl_agent.add_chat_history("user", user_prompt)
    parse_nl_agent.add_chat_history("assistant", assistant_prompt)
    return jsonify({"code": 200, "message": "Add chat history successful"})
