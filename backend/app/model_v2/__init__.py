from typing import List
from typeguard import typechecked
import numpy as np
import pandas as pd
from ..MyTypes_v1 import ApproximationSegmentsContainer, DatasetInfo, Segment
from .bottom_up import bottom_up_merge


@typechecked
def approximate_dataset(dataset: pd.DataFrame, dataset_info: DatasetInfo, k: int = 1):
    """对数据集进行近似化处理"""
    approxiamation_segments_containers: List[ApproximationSegmentsContainer] = []
    time_column = dataset_info.time_column
    value_columns = dataset_info.value_columns
    x = pd.to_datetime(dataset[time_column]).astype("int64") // 10**9

    for vc in value_columns:
        y = dataset[vc].values
        approxiamation_segments_container = bottom_up_merge(vc, x, y, k)
        approxiamation_segments_container = update_approximation_segments_container_with_angle(
            approxiamation_segments_container, dataset_info.column_ratio_dict[vc]
        )
        approxiamation_segments_containers.append(approxiamation_segments_container)

    return approxiamation_segments_containers


@typechecked
def calculate_segment_angle(ratio: float, segment: Segment):
    return np.arctan(segment.slope / ratio) / np.pi * 180


@typechecked
def update_approximation_segments_container_with_angle(approximation_segments_container: ApproximationSegmentsContainer, ratio: float):
    for approximation_segments in approximation_segments_container.approximation_segments_list:
        for segment in approximation_segments.segments:
            segment.angle = calculate_segment_angle(ratio, segment)
    return approximation_segments_container


if __name__ == "__main__":
    df = pd.read_csv("../portfolio_data.csv")
    dataset_info = DatasetInfo(time_column="Date", value_columns=["AMZN", "DPZ"], column_ratio_dict={"AMZN": 1, "DPZ": 1})
    approxiamation_segments_containers = approximate_dataset(df, dataset_info)
    print(approxiamation_segments_containers)
