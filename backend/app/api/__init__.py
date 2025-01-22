import json
from flask import Blueprint

from app.query import query
from app.ai_agent.query import get_query_spec, adjust_query
from ..config import Config
from flask import Blueprint, request, jsonify
import numpy as np
import pandas as pd
from app.utils import process_csv_file
from app.services.banking_to_45degree import find_optimal_aspect_ratio
from ..MyTypes import DatasetInfo, QuerySpec
from ..model import approximate_dataset
from numpy.typing import NDArray
from ..shared_data import dataset_info_container, dataset_container, approximation_segments_containers_container

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
    dataset_info_container.set_data(dataset_info)
    dataset = dataset_container.get_data()
    approxiamation_segments_containers = approximate_dataset(dataset, dataset_info)
    approximation_segments_containers_container.set_data(approxiamation_segments_containers)
    # 将List[ApproximationSegmentsContainer]转换为可序列化的格式
    serialized_containers = [container.to_dict() for container in approxiamation_segments_containers]
    return jsonify({"code": 200, "message": "Dataset processed successfully", "approximationSegmentsContainers": filter_json(serialized_containers)})


@bus_bp.route("/query_by_specification", methods=["POST"])
def query_by_specification():
    query_spec = QuerySpec.from_dict(request.json.get("querySpec"))
    approximation_segments_containers = approximation_segments_containers_container.get_data()
    df = dataset_container.get_data()
    results_dict = query(query_spec, approximation_segments_containers, df)
    return jsonify({"code": 200, "message": "Query successful", "results": filter_json(results_dict)})


@bus_bp.route("/parse_query", methods=["POST"])
def parse_query():
    query_spec = get_query_spec(request.json.get("query"))
    return jsonify({"code": 200, "message": "Parse successful", "results": filter_json(query_spec)})


@bus_bp.route("/tune_query", methods=["POST"])
def tune_query():
    query_spec = adjust_query(request.json.get("query"))
    return jsonify({"code": 200, "message": "Tune successful", "results": query_spec})
