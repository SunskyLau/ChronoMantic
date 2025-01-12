from dataclasses import dataclass
import time
from typing import List
import numpy as np
import heapq
import matplotlib.pyplot as plt
import pandas as pd
from ..MyTypes_v1 import ApproximationSegments, ApproximationSegmentsContainer, DatasetInfo, Segment


@dataclass
class CostWrapper:
    cost: float
    seg1: Segment
    seg2: Segment

    def __lt__(self, other):
        """仅根据 cost 进行比较，避免比较 Segment 对象"""
        return self.cost < other.cost


def segment_error(x: np.ndarray, y: np.ndarray, start: int, end: int) -> float:
    """计算线性拟合的平方误差和"""
    if end - start <= 0:
        raise ValueError("段长度必须大于0")

    x1, y1 = x[start], y[start]
    x2, y2 = x[end], y[end]
    m = (y2 - y1) / (x2 - x1)
    b = y1 - m * x1

    x_seg = x[start : end + 1]
    y_pred = m * x_seg + b
    y_actual = y[start : end + 1]
    sum_error = np.sum((y_actual - y_pred) ** 2)

    return sum_error


def calculate_merge_cost(x: np.ndarray, y: np.ndarray, segment1: Segment, segment2: Segment):
    """计算合并两段的代价"""
    start1, end1 = segment1.start_idx, segment1.end_idx
    start2, end2 = segment2.start_idx, segment2.end_idx

    error = segment_error(x, y, start1, end2)
    error1 = segment_error(x, y, start1, end1)
    error2 = segment_error(x, y, start2, end2)

    return error - (error1 + error2)


def bottom_up_merge(value_column: str, x: np.ndarray, y: np.ndarray, k: int):
    """自底向上分段合并"""
    n = len(y)
    if k >= n:
        return [[i] for i in range(n)]

    segments: List[Segment] = [Segment(start_idx=i, end_idx=i + 1, slope=(y[i + 1] - y[i]) / (x[i + 1] - x[i])) for i in range(n - 1)]
    cost_heap: List[CostWrapper] = []

    def update_costs(i: int):
        """更新与索引i相关的合并代价"""
        if i < len(segments) - 1 and segments[i].end_idx == segments[i + 1].start_idx:
            cost = calculate_merge_cost(x, y, segments[i], segments[i + 1])
            heapq.heappush(cost_heap, CostWrapper(cost, segments[i], segments[i + 1]))

    for i in range(len(segments) - 1):
        update_costs(i)

    approximation_segments_list: List[ApproximationSegments] = [ApproximationSegments(segments=segments.copy(), approximation_level=0)]
    current_segments_length = len(segments)
    current_level = 0

    while len(segments) > k:
        while cost_heap:
            wrapper = heapq.heappop(cost_heap)
            seg1, seg2 = wrapper.seg1, wrapper.seg2
            if seg1 in segments and seg2 in segments and seg1.end_idx == seg2.start_idx:
                break
        else:
            cost_heap: List[CostWrapper] = []
            for i in range(len(segments) - 1):
                update_costs(i)
            continue

        i = segments.index(seg1)
        j = segments.index(seg2)
        segments[i] = Segment(
            start_idx=seg1.start_idx, end_idx=seg2.end_idx, slope=(y[seg2.end_idx] - y[seg1.start_idx]) / (x[seg2.end_idx] - x[seg1.start_idx])
        )
        segments.pop(j)

        if len(segments) == current_segments_length // 2:
            current_level += 1
            approximation_segments_list.append(ApproximationSegments(segments=segments.copy(), approximation_level=current_level))
            current_segments_length = len(segments)

        if i > 0:
            update_costs(i - 1)
        if i < len(segments) - 1:
            update_costs(i)

    approximation_segments_container = ApproximationSegmentsContainer(
        source=value_column, approximation_segments_list=approximation_segments_list, max_approximation_level=current_level
    )

    return approximation_segments_container


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
    approximation_segments_container = bottom_up_merge("AMZN", x, y, k=1)
    print(f"耗时: {time.time() - start_time:.4f} 秒")

    for approximation_segments in approximation_segments_container.approximation_segments_list:
        print(len(approximation_segments.segments))
    # print(approximation_segments_container.max_approximation_level)
    # for seg in segments:
    #     print(seg)
    # print(f"耗时: {time.time() - start_time:.4f} 秒")

    # # 输出结果
    # for i, seg in enumerate(segments, 1):
    #     error = segment_error(x, y, seg.start_idx, seg.end_idx)
    #     print(f"段 {i}: [{seg.start_idx}-{seg.end_idx}], 平方误差和={error:.4f}")

    # # 可视化
    # visualize_segments(y, segments)
