from typing import List
from typeguard import typechecked
import numpy as np
import pandas as pd
from ..MyTypes_v1 import ApproximationSegmentsContainer, DatasetInfo
from .bottom_up import bottom_up_merge
from numpy.typing import NDArray


@typechecked
def approxiamate_dataset(dataset: pd.DataFrame, dataset_info: DatasetInfo, k: int = 1):
    approxiamation_segments_containers: List[ApproximationSegmentsContainer] = []
    time_column = dataset_info.time_column
    value_columns = dataset_info.value_columns
    x = pd.to_datetime(dataset[time_column]).astype("int64") // 10**9

    for vc in value_columns:
        y = dataset[vc].values
        approxiamation_segments_container = bottom_up_merge(vc, x, y, k)
        approxiamation_segments_containers.append(approxiamation_segments_container)

    return approxiamation_segments_containers
