import numpy as np
import heapq
import matplotlib.pyplot as plt
import pandas as pd


def segment_error(y, start, end):
    """计算线性拟合的均方误差"""
    if end - start <= 0:
        return 0, (0, y[start])

    # 线性拟合参数
    x1, y1 = start, y[start]
    x2, y2 = end, y[end]
    m = (y2 - y1) / (x2 - x1)
    b = y1 - m * x1

    # 计算误差
    x = np.arange(start, end + 1)
    y_pred = m * x + b
    y_actual = y[start : end + 1]
    error = np.mean((y_actual - y_pred) ** 2)

    return error, (m, b)


def bottom_up_merge(y, k):
    """自底向上分段合并"""
    n = len(y)
    if k >= n:
        return [[i] for i in range(n)]

    # 初始化段和代价队列
    segments = [(i, i + 1) for i in range(n - 1)]
    cost_heap = []

    def update_costs(i):
        """更新与索引i相关的合并代价"""
        if i < len(segments) - 1 and segments[i][1] == segments[i + 1][0]:
            error, _ = segment_error(y, segments[i][0], segments[i + 1][1])
            heapq.heappush(cost_heap, (error, segments[i], segments[i + 1]))

    # 初始化所有代价
    for i in range(len(segments) - 1):
        update_costs(i)

    # 合并过程
    while len(segments) > k:
        while cost_heap:
            # 弹出最小代价
            _, seg1, seg2 = heapq.heappop(cost_heap)
            # 检查段是否存在以及是否相邻
            if seg1 in segments and seg2 in segments and seg1[1] == seg2[0]:
                break
        else:
            # 重新计算所有代价
            cost_heap = []
            for i in range(len(segments) - 1):
                update_costs(i)
            continue

        # 合并相邻段
        i = segments.index(seg1)
        j = segments.index(seg2)
        segments[i] = (seg1[0], seg2[1])
        segments.pop(j)
        # 更新相邻段的代价
        if i > 0:
            update_costs(i - 1)
        if i < len(segments) - 1:
            update_costs(i)

    return [list(range(start, end + 1)) for start, end in segments]


def visualize_segments(y, segments):
    """可视化分段结果"""
    fig, ax = plt.subplots(figsize=(15, 8))
    ax.set_facecolor("white")
    fig.patch.set_facecolor("white")

    # 原始数据
    x = np.arange(len(y))
    ax.plot(x, y, color="gray", alpha=0.5, linewidth=1.5)

    # 分段拟合
    for seg in segments:
        start, end = seg[0], seg[-1]
        ax.plot([start, end], [y[start], y[end]], color="#2196F3", linewidth=2)

    # 设置样式
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    # 加载数据
    data = pd.read_csv("../portfolio_data.csv")
    y = data["AMZN"].values

    # 分段
    segments = bottom_up_merge(y, k=4)

    # 输出结果
    for i, seg in enumerate(segments, 1):
        error, _ = segment_error(y, seg[0], seg[-1])
        print(f"段 {i}: [{seg[0]}-{seg[-1]}], RMSE={error:.4f}")

    # 可视化
    visualize_segments(y, segments)
