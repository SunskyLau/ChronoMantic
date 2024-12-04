from typing import List
import numpy as np
from .scoring_functions import calculate_residual, scoring_r2


def generate_segments(x: np.ndarray, y: np.ndarray, k: int) -> List[int]:
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
