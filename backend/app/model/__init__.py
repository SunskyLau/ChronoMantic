from typing import List
import numpy as np
from .scoring_functions import calculate_residual_by_fit, calculate_residual_by_linkPoints


def get_best_segments_optimized(x: np.ndarray, y: np.ndarray, k: int) -> List[int]:
    n = len(x)

    # 预计算所有可能区间的residual值
    residuals = np.zeros((n, n))
    for i in range(n):
        for j in range(i + 1, n):
            residuals[i][j] = calculate_residual_by_fit(x[i : j + 1], y[i : j + 1])

    # dp[i][j]: 前i个点分成j段的最优得分
    dp = np.zeros((n, k + 1)) + np.inf
    prev = np.zeros((n, k + 1), dtype=int)
    # opt[i][j]: dp[i][j]取得最优值时的分割点
    opt = np.zeros((n, k + 1), dtype=int)

    # 初始化：一段的情况
    for i in range(n):
        dp[i][1] = residuals[0][i]
        opt[i][1] = 0

    # 动态规划
    for j in range(2, k + 1):  # 段数
        # 初始化第j段的最左可能位置
        opt[j - 1][j] = j - 2

        for i in range(j - 1, n):  # 当前结束位置
            # 确定最优决策点的范围
            left = opt[i][j - 1] if i > j - 1 else j - 2
            right = opt[i + 1][j] if i < n - 1 else i - 1

            # 在缩小的范围内搜索最优决策点
            dp[i][j] = float("inf")
            for t in range(left, min(right + 1, i)):
                cost = dp[t][j - 1] + residuals[t + 1][i]
                if cost < dp[i][j]:
                    dp[i][j] = cost
                    prev[i][j] = t
                    opt[i][j] = t

    # 回溯找分割点
    segments = []
    pos = n - 1
    for j in range(k, 1, -1):
        segments.append(prev[pos][j])
        pos = prev[pos][j]

    return sorted(segments)


def get_best_segments(x: np.ndarray, y: np.ndarray, k: int) -> List[int]:
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

    # 预计算所有可能区间的residual值
    residuals = np.zeros((n, n))
    for i in range(n):
        for j in range(i + 1, n):
            residuals[i][j] = calculate_residual_by_linkPoints(x[i : j + 1], y[i : j + 1])
            # residuals[i][j] = calculate_residual_by_fit(x[i : j + 1], y[i : j + 1])

    # dp[i][j]: 前i个点分成j段的最优得分
    dp = np.zeros((n, k + 1)) + np.inf
    prev = np.zeros((n, k + 1), dtype=int)

    # 初始化：一段的情况
    for i in range(n):
        dp[i][1] = residuals[0][i]

    # 动态规划
    for j in range(2, k + 1):  # 段数
        for i in range(j - 1, n):  # 当前结束位置
            for t in range(j - 2, i):  # 上一段结束位置
                cost = dp[t][j - 1] + residuals[t + 1][i]
                if cost < dp[i][j]:
                    dp[i][j] = cost
                    prev[i][j] = t

    # 回溯找分割点
    segments = []
    pos = n - 1
    for j in range(k, 1, -1):
        segments.append(prev[pos][j])
        pos = prev[pos][j]

    return sorted(segments)
