from typing import List, Tuple
import numpy as np
import pandas as pd
from .MyTypes import QuerySpec
from .scoring_functions import calculate_residual, scoring_r2


def generate_best_segments(x: np.ndarray, y: np.ndarray, k: int) -> List[int]:
    """
    使用动态规划找到最优的k段分割，分割点表示每段的最后一个点

    Parameters:
    -----------
    x: np.ndarray, 时间序列的x值
    y: np.ndarray, 时间序列的y值
    k: int, 目标段数

    d[i][j]:前0~i序列分成j段的最优得分

    Returns:
    --------
    List[int]: 分割点的索引列表，表示每段的最后一个点
    """
    n = len(x)

    def segment_residual(start: int, end: int) -> float:
        """计算某一段的R²分数"""
        if end - start < 1:  # 至少需要2个点才能计算R²
            return 0.0
        return calculate_residual(x[start : end + 1], y[start : end + 1])

    # dp[i][j]: 前0~i个点分成j段的最优得分
    dp = np.zeros((n + 1, k + 1)) + np.inf
    # prev[i][j]: 前0~i个点分成j段时，最后一段的起始位置
    prev = np.zeros((n + 1, k + 1), dtype=int)

    # 初始化：只有一段的情况
    dp[0][0] = 0
    for i in range(1, n):
        dp[i][1] = segment_residual(0, i)

    # 动态规划填表
    for j in range(2, k + 1):  # 段数: 2~k
        for i in range(j, n + 1):  # 当前位置: j~n
            for t in range(j - 1, i):  # 上一段的结束位置: j-1~i-1
                residual = dp[t][j - 1] + segment_residual(t, i)
                if residual < dp[i][j]:
                    dp[i][j] = residual
                    prev[i][j] = t

    # 回溯找到分割点（每段的最后一个点）
    segments = []
    pos = n - 1  # 从最后一个点开始
    for j in range(k, 1, -1):  # 段数从后往前遍历
        segments.append(prev[pos][j])
        pos = prev[pos][j]  # 更新位置

    return sorted(segments)


def query_by_real_world_frequence(unit: str, num: int) -> List[int]:
    """
    以真实世界的频率查询数据
    例如：查询每周的情况，unit='week', num=1
          每月的情况，unit='month', num=1
          每季度的情况，unit='quarter', num=1
          每年的情况，unit='year', num=1
          每小时的情况，unit='hour', num=1
          等等...
    """
    pass


def query_by_setting_sliding_window(window_size: int, step_size: int) -> List[int]:
    """
    以设置的滑动窗口查询数据
    window_size: 窗口大小
    step_size: 步长
    """
    pass


def generate_tobecalculated_fragments(querySpec: QuerySpec, time_stamps: List[str], values: np.ndarray) -> List[Tuple[int, int]]:
    """
    根据时间粒度生成待计算的片段

    Parameters:
    -----------
    querySpec: QuerySpec
        查询规范，包含时间粒度等信息
    time_stamps: List[str]
        时间戳列表
    values: np.ndarray
        对应的数值数组

    Returns:
    --------
    List[Tuple[int, int]]:
        片段的起止索引列表，每个元素为 (start_idx, end_idx)
    """
    # 将时间戳转换为datetime对象
    dates = pd.to_datetime(time_stamps)

    # 根据时间范围过滤
    mask = np.ones(len(dates), dtype=bool)
    if querySpec.start_time:
        mask &= dates >= querySpec.start_time
    if querySpec.end_time:
        mask &= dates <= querySpec.end_time

    dates = dates[mask]
    valid_indices = np.where(mask)[0]

    fragments = []
    time_granularity = querySpec.time_granularity

    if len(dates) == 0:
        return fragments

    if time_granularity == "day":
        # 按天分割，每天的数据作为一个片段
        current_day = dates[0].date()
        start_idx = valid_indices[0]

        for i, date in enumerate(dates[1:], 1):
            if date.date() != current_day:
                fragments.append((start_idx, valid_indices[i - 1]))
                start_idx = valid_indices[i]
                current_day = date.date()

        # 添加最后一个片段
        fragments.append((start_idx, valid_indices[-1]))

    elif time_granularity == "week":
        # 按周分割，使用ISO周
        current_week = dates[0].isocalendar()[1]
        current_year = dates[0].isocalendar()[0]
        start_idx = valid_indices[0]

        for i, date in enumerate(dates[1:], 1):
            week = date.isocalendar()[1]
            year = date.isocalendar()[0]

            if week != current_week or year != current_year:
                fragments.append((start_idx, valid_indices[i - 1]))
                start_idx = valid_indices[i]
                current_week = week
                current_year = year

        fragments.append((start_idx, valid_indices[-1]))

    elif time_granularity == "month":
        # 按月分割
        current_month = dates[0].month
        current_year = dates[0].year
        start_idx = valid_indices[0]

        for i, date in enumerate(dates[1:], 1):
            if date.month != current_month or date.year != current_year:
                fragments.append((start_idx, valid_indices[i - 1]))
                start_idx = valid_indices[i]
                current_month = date.month
                current_year = date.year

        fragments.append((start_idx, valid_indices[-1]))

    elif time_granularity == "quarter":
        # 按季度分割
        current_quarter = (dates[0].month - 1) // 3 + 1
        current_year = dates[0].year
        start_idx = valid_indices[0]

        for i, date in enumerate(dates[1:], 1):
            quarter = (date.month - 1) // 3 + 1
            year = date.year

            if quarter != current_quarter or year != current_year:
                fragments.append((start_idx, valid_indices[i - 1]))
                start_idx = valid_indices[i]
                current_quarter = quarter
                current_year = year

        fragments.append((start_idx, valid_indices[-1]))

    elif time_granularity == "year":
        # 按年分割
        current_year = dates[0].year
        start_idx = valid_indices[0]

        for i, date in enumerate(dates[1:], 1):
            if date.year != current_year:
                fragments.append((start_idx, valid_indices[i - 1]))
                start_idx = valid_indices[i]
                current_year = date.year

        fragments.append((start_idx, valid_indices[-1]))

    else:
        raise ValueError(f"Invalid time_granularity: {time_granularity}")

    return fragments
