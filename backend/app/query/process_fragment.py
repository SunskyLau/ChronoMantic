from typing import List, Tuple
import numpy as np
import pandas as pd
from app.query.MyTypes import Fragment, FragmentList, QuerySpec, Segment, TrendConfig
from app.model import get_best_segments
from app.config import Config


def generate_fragments_by_time_granularity(
    time_granularity: str, csv_name: str, time_column_name: str, value_column_name: str, start_time: float | None = None, end_time: float | None = None
) -> FragmentList:
    """
    根据时间粒度生成待计算的片段

    Parameters:
    -----------
    time_stamps: List[str]
        时间戳列表
    time_granularity: str
        时间粒度
    start_time: float | None
        起始时间
    end_time: float | None
        结束时间

    Returns:
    --------
    List[Tuple[int, int]]:
        片段的起止索引列表，每个元素为 (start_idx, end_idx)
    """
    df = pd.read_csv(Config.UPLOAD_FOLDER + csv_name)
    # 将时间戳转换为datetime对象
    time_stamps = df[time_column_name]
    dates = pd.to_datetime(time_stamps)

    # 根据时间范围过滤
    mask = np.ones(len(dates), dtype=bool)
    if start_time:
        mask &= dates >= start_time
    if end_time:
        mask &= dates <= end_time

    dates = dates[mask]
    valid_indices = np.where(mask)[0]

    fragment_list = FragmentList(csv_name=csv_name, value_column_name=value_column_name, time_column_name=time_column_name, fragments=[])
    time_granularity = time_granularity

    if len(dates) == 0:
        return fragment_list

    if time_granularity == "day":
        # 按天分割，每天的数据作为一个片段
        current_day = dates[0].date()
        start_idx = valid_indices[0]

        for i, date in enumerate(dates[1:], 1):
            if date.date() != current_day:
                # fragment_list.fragments.append((start_idx, valid_indices[i - 1]))
                fragment_list.fragments.append(Fragment(start_idx=start_idx, end_idx=valid_indices[i - 1], segments=[]))
                start_idx = valid_indices[i]
                current_day = date.date()

        # 添加最后一个片段
        # fragment_list.fragments.append((start_idx, valid_indices[-1]))
        fragment_list.fragments.append(Fragment(start_idx=start_idx, end_idx=valid_indices[-1], segments=[]))

    elif time_granularity == "week":
        # 按周分割，使用ISO周
        current_week = dates[0].isocalendar()[1]
        current_year = dates[0].isocalendar()[0]
        start_idx = valid_indices[0]

        for i, date in enumerate(dates[1:], 1):
            week = date.isocalendar()[1]
            year = date.isocalendar()[0]

            if week != current_week or year != current_year:
                # fragment_list.fragments.append((start_idx, valid_indices[i - 1]))
                fragment_list.fragments.append(Fragment(start_idx=start_idx, end_idx=valid_indices[i - 1], segments=[]))
                start_idx = valid_indices[i]
                current_week = week
                current_year = year

        # fragment_list.fragments.append((start_idx, valid_indices[-1]))
        fragment_list.fragments.append(Fragment(start_idx=start_idx, end_idx=valid_indices[-1], segments=[]))

    elif time_granularity == "month":
        # 按月分割
        current_month = dates[0].month
        current_year = dates[0].year
        start_idx = valid_indices[0]

        for i, date in enumerate(dates[1:], 1):
            if date.month != current_month or date.year != current_year:
                # fragment_list.fragments.append((start_idx, valid_indices[i - 1]))
                fragment_list.fragments.append(Fragment(start_idx=start_idx, end_idx=valid_indices[i - 1], segments=[]))
                start_idx = valid_indices[i]
                current_month = date.month
                current_year = date.year

        # fragment_list.fragments.append((start_idx, valid_indices[-1]))
        fragment_list.fragments.append(Fragment(start_idx=start_idx, end_idx=valid_indices[-1], segments=[]))

    elif time_granularity == "quarter":
        # 按季度分割
        current_quarter = (dates[0].month - 1) // 3 + 1
        current_year = dates[0].year
        start_idx = valid_indices[0]

        for i, date in enumerate(dates[1:], 1):
            quarter = (date.month - 1) // 3 + 1
            year = date.year

            if quarter != current_quarter or year != current_year:
                # fragment_list.fragments.append((start_idx, valid_indices[i - 1]))
                fragment_list.fragments.append(Fragment(start_idx=start_idx, end_idx=valid_indices[i - 1], segments=[]))
                start_idx = valid_indices[i]
                current_quarter = quarter
                current_year = year

        # fragment_list.fragments.append((start_idx, valid_indices[-1]))
        fragment_list.fragments.append(Fragment(start_idx=start_idx, end_idx=valid_indices[-1], segments=[]))

    elif time_granularity == "year":
        # 按年分割
        current_year = dates[0].year
        start_idx = valid_indices[0]

        for i, date in enumerate(dates[1:], 1):
            if date.year != current_year:
                # fragment_list.fragments.append((start_idx, valid_indices[i - 1]))
                fragment_list.fragments.append(Fragment(start_idx=start_idx, end_idx=valid_indices[i - 1], segments=[]))

                start_idx = valid_indices[i]
                current_year = date.year

        # fragment_list.fragments.append((start_idx, valid_indices[-1]))
        fragment_list.fragments.append(Fragment(start_idx=start_idx, end_idx=valid_indices[-1], segments=[]))

    else:
        raise ValueError(f"Invalid time_granularity: {time_granularity}")

    return fragment_list


def generate_fragments_by_query(fragment_list: FragmentList, querySpec: QuerySpec) -> FragmentList:
    csv_name = fragment_list.csv_name
    value_column_name = fragment_list.value_column_name
    time_column_name = fragment_list.time_column_name
    result_fragment_list = FragmentList(csv_name=csv_name, value_column_name=value_column_name, time_column_name=time_column_name, fragments=[])
    segments_length = len(querySpec.patterns)
    print("segments_length:", segments_length)
    df = pd.read_csv(Config.UPLOAD_FOLDER + csv_name)
    x = (pd.to_datetime(df[time_column_name]).astype(np.int64) // 10**9).values
    y = df[value_column_name].values

    for fragment in fragment_list.fragments:
        start_idx = fragment.start_idx
        end_idx = fragment.end_idx
        time_stamp = x[start_idx : end_idx + 1]
        values = y[start_idx : end_idx + 1]
        segment_index_array = get_best_segments(time_stamp, values, segments_length)
        # print("segment_index_array:", segment_index_array)
        segments = []
        old_end = start_idx
        for segment_index in segment_index_array:
            segment_start_idx = old_end
            segment_end_idx = start_idx + segment_index

            # 计算斜率
            dy = y[segment_end_idx] - y[segment_start_idx]
            dx = x[segment_end_idx] - x[segment_start_idx]
            slope = dy / dx

            segment = Segment(start_idx=segment_start_idx, end_idx=segment_end_idx, slope=slope, theta=None, trend=None, extent=None)
            segments.append(segment)
            old_end = segment_end_idx
        # 计算并添加最后一个片段
        dy = y[end_idx] - y[old_end]
        dx = x[end_idx] - x[old_end]
        slope = dy / dx
        segments.append(Segment(start_idx=old_end, end_idx=end_idx, slope=slope, theta=None, trend=None, extent=None))

        fragment = Fragment(start_idx=start_idx, end_idx=end_idx, segments=segments)
        result_fragment_list.fragments.append(fragment)
    return result_fragment_list


def calculate_segment_theta(segment: Segment, ratio: float) -> float:
    # print("segment.slope:", segment.slope)
    visual_slope = segment.slope / ratio
    return np.arctan(visual_slope)


def calculate_fragment_theta(fragment: Fragment, ratio: float) -> Fragment:
    for segment in fragment.segments:
        segment.theta = calculate_segment_theta(segment, ratio)
    return fragment


def determine_trends(fragment: Fragment, trendConfig: TrendConfig) -> Fragment:
    for segment in fragment.segments:
        if segment.slope == 0:
            segment.trend = "flat"
        elif segment.slope > 0:
            if segment.theta <= trendConfig.flat_threshold:
                segment.trend = "flat"
            elif segment.theta <= trendConfig.weak_threshold:
                segment.trend = "up"
                segment.extent = "weak"
            elif segment.theta <= trendConfig.strong_threshold:
                segment.trend = "up"
                segment.extent = "moderate"
            else:
                segment.trend = "up"
                segment.extent = "strong"
        else:
            if segment.theta >= -trendConfig.flat_threshold:
                segment.trend = "flat"
            elif segment.theta >= -trendConfig.weak_threshold:
                segment.trend = "down"
                segment.extent = "weak"
            elif segment.theta >= -trendConfig.strong_threshold:
                segment.trend = "down"
                segment.extent = "moderate"
            else:
                segment.trend = "down"
                segment.extent = "strong"
    return fragment
