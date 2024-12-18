from typing import Dict, List, Optional

import numpy as np
import pandas as pd

from ..new_model import generate_fm_dict
from ..MyTypes import Comparator, Fragment, Pattern, QuerySpec, ValueCondition


def get_new_fragment(fm_dict: Dict, fragment: Fragment, querySpec: QuerySpec) -> Optional[Fragment]:
    if len(querySpec.patterns) == 0:
        return fragment
    else:
        new_fragment: Optional[Fragment] = fm_dict[fragment.source][fragment.start_idx][fragment.end_idx][len(querySpec.patterns)]
        return new_fragment


def new_query(querySpec: QuerySpec, fragments: List[Fragment], fm_dict: Dict, time_series_dataset) -> List[Fragment]:
    new_fragments: List[Fragment] = []

    for fragment in fragments:
        if if_satisfy_query_spec(fragment, querySpec, fm_dict, time_series_dataset):
            new_fragments.append(get_new_fragment(fm_dict, fragment, querySpec))

    return new_fragments


def if_satisfy_value_condition(value: float, value_condition: ValueCondition) -> bool:
    if value_condition.comparator == Comparator.GREATER:
        return value > value_condition.value
    elif value_condition.comparator == Comparator.NO_GREATER:
        return value <= value_condition.value
    elif value_condition.comparator == Comparator.EQUAL:
        return value == value_condition.value
    elif value_condition.comparator == Comparator.NO_LESS:
        return value >= value_condition.value
    elif value_condition.comparator == Comparator.LESS:
        return value < value_condition.value
    else:
        return value != value_condition.value


def if_satisfy_query_spec(fragment: Fragment, querySpec: QuerySpec, fm_dict, time_series_data) -> bool:
    y = time_series_data[fragment.source]["y"]
    min_value = np.min(y[fragment.start_idx : fragment.end_idx + 1])
    max_value = np.max(y[fragment.start_idx : fragment.end_idx + 1])
    # 首先判断y的条件
    if querySpec.y_max_condition is not None:
        if not if_satisfy_value_condition(max_value, querySpec.y_max_condition):
            return False
    if querySpec.y_min_condition is not None:
        if not if_satisfy_value_condition(min_value, querySpec.y_min_condition):
            return False

    patterns_length = len(querySpec.patterns)
    fm = fm_dict[fragment.source]
    if patterns_length != 0:
        new_fragment: Optional[Fragment] = fm[fragment.start_idx][fragment.end_idx][patterns_length]
        if new_fragment is None:
            return False
        for idx, pattern in enumerate(querySpec.patterns):
            if pattern.trend == "up" and new_fragment.segments[idx].slope > 0:
                continue
            elif pattern.trend == "down" and new_fragment.segments[idx].slope < 0:
                continue
            else:
                return False
    return True


if __name__ == "__main__":
    import time

    # 测试new_query的整个流程
    print("载入数据...")
    df = pd.read_csv("../portfolio_data.csv")
    y = df["AMZN"].values[0:365]
    x = df.index.values[0:365]
    start_time = time.time()
    print("开始计算fm_dict...")
    time_series_dataset = {"AMZN": {"x": x, "y": y}}
    fm_dict = generate_fm_dict(time_series_dataset)
    print("fm_dict:", fm_dict["AMZN"][1][3][2])
    print("生成fm_dict耗时:", time.time() - start_time)
    query_spec = QuerySpec(
        patterns=[Pattern(trend="up"), Pattern(trend="down")],
        y_max_condition=ValueCondition(comparator=Comparator.NO_GREATER, value=270),
        y_min_condition=ValueCondition(comparator=Comparator.NO_LESS, value=250),
    )
    old_fragments: List[Fragment] = []
    for i in range(364):
        for j in range(i + 1, 365):
            old_fragments.append(Fragment(start_idx=i, end_idx=j, segments=[], source="AMZN"))
    print("原始fragments数量:", len(old_fragments))
    print("开始查询...")
    start_time = time.time()
    new_fragments = new_query(query_spec, old_fragments, fm_dict, time_series_dataset)
    print("查询耗时:", time.time() - start_time)
    print("新fragments数量:", len(new_fragments))
    for fragment in new_fragments:
        print("fragment:", fragment)
