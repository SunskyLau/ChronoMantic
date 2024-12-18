from typing import Dict, List, Optional

import pandas as pd

from ..new_model import generate_fm_dict
from ..MyTypes import Fragment, Pattern, QuerySpec


def new_query(querySpec: QuerySpec, fragments: List[Fragment], fm_dict: Dict) -> List[Fragment]:
    new_fragments: List[Fragment] = []

    for fragment in fragments:
        if if_satisfy_query_spec(fragment, querySpec, fm_dict):
            new_fragments.append(fragment)

    return new_fragments


def if_satisfy_query_spec(fragment: Fragment, querySpec: QuerySpec, fm_dict) -> bool:
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
    fm_dict = generate_fm_dict({"AMZN": {"x": x, "y": y}})
    print("fm_dict:", fm_dict["AMZN"][1][3][2])
    print("生成fm_dict耗时:", time.time() - start_time)
    query_spec = QuerySpec(
        patterns=[Pattern(trend="up"), Pattern(trend="down")],
    )
    old_fragments: List[Fragment] = []
    for i in range(364):
        for j in range(i + 1, 365):
            old_fragments.append(Fragment(start_idx=i, end_idx=j, segments=[], source="AMZN"))
    print("原始fragments数量:", len(old_fragments))
    print("开始查询...")
    start_time = time.time()
    new_fragments = new_query(query_spec, old_fragments, fm_dict)
    print("查询耗时:", time.time() - start_time)
    print("新fragments数量:", len(new_fragments))
