from typing import List, Tuple
import numpy as np
import pandas as pd
from scipy.signal import find_peaks
import matplotlib.pyplot as plt
from app.query_v0.fuzzy_time_query.config import Config
from ...MyTypes import Segment


def generate_segments(x: np.ndarray, y: np.ndarray) -> List[Segment]:
    segment_idx_array = generate_segment_idx_array(y)
    segments: List[Segment] = []

    for segment_idx in segment_idx_array:
        start_idx, end_idx = segment_idx

        # 获取当前段的x和y值
        x_segment = x[start_idx : end_idx + 1]
        y_segment = y[start_idx : end_idx + 1]

        # 计算斜率和截距
        dy = y[end_idx] - y[start_idx]
        dx = x[end_idx] - x[start_idx]
        slope = dy / dx if dx != 0 else 0
        b = y[start_idx] - slope * x[start_idx]

        # 计算预测值
        y_pred = slope * x_segment + b

        # 计算R²
        y_mean = np.mean(y_segment)
        ss_tot = np.sum((y_segment - y_mean) ** 2)  # 总平方和
        ss_res = np.sum((y_segment - y_pred) ** 2)  # 残差平方和
        r2 = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0

        # 计算误差和
        sum_loss = np.sum(np.abs(y_segment - y_pred))

        segments.append(
            Segment(start_idx=start_idx, end_idx=end_idx, slope=slope, trend="up" if slope > 0 else "down", sum_loss=sum_loss, r2=r2)  # 如果Segment类支持r2属性
        )

    segments = prune_segments(segments)
    print(f"Pruned segments: {len(segments)}")
    # for segment in segments:
    #     print(segment)
    return segments


def prune_segments(segments: List[Segment]) -> List[Segment]:
    new_segments = []
    for segment in segments:
        if segment.r2 > Config.R2_THRESHOLD:
            new_segments.append(segment)
    return new_segments


def generate_segment_idx_array(y: np.ndarray) -> List[Tuple[int, int]]:
    extrema_based_boundaries = extrema_based_segmentation(y)
    boundaries = np.concatenate([extrema_based_boundaries, [0, len(y) - 1]])

    segments = []

    for i in range(len(boundaries) - 1):
        for j in range(i + 1, len(boundaries)):
            segments.append((boundaries[i], boundaries[j]))

    print(f"Total segments: {len(segments)}")
    return segments


def extrema_based_segmentation(y: np.ndarray) -> np.ndarray:
    """
    基于极值点的分段方法
    """
    # 计算振幅
    amplitude = np.max(y) - np.min(y)
    # 寻找局部最大值点
    peaks, _ = find_peaks(y, prominence=amplitude * Config.PROMINENCE_FACTOR)
    # 寻找局部最小值点
    valleys, _ = find_peaks(-y, prominence=amplitude * Config.PROMINENCE_FACTOR)
    # 合并并排序所有极值点
    all_extrema = np.sort(np.concatenate([peaks, valleys]))
    print(f"Detected extrema: {len(all_extrema)}")
    return all_extrema


if __name__ == "__main__":
    # 读取数据
    df = pd.read_csv("../portfolio_data.csv")["AMZN"]
    y = df.values
    x = np.arange(len(y))

    # 获取极值点
    extrema_idx = extrema_based_segmentation(y)
    segment_idx_array = generate_segment_idx_array(y)
    segments = generate_segments(x, y)
    # 绘图
    plt.figure(figsize=(15, 6))

    # 绘制原始数据
    plt.plot(x, y, "b-", label="AMZN Price")

    # 绘制极值点
    plt.plot(extrema_idx, y[extrema_idx], "ro", label="Extrema Points")

    plt.title("AMZN Price with Extrema Points")
    plt.xlabel("Time")
    plt.ylabel("Price")
    plt.legend()
    plt.grid(True)

    # 打印一些统计信息
    print(f"总数据点数: {len(y)}")
    print(f"检测到的极值点数: {len(extrema_idx)}")
    print(f"极值点占总数据点的比例: {len(extrema_idx)/len(y)*100:.2f}%")

    plt.show()
