from typing import List, Tuple
import numpy as np
import pandas as pd
from app.query.MyTypes import Fragment, FragmentList, Pattern, QuerySpec, TrendConfig, ValueCondition
from app.config import Config
from app.query.process_fragment import (
    calculate_fragment_theta,
    determine_trends,
    generate_fragments_by_query,
    generate_fragments_by_time_granularity,
)
from app.services.banking_to_45degree import find_optimal_aspect_ratio
from numpy.typing import NDArray


def if_satisfy_query(fragment: Fragment, querySpec: QuerySpec):
    if len(fragment.segments) != len(querySpec.patterns):
        return False
    for i, segment in enumerate(fragment.segments):
        if querySpec.patterns[i].trend is None:
            continue
        else:
            if segment.trend == querySpec.patterns[i].trend:
                if querySpec.patterns[i].extent is None:
                    continue
                else:
                    if segment.extent != querySpec.patterns[i].extent:
                        return False
            else:
                return False
    return True


def query(
    querySpec: QuerySpec,
    fragment_list: FragmentList,
    ratio: float,
    trendConfig: TrendConfig,
) -> List[Fragment]:
    csv_name = fragment_list.csv_name
    value_column_name = fragment_list.value_column_name
    time_column_name = fragment_list.time_column_name
    new_fragment_list = generate_fragments_by_query(fragment_list, querySpec)
    # print("new_fragment_list:", new_fragment_list)
    result_fragment_list = FragmentList(csv_name=csv_name, value_column_name=value_column_name, time_column_name=time_column_name, fragments=[])

    for fragment in new_fragment_list.fragments:
        fragment = calculate_fragment_theta(fragment, ratio)
        fragment = determine_trends(fragment, trendConfig)
        if if_satisfy_query(fragment, querySpec):
            result_fragment_list.fragments.append(fragment)

    return result_fragment_list


if __name__ == "__main__":
    querySpec = QuerySpec(
        patterns=[Pattern(trend="up", extent=None), Pattern(trend="down", extent=None)],
        y_max_condition=None,
        y_min_condition=None,
        start_time=None,
        end_time=None,
    )

    csv_path: str = "../portfolio_data.csv"
    data: pd.DataFrame = pd.read_csv(csv_path)
    # 将日期字符串转换为datetime，再转换为时间戳
    time_stamp: NDArray[np.float64] = pd.to_datetime(data["Date"]).astype(np.int64) // 10**9
    value: NDArray[np.float64] = data["AMZN"].values
    # 为了避免数值太大，可以减去最小值
    time_stamp = time_stamp - time_stamp.min()
    optimal_ratio: float = find_optimal_aspect_ratio(time_stamp, value)
    print(optimal_ratio)

    csv_name = "portfolio_data.csv"
    time_column_name = "Date"
    value_column_name = "AMZN"
    time_granularity = "year"
    fragment_list = generate_fragments_by_time_granularity(
        time_granularity=time_granularity, csv_name=csv_name, time_column_name=time_column_name, value_column_name=value_column_name
    )
    # print("fragment_list:", fragment_list)
    trendConfig = TrendConfig()
    results = query(querySpec, fragment_list, optimal_ratio, trendConfig)
    print(results)
