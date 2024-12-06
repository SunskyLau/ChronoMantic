from flask import Blueprint, request, jsonify
import numpy as np
import pandas as pd
from app.services import find_optimal_aspect_ratio
from app.config import Config
from numpy.typing import NDArray

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
    df = pd.read_csv(Config.UPLOAD_FOLDER + request.json["csvName"])
    time_stamp_name: str = request.json["timeStampColumnName"]
    valueColumnName: str = request.json["valueColumnName"]
    time_stamp: NDArray[np.float64] = pd.to_datetime(df[time_stamp_name]).astype(int) // 10**9
    value = df[valueColumnName].values
    ratio = find_optimal_aspect_ratio(time_stamp, value)
    return ratio
