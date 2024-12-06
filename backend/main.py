import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime
from app.query.MyTypes import QuerySpec, ValueCondition
from app.model import get_best_segments, get_best_segments_optimized
from app.query.process_fragment import get_tobecalculated_fragments

# 读取数据
data = pd.read_csv("../portfolio_data.csv")

# 创建查询规范
querySpec = QuerySpec(
    value_column_name="AMZN",
    time_stamp_column_name="Date",
    trends=["up", "down", "flat"],
    y_max_condition=ValueCondition(comparator=">", value=100),
    y_min_condition=ValueCondition(comparator="<", value=10),
    time_granularity="year",
    start_time=None,
    end_time=None,
)

# 根据频率得到片段
fragments = get_tobecalculated_fragments(querySpec, data["Date"], data["AMZN"])
print(f"Total fragments: {len(fragments)}")


def visualize_fragments(data, fragments, num_samples=5):
    """
    可视化选定的几个片段

    Parameters:
    -----------
    data: pd.DataFrame
        包含Date和AMZN列的数据
    fragments: List[Tuple[int, int]]
        片段的起止索引列表
    num_samples: int
        要可视化的片段数量
    """
    # 转换日期格式
    dates = pd.to_datetime(data["Date"])
    values = data["AMZN"].values

    # 随机选择片段
    if len(fragments) > num_samples:
        selected_indices = np.random.choice(len(fragments), num_samples, replace=False)
        selected_fragments = [fragments[i] for i in selected_indices]
    else:
        selected_fragments = fragments
        num_samples = len(fragments)

    # 创建子图
    fig, axes = plt.subplots(num_samples, 1, figsize=(15, 4 * num_samples))
    if num_samples == 1:
        axes = [axes]

    # 绘制每个片段
    for ax, (start_idx, end_idx) in zip(axes, selected_fragments):
        fragment_dates = dates[start_idx : end_idx + 1]
        fragment_values = values[start_idx : end_idx + 1]

        ax.plot(fragment_dates, fragment_values, "-o", markersize=4)

        # 设置标题和标签
        ax.set_title(f"Fragment {start_idx}:{end_idx}\n" f'({fragment_dates.min().strftime("%Y-%m-%d")} to ' f'{fragment_dates.max().strftime("%Y-%m-%d")})')
        ax.grid(True)

        # 格式化x轴日期
        ax.tick_params(axis="x", rotation=45)

        # 添加y轴标签
        ax.set_ylabel("AMZN Price")

    plt.tight_layout()
    plt.show()


# 可视化方式1：随机选择5个片段
# visualize_fragments(data, fragments)

# 可视化方式2：查看前5个片段
# selected_fragments = fragments[:5]
# visualize_fragments(data, selected_fragments)

# 可视化方式3：均匀选择5个片段
# step = max(len(fragments) // 5, 1)
# selected_fragments = fragments[::step][:5]
# visualize_fragments(data, selected_fragments)

import time

start_time = time.time()

for fragment in fragments:
    start_idx, end_idx = fragment
    # fragment_dates = data["Date"][start_idx : end_idx + 1]
    fragment_values = data["AMZN"][start_idx : end_idx + 1]
    x = np.arange(len(fragment_values))
    # print(f"Fragment {start_idx}:{end_idx} ({fragment_dates.min()} to {fragment_dates.max()}): {fragment_values.values}")
    get_best_segments(x, fragment_values.values, 8)
    # get_best_segments_optimized(x, fragment_values.values, 8)

end_time = time.time()
print(f"执行时长: {end_time - start_time:.2f} 秒")
