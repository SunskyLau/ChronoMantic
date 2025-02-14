from typing import List
from typeguard import typechecked
import numpy as np
import pandas as pd
from ..MyTypes import ApproximationSegmentsContainer, DatasetInfo, Segment
from .bottom_up import bottom_up_merge


@typechecked
def approximate_dataset(dataset: pd.DataFrame, dataset_info: DatasetInfo, k: int = 1):
    """对数据集进行近似化处理"""
    approxiamation_segments_containers: List[ApproximationSegmentsContainer] = []
    time_column = dataset_info.time_column
    value_columns = dataset_info.value_columns
    x = pd.to_datetime(dataset[time_column]).astype("int64") // 10**9  # 转换为秒

    for vc in value_columns:
        y = dataset[vc].values
        approxiamation_segments_container = bottom_up_merge(vc, x, y, k)
        approxiamation_segments_container = update_abs_slope_percentage(approxiamation_segments_container)
        approxiamation_segments_containers.append(approxiamation_segments_container)

    return approxiamation_segments_containers


@typechecked
def update_abs_slope_percentage(approximation_segments_container: ApproximationSegmentsContainer):
    """更新每个segment的abs_slope_percentage"""
    # 只找level为0的segments
    level_0_segments = next((segments for segments in approximation_segments_container.approximation_segments_list if segments.approximation_level == 0), None)

    if level_0_segments:
        # 计算level 0的segments的abs_slope的最大值
        max_abs_slope = max(abs(segment.slope) for segment in level_0_segments.segments)

        # 更新所有level的segments的abs_slope_percentage
        for approximation_segments in approximation_segments_container.approximation_segments_list:
            for segment in approximation_segments.segments:
                if max_abs_slope > 0:  # 避免除以0
                    segment.abs_slope_percentage = abs(segment.slope) / max_abs_slope * 100
                else:
                    segment.abs_slope_percentage = 0

    return approximation_segments_container


if __name__ == "__main__":
    df = pd.read_csv("../portfolio_data.csv")
    dataset_info = DatasetInfo(time_column="Date", value_columns=["AMZN", "DPZ"], column_ratio_dict={"AMZN": 1, "DPZ": 1})
    approxiamation_segments_containers = approximate_dataset(df, dataset_info)
    print(approxiamation_segments_containers)
