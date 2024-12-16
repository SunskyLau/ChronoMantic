import numpy as np
import pandas as pd
from app.query.fuzzy_time_query.generate_segments import generate_segments
from ..MyTypes import Fragment, FragmentList, Pattern, QuerySpec, Segment
from typing import Dict, List


def build_followedby_index(segments: List[Segment]) -> Dict[int, List[Segment]]:
    followed_by_indexes: Dict[int, List[Segment]] = {}
    for segment in segments:
        if segment.start_idx not in followed_by_indexes:
            followed_by_indexes[segment.start_idx] = []
        followed_by_indexes[segment.start_idx].append(segment)
    return followed_by_indexes


def match(segment: Segment, pattern: Pattern):
    if pattern.trend is not None and segment.trend != pattern.trend:
        return False
    if pattern.extent is not None and segment.extent != pattern.extent:
        return False
    return True


def calculate_avg_loss(segments: List[Segment]) -> float:
    return sum([segment.sum_loss for segment in segments]) / (segments[-1].end_idx - segments[0].start_idx + 1)


def prune_result(result: FragmentList, overlap_threshold=0.5):
    def calculate_overlap_ratio(result1: Fragment, result2: Fragment) -> float:
        """计算两个连续result序列的重叠比例"""
        # 由于fragments连续，直接使用开头和结尾
        span1 = result1.segments[-1].end_idx - result1.segments[0].start_idx
        span2 = result2.segments[-1].end_idx - result2.segments[0].start_idx

        overlap = min(result1.segments[-1].end_idx, result2.segments[-1].end_idx) - max(result1.segments[0].start_idx, result2.segments[0].start_idx)
        if overlap <= 0:
            return 0.0

        return max(overlap / span1, overlap / span2)

    """根据某种指标优先保留结果，防止过度重叠"""
    candidates = result.fragments
    if not candidates:
        return []

    # 根据平均损失升序排序
    sorted_candidates = sorted(candidates, key=lambda x: x.avg_loss, reverse=False)

    # 初始化结果列表，保存(候选结果, 得分)对
    kept_results = [sorted_candidates[0]]

    # 检查重叠并保留符合条件的结果
    for candidate in sorted_candidates[1:]:
        if not any(calculate_overlap_ratio(candidate, kept) > overlap_threshold for kept in kept_results):
            kept_results.append(candidate)
            # print("candidate", candidate)

    # 只返回结果列表，不返回得分
    return kept_results


def query(x: np.ndarray, y: np.ndarray, querySpec: QuerySpec):
    """
    根据查询规范生成分段列表

    Parameters:
    -----------
    x: np.ndarray, 时间序列的x值
    y: np.ndarray, 时间序列的y值
    querySpec: QuerySpec, 查询规范

    Returns:
    --------
    FragmentList: 分段列表
    """

    # 计算分段特征
    segments = generate_segments(x, y)
    # segments = prune_segments(segments)
    followed_by_indexes = build_followedby_index(segments)
    result = FragmentList(csv_name="test.csv", value_column_name="value", time_column_name="time", fragments=[])
    patterns = querySpec.patterns
    patterns_len = len(patterns)

    # 广度优先搜索
    # 找到所有满足第一个描述的片段作为起点
    queue = [(segment, [segment]) for segment in segments if match(segment, patterns[0])]
    while queue:
        current_segment, current_path = queue.pop(0)
        current_level = len(current_path)

        # 如果已经找到完成的匹配路径
        if current_level == patterns_len:
            result.fragments.append(
                Fragment(
                    start_idx=current_path[0].start_idx, end_idx=current_path[-1].end_idx, segments=current_path, avg_loss=calculate_avg_loss(current_path)
                )
            )
            continue

        # 如果还需要继续匹配
        if current_segment.end_idx not in followed_by_indexes:
            continue

        # 检查所有可能的下一个片段
        for next_segment in followed_by_indexes[current_segment.end_idx]:
            if match(next_segment, patterns[current_level]):
                queue.append((next_segment, current_path + [next_segment]))

    # 过滤部分结果
    result.fragments = prune_result(result)
    return result


if __name__ == "__main__":
    import matplotlib.pyplot as plt
    import random

    # 设置中文字体
    plt.rcParams["font.sans-serif"] = ["SimHei"]
    plt.rcParams["axes.unicode_minus"] = False

    # 准备数据
    querySpec = QuerySpec(
        patterns=[
            Pattern(trend="up"),
            Pattern(trend="down"),
            Pattern(trend="up"),
            Pattern(trend="down"),
            Pattern(trend="up"),
            Pattern(trend="down")
        ]
    )
    df = pd.read_csv("../portfolio_data.csv")
    y = df["AMZN"].values
    x = np.arange(len(y))
    result = query(x, y, querySpec)

    # 创建图形
    plt.figure(figsize=(15, 8))

    # 绘制原始数据
    plt.plot(x, y, color="gray", alpha=0.5, label="原始数据")

    # 为每个片段随机生成不同的颜色
    colors = [f"#{random.randint(0, 0xFFFFFF):06x}" for _ in range(len(result.fragments))]

    # 绘制每个找到的片段
    for idx, fragment in enumerate(result.fragments):
        color = colors[idx]

        # 获取片段的x和y范围
        fragment_x = x[fragment.start_idx : fragment.end_idx + 1]
        fragment_y = y[fragment.start_idx : fragment.end_idx + 1]

        # 绘制片段
        plt.plot(fragment_x, fragment_y, color=color, linewidth=2, label=f"片段 {idx+1} (损失: {fragment.avg_loss:.2f})")

        # 绘制每个子段
        for segment in fragment.segments:
            seg_x = x[segment.start_idx : segment.end_idx + 1]
            seg_y = y[segment.start_idx : segment.end_idx + 1]

            # 计算趋势线
            slope = segment.slope
            b = seg_y[0] - slope * seg_x[0]
            trend_y = slope * seg_x + b

            # 绘制趋势线
            plt.plot(seg_x, trend_y, "--", color=color, alpha=0.5)

            # 添加趋势标注
            mid_x = (seg_x[0] + seg_x[-1]) / 2
            mid_y = (seg_y[0] + seg_y[-1]) / 2
            plt.annotate(
                f'{"上升" if segment.trend == "up" else "下降"}', xy=(mid_x, mid_y), xytext=(10, 10), textcoords="offset points", color=color, fontsize=8
            )

    plt.title("时间序列片段匹配结果")
    plt.xlabel("时间")
    plt.ylabel("值")
    plt.legend(bbox_to_anchor=(1.05, 1), loc="upper left")
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()

    # 打印片段信息
    print("\n找到的片段信息：")
    for idx, fragment in enumerate(result.fragments):
        print(f"\n片段 {idx+1}:")
        print(f"起始索引: {fragment.start_idx}")
        print(f"结束索引: {fragment.end_idx}")
        print(f"平均损失: {fragment.avg_loss:.2f}")
        print("子段信息:")
        for seg_idx, segment in enumerate(fragment.segments):
            print(f"  子段 {seg_idx+1}: {segment.trend} (斜率: {segment.slope:.2f})")
