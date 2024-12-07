from flask import Blueprint, request, jsonify
import numpy as np
import pandas as pd
from app.services import find_optimal_aspect_ratio
from app.config import Config
from numpy.typing import NDArray
from app.query.process_fragment import generate_fragments_by_time_granularity

from app.query.MyTypes import TrendConfig
from app.query import query

func_bp = Blueprint("func", __name__)


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
    csv_name = request.json.get("csvName")
    time_stamp_name: str = request.json.get("timeStampColumnName")
    valueColumnName: str = request.json.get("valueColumnName")
    df = pd.read_csv(Config.UPLOAD_FOLDER + csv_name)

    time_stamp: NDArray[np.float64] = pd.to_datetime(df[time_stamp_name]).astype(int) // 10**9
    value = df[valueColumnName].values
    ratio = find_optimal_aspect_ratio(time_stamp, value)
    return ratio


@func_bp.route("/get_fragments_by_time_granularity", methods=["POST"])
def get_fragments_by_time_granularity():
    """
    | 参数名 | 必填 | 类型 | 说明 |
    |--------|------|------|------|
    | timeStamps | 是   | List[str]  | 时间戳列表  |
    | timeGranularity | 是   | str  | 时间粒度  |
    | startTime | 否   | float  | 起始时间  |
    | endTime | 否   | float  | 结束时间  |

    return:
    List[Tuple[int, int]]: 片段的起止索引列表，每个元素为 (start_idx, end_idx)
    """
    time_granularity: str = request.json.get("timeGranularity")
    csv_name: str = request.json.get("csvName")
    time_column_name: str = request.json.get("timeColumnName")
    value_column_name: str = request.json.get("valueColumnName")
    fragment_list = generate_fragments_by_time_granularity(time_granularity, csv_name, time_column_name, value_column_name)
    return jsonify(fragment_list)


@func_bp.route("/request_for_query", methods=["POST"])
def request_for_query():
    querySpec = request.json.get("querySpec")
    fragment_list = request.json.get("fragmentList")
    optimal_ratio = request.json.get("optimalRatio")
    trendConfig = TrendConfig()
    results = query(querySpec, fragment_list, optimal_ratio, trendConfig)
    return jsonify(results)
