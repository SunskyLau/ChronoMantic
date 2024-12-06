import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from typing import List
from app.model import get_best_segments


def generate_test_data(n_points: int = 100, noise_level: float = 0.1) -> tuple:
    """
    生成三段连续函数的测试数据

    三段函数定义：
    - x < 3: y = x
    - 3 <= x < 6: y = 2x - 3  (保证在x=3处连续)
    - x >= 6: y = 0.5x + 6    (保证在x=6处连续)
    """
    np.random.seed(42)
    x = np.linspace(0, 10, n_points)

    # 定义分段函数，确保在分段点处连续
    def piecewise_function(x):
        if x < 3:
            return x
        elif x < 6:
            return 2 * x - 3  # 在x=3处：3 = 2*3-3
        else:
            return 0.5 * x + 6  # 在x=6处：9 = 0.5*6+6

    # 向量化函数
    vfunc = np.vectorize(piecewise_function)
    y = vfunc(x) + np.random.normal(0, noise_level, x.shape)

    return x, y


def plot_segments(x: np.ndarray, y: np.ndarray, split_points: List[int]):
    """可视化分段结果"""
    plt.figure(figsize=(12, 6))

    # 绘制原始数据点
    plt.scatter(x, y, alpha=0.5, color="gray", label="Data points")

    # 准备分段点
    splits = [0] + split_points + [len(x) - 1]

    # 生成足够多的不同颜色
    num_segments = len(splits) - 1
    colors = plt.cm.rainbow(np.linspace(0, 1, num_segments))

    # 绘制每段的拟合直线
    for i in range(len(splits) - 1):
        start, end = splits[i], splits[i + 1] + 1
        x_seg = x[start:end]
        y_seg = y[start:end]

        # 拟合直线
        coeffs = np.polyfit(x_seg, y_seg, 1)
        y_fit = coeffs[0] * x_seg + coeffs[1]

        plt.plot(x_seg, y_fit, "-", color=colors[i], linewidth=2, label=f"Segment {i+1} (slope: {coeffs[0]:.2f})")
        plt.scatter(x_seg, y_seg, color=colors[i], alpha=0.6)

    # 标记分割点
    for split_point in split_points:
        plt.axvline(x=x[split_point], color="red", linestyle=":", alpha=0.5)
        plt.plot(x[split_point], y[split_point], "ro", markersize=10)

    plt.grid(True, alpha=0.3)
    plt.legend(bbox_to_anchor=(1.05, 1), loc="upper left")
    plt.title(f"Continuous Piecewise Linear Function Segmentation (k={len(splits)-1})")
    plt.xlabel("x")
    plt.ylabel("y")
    plt.tight_layout()

    return plt.gcf()


def plot_segments_simple(x: np.ndarray, y: np.ndarray, split_points: List[int]):
    """
    简化的可视化分段结果函数，只连接每段的首尾点
    """
    plt.figure(figsize=(12, 6))

    # 绘制原始数据点
    plt.scatter(x, y, alpha=0.5, color="gray", label="Data points")

    # 准备分段点
    splits = [0] + split_points + [len(x) - 1]

    # 生成颜色
    num_segments = len(splits) - 1
    colors = plt.cm.rainbow(np.linspace(0, 1, num_segments))

    # 绘制每段的直线
    for i in range(len(splits) - 1):
        start, end = splits[i], splits[i + 1] + 1
        # 只取首尾两个点
        x_seg = [x[start], x[end - 1]]
        y_seg = [y[start], y[end - 1]]

        # 计算斜率
        slope = (y_seg[1] - y_seg[0]) / (x_seg[1] - x_seg[0]) if x_seg[1] != x_seg[0] else float("inf")

        # 绘制直线
        plt.plot(x_seg, y_seg, "-", color=colors[i], linewidth=2, label=f"Segment {i+1} (slope: {slope:.2f})")

    # 标记分割点
    for split_point in split_points:
        plt.axvline(x=x[split_point], color="red", linestyle=":", alpha=0.5)
        plt.plot(x[split_point], y[split_point], "ro", markersize=10)

    plt.grid(True, alpha=0.3)
    plt.legend(bbox_to_anchor=(1.05, 1), loc="upper left")
    plt.title(f"Piecewise Linear Segmentation (k={len(splits)-1})")
    plt.xlabel("x")
    plt.ylabel("y")
    plt.tight_layout()

    return plt.gcf()


# # 生成测试数据
# x, y = generate_test_data(n_points=100, noise_level=0.1)

# # 寻找最优分割
# k = 3
# split_points = generate_segments(x, y, k)
# print(f"Split points (indices): {split_points}")
# print(f"Split points (x values): {[f'{xi:.2f}' for xi in x[split_points]]}")

# # 可视化结果
# fig = plot_segments(x, y, split_points)
# plt.show()


if __name__ == "__main__":
    csv_path = "../portfolio_data.csv"
    df = pd.read_csv(csv_path)["AMZN"][0:200]
    x = np.arange(len(df))
    y = df.values

    # 寻找最优分割
    k = 10
    split_points = get_best_segments(x, y, k)
    print(f"Split points (indices): {split_points}")
    print(f"Split points (x values): {[f'{xi:.2f}' for xi in x[split_points]]}")

    # 可视化结果
    # fig = plot_segments(x, y, split_points)
    fig = plot_segments_simple(x, y, split_points)
    plt.show()
