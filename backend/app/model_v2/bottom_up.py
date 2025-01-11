import time
from typing import List, Tuple
import numpy as np
import heapq
import matplotlib.pyplot as plt
import pandas as pd
from ..MyTypes_v1 import Segment


def segment_error(x: np.ndarray, y: np.ndarray, start: int, end: int) -> float:
    """计算线性拟合的平方误差和"""
    # 确保段长度大于0
    if end - start <= 0:
        raise ValueError("段长度必须大于0")

    # 线性拟合参数
    x1, y1 = x[start], y[start]
    x2, y2 = x[end], y[end]
    m = (y2 - y1) / (x2 - x1)
    b = y1 - m * x1

    # 计算误差
    x_seg = x[start : end + 1]
    y_pred = m * x_seg + b
    y_actual = y[start : end + 1]
    sum_error = np.sum((y_actual - y_pred) ** 2)

    return sum_error


def calculate_merge_cost(x: np.ndarray, y: np.ndarray, segment1: Tuple[int, int], segment2: Tuple[int, int]):
    """计算合并两段的代价"""
    start1, end1 = segment1
    start2, end2 = segment2

    # 计算合并后的误差
    error = segment_error(x, y, start1, end2)

    # 计算合并前的误差
    error1 = segment_error(x, y, start1, end1)
    error2 = segment_error(x, y, start2, end2)

    return error - (error1 + error2)


def bottom_up_merge(x: np.ndarray, y: np.ndarray, k: int):
    """自底向上分段合并"""
    n = len(y)
    if k >= n:
        return [[i] for i in range(n)]

    # 初始化段数组和代价优先队列
    segments = [(i, i + 1) for i in range(n - 1)]
    cost_heap = []

    def update_costs(i):
        """更新与索引i相关的合并代价"""
        if i < len(segments) - 1 and segments[i][1] == segments[i + 1][0]:
            cost = calculate_merge_cost(x, y, segments[i], segments[i + 1])
            heapq.heappush(cost_heap, (cost, segments[i], segments[i + 1]))

    # 初始化所有代价
    for i in range(len(segments) - 1):
        update_costs(i)

    # 合并过程
    while len(segments) > k:
        while cost_heap:
            # 弹出最小代价
            _, seg1, seg2 = heapq.heappop(cost_heap)
            # 检查段是否存在以及是否相邻,时间复杂度是O(n),可以优化
            if seg1 in segments and seg2 in segments and seg1[1] == seg2[0]:
                break
        else:
            # 重新计算所有代价
            cost_heap = []
            for i in range(len(segments) - 1):
                update_costs(i)
            continue

        # 合并相邻段
        # 找索引是O(n)的,可以优化
        i = segments.index(seg1)
        j = segments.index(seg2)
        segments[i] = (seg1[0], seg2[1])
        segments.pop(j)

        # 更新相邻段的代价
        if i > 0:
            update_costs(i - 1)
        if i < len(segments) - 1:
            update_costs(i)

    segments_idx_array = [(start, end) for start, end in segments]
    sorted_segments_idx_array = sorted(segments_idx_array, key=lambda x: x[0])
    segments = [Segment(start_idx=start, end_idx=end, slope=(y[end] - y[start]) / (x[end] - x[start])) for start, end in sorted_segments_idx_array]
    return segments


def visualize_segments(y, segments: List[Segment]):
    """可视化分段结果"""
    fig, ax = plt.subplots(figsize=(15, 8))
    ax.set_facecolor("white")
    fig.patch.set_facecolor("white")

    # 原始数据
    x = np.arange(len(y))
    ax.plot(x, y, color="gray", alpha=0.5, linewidth=1.5)

    # 分段拟合
    for seg in segments:
        start, end = seg.start_idx, seg.end_idx
        ax.plot([start, end], [y[start], y[end]], color="#2196F3", linewidth=2)

    # 设置样式
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    # 加载数据
    data = pd.read_csv("../portfolio_data.csv")
    x = data["AMZN"].index
    y = data["AMZN"].values

    # 分段
    start_time = time.time()
    segments = bottom_up_merge(x, y, k=22)
    for seg in segments:
        print(seg)
    print(f"耗时: {time.time() - start_time:.4f} 秒")

    # 输出结果
    for i, seg in enumerate(segments, 1):
        error = segment_error(x, y, seg.start_idx, seg.end_idx)
        print(f"段 {i}: [{seg.start_idx}-{seg.end_idx}], 平方误差和={error:.4f}")

    # 可视化
    visualize_segments(y, segments)
