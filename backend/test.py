import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from typing import List


def calculate_residual(x: np.ndarray, y: np.ndarray) -> float:
    """
    计算残差
    """
    coeffs = np.polyfit(x, y, 1)
    k = coeffs[0]  # 斜率
    b = coeffs[1]  # 截距

    # 计算拟合值
    y_fit = k * x + b

    # 计算残差
    residual = np.sum(np.abs(y - y_fit))

    return residual


def scoring_r2(x: np.ndarray, y: np.ndarray) -> float:
    """
    计算数据的R²评分

    Parameters:
    -----------
    x: np.ndarray, x值
    y: np.ndarray, y值

    Returns:
    --------
    float: R²评分
    """
    # 拟合直线
    coeffs = np.polyfit(x, y, 1)
    k = coeffs[0]  # 斜率
    b = coeffs[1]  # 截距

    # 计算拟合值
    y_fit = k * x + b

    # 计算R2
    y_mean = np.mean(y)
    ss_tot = np.sum((y - y_mean) ** 2)
    ss_res = np.sum((y - y_fit) ** 2)
    r2 = 1 - (ss_res / ss_tot)

    return r2


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


import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from typing import List


def calculate_residual(x: np.ndarray, y: np.ndarray) -> float:
    """
    计算残差
    """
    coeffs = np.polyfit(x, y, 1)
    k = coeffs[0]  # 斜率
    b = coeffs[1]  # 截距

    # 计算拟合值
    y_fit = k * x + b

    # 计算残差
    residual = np.sum(np.abs(y - y_fit))

    return residual


def scoring_r2(x: np.ndarray, y: np.ndarray) -> float:
    """
    计算数据的R²评分

    Parameters:
    -----------
    x: np.ndarray, x值
    y: np.ndarray, y值

    Returns:
    --------
    float: R²评分
    """
    # 拟合直线
    coeffs = np.polyfit(x, y, 1)
    k = coeffs[0]  # 斜率
    b = coeffs[1]  # 截距

    # 计算拟合值
    y_fit = k * x + b

    # 计算R2
    y_mean = np.mean(y)
    ss_tot = np.sum((y - y_mean) ** 2)
    ss_res = np.sum((y - y_fit) ** 2)
    r2 = 1 - (ss_res / ss_tot)

    return r2


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
    df = pd.read_csv(csv_path)["AMZN"][0:1000]
    x = np.arange(len(df))
    y = df.values
    # 寻找最优分割
    k = 3
    split_points = generate_segments(x, y, k)
    print(f"Split points (indices): {split_points}")
    print(f"Split points (x values): {[f'{xi:.2f}' for xi in x[split_points]]}")

    # 可视化结果
    fig = plot_segments(x, y, split_points)
    plt.show()
