import json
from flask import Blueprint, request, jsonify
import numpy as np
import pandas as pd
from app.services import find_optimal_aspect_ratio
from app.config import Config
from numpy.typing import NDArray
from app.query.precise_time_query.process_fragment import generate_fragments_by_time_granularity
from app.ai_agent import myAIClient
from app.ai_agent.constant import GPT_4O, SYSTEM_PROMPT, AZURE
from app.query.MyTypes import FragmentList, QuerySpec, TrendConfig
from app.query import query

func_bp = Blueprint("func", __name__)


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, np.int64) or isinstance(o, np.int32):
            return int(o)
        elif isinstance(o, np.float64) or isinstance(o, np.float32):
            return float(o)
        return super().default(o)


def filter_json(data):
    return json.loads(json.dumps(data, cls=CustomJSONEncoder))


@func_bp.route("/get_scale_ratio", methods=["POST"])
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


@func_bp.route("/get_fragments_by_time_granularity", methods=["POST"])
def get_fragments_by_time_granularity():
    """
    | 参数名 | 必填 | 类型 | 说明 |
    |--------|------|------|------|
    | timeGranularity | 是   | str  | 时间粒度  |
    | csvName | 是   | str  | CSV文件名  |
    | timeColumnName | 是   | str  | 时间戳列名  |
    | valueColumnName | 是   | str  | 值列名  |

    return:
    fragment_list: FragmentList
    """
    time_granularity: str = request.json.get("timeGranularity")
    csv_name: str = request.json.get("csvName")
    time_column_name: str = request.json.get("timeColumnName")
    value_column_name: str = request.json.get("valueColumnName")
    fragment_list = generate_fragments_by_time_granularity(time_granularity, csv_name, time_column_name, value_column_name)
    return jsonify(filter_json(fragment_list.to_dict()))


@func_bp.route("/request_for_query", methods=["POST"])
def request_for_query():
    """
    | 参数名 | 必填 | 类型 | 说明 |
    |--------|------|------|------|
    | querySpec | 是   | QuerySpec  | 查询规则  |
    | fragmentList | 是   | FragmentList  | 片段列表  |
    | optimalRatio | 是   | float  | 最佳比例  |

    return:
    result_fragment_list: FragmentList
    """
    querySpec: QuerySpec = QuerySpec.from_dict(request.json.get("querySpec"))
    fragment_list: FragmentList = FragmentList.from_dict(request.json.get("fragmentList"))
    optimal_ratio: float = request.json.get("optimalRatio")
    trendConfig = TrendConfig()
    print(querySpec)
    print(fragment_list)
    print(optimal_ratio)
    results, others = query(querySpec, fragment_list, optimal_ratio, trendConfig)
    print(results)
    return jsonify(filter_json({"results": results.to_dict(), "others": others.to_dict()}))


@func_bp.route("/query_spec", methods=["GET"])
def query_spec():
    query = request.args.get("query")
    client = myAIClient(GPT_4O, AZURE)
    response = client.sendPrompt(SYSTEM_PROMPT, query, keepHistory=False, if_response_format=True)
    response = json.loads(response)
    return jsonify(response)
