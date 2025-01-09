import numpy as np
import pandas as pd
from app.query_v0.fuzzy_time_query.generate_segments import generate_segments
from .config import Config
from ...MyTypes import Fragment, FragmentList, Pattern, QuerySpec, Segment
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


def if_add_segment(current_path: List[Segment], new_segment: Segment, x: np.ndarray, y: np.ndarray) -> bool:
    """根据x和y方向上所占比例来决定是否添加新segment"""
    # 如果是第一个segment，直接添加
    if not current_path:
        return True

    # 将new_segment添加到临时路径中进行判断
    temp_path = current_path + [new_segment]

    # 计算x方向上每个segment的长度
    x_spans = [(seg.end_idx - seg.start_idx) for seg in temp_path]
    max_x_span = max(x_spans)
    min_x_span = min(x_spans)

    # 计算y方向上每个segment的跨度
    y_spans = []
    for seg in temp_path:
        seg_y = y[seg.start_idx : seg.end_idx + 1]
        y_span = max(seg_y) - min(seg_y)
        y_spans.append(y_span)

    max_y_span = max(y_spans)
    min_y_span = min(y_spans)

    # 判断x或y方向上的比例是否满足要求
    x_ratio = min_x_span / max_x_span if max_x_span > 0 else 0
    y_ratio = min_y_span / max_y_span if max_y_span > 0 else 0

    return x_ratio >= Config.SPAN_THRESHOLD or y_ratio >= Config.SPAN_THRESHOLD


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
            if match(next_segment, patterns[current_level]) and if_add_segment(current_path, next_segment, x, y):
                queue.append((next_segment, current_path + [next_segment]))

    # 过滤部分结果
    # result.fragments = prune_result(result)
    print(f"len {len(result.fragments)}")
    candidates = result.fragments
    sorted_candidates = sorted(candidates, key=lambda x: x.avg_loss, reverse=False)
    result.fragments = sorted_candidates
    return result


if __name__ == "__main__":
    import matplotlib.pyplot as plt
    import matplotlib.colors as mcolors

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
        ]
    )
    df = pd.read_csv("../portfolio_data.csv")
    y = df["AMZN"].values
    x = np.arange(len(y))
    result = query(x, y, querySpec)
    fragments = result.fragments

    # 获取前5个fragments
    top_5_fragments = fragments[-5:]

    # 使用matplotlib的默认颜色
    colors = ["red", "blue"]  # 上升用红色，下降用蓝色

    # 创建一个2x3的子图布局
    fig = plt.figure(figsize=(20, 12))

    for idx, fragment in enumerate(top_5_fragments, 1):
        ax = fig.add_subplot(2, 3, idx)

        # 获取片段的范围并扩展10%用于显示
        start_idx = fragment.start_idx
        end_idx = fragment.end_idx
        range_length = end_idx - start_idx
        padding = int(range_length * 0.1)
        plot_start = max(0, start_idx - padding)
        plot_end = min(len(x), end_idx + padding)

        # 绘制整个范围的原始数据
        ax.plot(x[plot_start:plot_end], y[plot_start:plot_end], color="gray", alpha=0.3, linewidth=1)

        # 绘制片段内的原始数据
        ax.plot(x[start_idx : end_idx + 1], y[start_idx : end_idx + 1], color="gray", linewidth=2)

        # 只绘制趋势线
        for segment in fragment.segments:
            color = colors[0] if segment.trend == "up" else colors[1]

            segment_x = x[segment.start_idx : segment.end_idx + 1]
            segment_y = y[segment.start_idx : segment.end_idx + 1]

            # 只绘制趋势线
            slope = segment.slope
            b = segment_y[0] - slope * segment_x[0]
            trend_y = slope * segment_x + b
            ax.plot(segment_x, trend_y, color=color, linewidth=2)

        ax.set_title(f"片段 {idx} (损失: {fragment.avg_loss:.2f})")
        ax.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.show()
