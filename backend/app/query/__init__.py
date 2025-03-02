from typing import List, Optional, Dict, Set, Tuple
import pandas as pd
from typeguard import typechecked
import matplotlib.pyplot as plt

from .config import FLAT_THRESHOLD, APPROXIMATELY_EQUAL_THRESHOLD
from .utils import check_double_threshold_condition, check_single_threshold_condition, query_by_no_trends

from ..model import approximate_dataset
from ..MyTypes import (
    DatasetInfo,
    QuerySpec,
    ApproximationSegmentsContainer,
    Segment,
    ScopeCondition,
    ThresholdCondition,
    Trend,
    SingleRelation,
    GroupRelation,
    SingleAttribute,
    GroupAttribute,
    Comparator,
    TrendGroup,
    TrendCategory,
)


@typechecked
def query(
    query_spec: QuerySpec, approximation_segments_containers: List[ApproximationSegmentsContainer], df: pd.DataFrame
) -> Dict[str, Dict[int, List[List[Segment]]]]:
    """
    基于QuerySpec在不同近似级别上查询段
    返回Dict[approximation_level, List[连续段序列]]
    """
    if not query_spec.targets:
        results_dict_key4target = {}
        for container in approximation_segments_containers:
            results_dict_key4level = query_for_target(query_spec, container, df)
            results_dict_key4target[container.source] = results_dict_key4level
        return results_dict_key4target

    results_dict_key4target = {}
    for target in query_spec.targets:
        container = next((c for c in approximation_segments_containers if c.source == target), None)
        results_dict_key4level = query_for_target(query_spec, container, df)
        results_dict_key4target[target] = results_dict_key4level
    return results_dict_key4target


@typechecked
def query_for_target(
    query_spec: QuerySpec, approximation_segments_container: ApproximationSegmentsContainer | None, df: pd.DataFrame
) -> Dict[int, List[List[Segment]]]:
    """基于query_spec在approximation_segments_container中查询target的连续段序列"""
    if not approximation_segments_container:
        return {}

    # 如果query_spec没有趋势，则使用query_by_no_trends查询
    if not query_spec.trends:
        return query_by_no_trends(query_spec, approximation_segments_container, df)

    results_dict = {}

    for approximation_segments in approximation_segments_container.approximation_segments_list:
        segments = approximation_segments.segments
        approximation_level = approximation_segments.approximation_level

        results = find_matching_sequences(segments, query_spec, df[approximation_segments_container.source])
        if results:
            results_dict[approximation_level] = results

    return results_dict


@typechecked
def find_matching_sequences(segments: List[Segment], query_spec: QuerySpec, df_column: pd.Series) -> List[List[Segment]]:
    """查找满足所有条件的连续段序列"""
    results = []
    trend_length = len(query_spec.trends) if query_spec.trends else 0

    for i in range(len(segments) - trend_length + 1):
        sequence = segments[i : i + trend_length]
        if satisfies_all_conditions(sequence, query_spec, df_column):
            results.append(sequence)

    return results


@typechecked
def satisfies_all_conditions(sequence: List[Segment], query_spec: QuerySpec, df_column: pd.Series) -> bool:
    """检查段序列是否满足所有查询条件"""
    # 检查全局条件
    if not satisfies_global_conditions(sequence, query_spec, df_column):
        return False

    # 检查趋势模式
    if query_spec.trends and not match_trend_sequence(sequence, query_spec.trends):
        return False

    # 检查单趋势之间的关系约束
    if query_spec.single_relations and not satisfies_single_relations(sequence, query_spec.single_relations):
        return False

    # 检查趋势组合条件
    if query_spec.trend_groups and not satisfies_trend_groups(sequence, query_spec.trend_groups):
        return False

    # 检查组合之间的关系
    if query_spec.group_relations and not satisfies_group_relations(sequence, query_spec.group_relations):
        return False

    # 检查总时间跨度条件
    if query_spec.time_span_condition and not satisfies_time_span_condition(sequence, query_spec.time_span_condition):
        return False

    return True


@typechecked
def satisfies_global_conditions(sequence: List[Segment], query_spec: QuerySpec, df_column: pd.Series) -> bool:
    """检查段序列是否满足全局条件"""
    # 获取序列的整体最大最小值
    start_idx = sequence[0].start_idx
    end_idx = sequence[-1].end_idx
    min_value = df_column[start_idx:end_idx].min()
    max_value = df_column[start_idx:end_idx].max()

    # 检查全局最大最小值条件
    if query_spec.max_value_scope_condition:
        if not check_single_threshold_condition(max_value, query_spec.max_value_scope_condition.min, query_spec.max_value_scope_condition.max):
            return False

    if query_spec.min_value_scope_condition:
        if not check_single_threshold_condition(min_value, query_spec.min_value_scope_condition.min, query_spec.min_value_scope_condition.max):
            return False

    # 检查起止时间条件
    if query_spec.time_scope_condition:
        start_time = sequence[0].start_time
        end_time = sequence[-1].end_time
        if not check_double_threshold_condition(start_time, end_time, query_spec.time_scope_condition.min, query_spec.time_scope_condition.max):
            return False

    return True


@typechecked
def match_trend_sequence(segments: List[Segment], trends: List[Trend]) -> bool:
    """检查段序列是否匹配趋势模式"""
    if len(segments) != len(trends):
        return False

    for segment, trend in zip(segments, trends):
        if not match_single_trend(segment, trend):
            return False

    return True


@typechecked
def match_single_trend(segment: Segment, trend: Trend) -> bool:
    """检查单个段是否匹配趋势模式"""
    if trend.category == TrendCategory.FLAT:
        if not segment.abs_slope_percentage <= FLAT_THRESHOLD:
            return False
    elif trend.category == TrendCategory.UP:
        if not (segment.slope > 0 and segment.abs_slope_percentage > FLAT_THRESHOLD):
            return False
    elif trend.category == TrendCategory.DOWN:
        if not (segment.slope < 0 and segment.abs_slope_percentage > FLAT_THRESHOLD):
            return False
    elif trend.category == TrendCategory.ARBITRARY:
        pass  # 任意趋势，不需要检查趋势类型
    else:
        return False

    # 检查斜率条件
    if trend.slope_scope_condition:
        if segment.slope is None or not check_single_threshold_condition(segment.slope, trend.slope_scope_condition.min, trend.slope_scope_condition.max):
            return False

    # 检查斜率在所有斜率中所处比率的范围条件
    if trend.abs_slope_percentage_scope_condition:
        if segment.abs_slope_percentage is None or not check_single_threshold_condition(
            segment.abs_slope_percentage,
            trend.abs_slope_percentage_scope_condition.min,
            trend.abs_slope_percentage_scope_condition.max,
        ):
            return False

    # 检查时间跨度条件
    if trend.time_span_condition:
        if segment.time_span is None or not check_single_threshold_condition(segment.time_span, trend.time_span_condition.min, trend.time_span_condition.max):
            return False

    return True


@typechecked
def satisfies_single_relations(segments: List[Segment], relations: List[SingleRelation]) -> bool:
    """检查段序列是否满足单趋势之间的关系约束"""
    for relation in relations:
        if not satisfy_single_relation(segments, relation):
            return False
    return True


@typechecked
def satisfy_single_relation(segments: List[Segment], relation: SingleRelation) -> bool:
    """检查段序列是否满足单个趋势关系约束"""
    if relation.id1 >= len(segments) or relation.id2 >= len(segments):
        return False

    seg1, seg2 = segments[relation.id1], segments[relation.id2]

    # 获取对应属性的值
    val1 = get_single_attribute_value(seg1, relation.attribute)
    val2 = get_single_attribute_value(seg2, relation.attribute)

    if val1 is None or val2 is None:
        return False

    # 根据比较器进行比较
    return compare_values(val1, val2, relation.comparator)


@typechecked
def satisfies_trend_groups(segments: List[Segment], trend_groups: List[TrendGroup]) -> bool:
    """检查段序列是否满足趋势组合条件"""
    for group in trend_groups:
        id1, id2 = group.ids
        if id1 >= len(segments) or id2 >= len(segments):
            return False

        if group.time_span_condition:
            time_span = segments[id2].end_time - segments[id1].start_time
            if not check_single_threshold_condition(time_span, group.time_span_condition.min, group.time_span_condition.max):
                return False

    return True


@typechecked
def satisfies_group_relations(segments: List[Segment], relations: List[GroupRelation]) -> bool:
    """检查段序列是否满足组合之间的关系"""
    for relation in relations:
        if not satisfy_group_relation(segments, relation):
            return False
    return True


@typechecked
def satisfy_group_relation(segments: List[Segment], relation: GroupRelation) -> bool:
    """检查段序列是否满足单个组合关系约束"""
    id1_1, id1_2 = relation.group1
    id2_1, id2_2 = relation.group2

    if any(idx >= len(segments) for idx in [id1_1, id1_2, id2_1, id2_2]):
        return False

    # 计算两个组的属性值
    if relation.attribute == GroupAttribute.TIME_SPAN:
        val1 = segments[id1_2].end_time - segments[id1_1].start_time
        val2 = segments[id2_2].end_time - segments[id2_1].start_time
    else:
        return False  # 暂不支持其他组属性

    if val1 is None or val2 is None:
        return False

    # 根据比较器进行比较
    return compare_values(val1, val2, relation.comparator)


@typechecked
def get_single_attribute_value(segment: Segment, attribute: SingleAttribute) -> Optional[float]:
    """从段中获取单趋势属性的值"""
    if attribute == SingleAttribute.SLOPE:
        return segment.slope
    elif attribute == SingleAttribute.START_VALUE:
        return segment.start_value
    elif attribute == SingleAttribute.END_VALUE:
        return segment.end_value
    elif attribute == SingleAttribute.TIME_SPAN:
        return segment.time_span
    elif attribute == SingleAttribute.ABS_SLOPE_PERCENTAGE:
        return segment.abs_slope_percentage
    return None


@typechecked
def compare_values(val1: float, val2: float, comparator: Comparator) -> bool:
    """根据比较器比较两个值"""
    if comparator == Comparator.GREATER:
        return bool(val1 > val2 and abs(val1 - val2) > abs(val2 * APPROXIMATELY_EQUAL_THRESHOLD))
    elif comparator == Comparator.LESS:
        return bool(val1 < val2 and abs(val1 - val2) > abs(val1 * APPROXIMATELY_EQUAL_THRESHOLD))
    elif comparator == Comparator.EQUAL:
        return bool(val1 == val2)
    elif comparator == Comparator.NO_GREATER:
        return bool(val1 <= val2)
    elif comparator == Comparator.NO_LESS:
        return bool(val1 >= val2)
    elif comparator == Comparator.APPROXIMATELY_EQUAL_TO:
        return bool(abs(val1 - val2) <= abs(val1 * APPROXIMATELY_EQUAL_THRESHOLD))
    return False


@typechecked
def satisfies_time_span_condition(segments: List[Segment], condition: ScopeCondition) -> bool:
    """检查段序列是否满足总时间跨度条件"""
    total_time_span = segments[-1].end_time - segments[0].start_time
    return check_single_threshold_condition(total_time_span, condition.min, condition.max)


@typechecked
def visualize_query_results(
    df: pd.DataFrame,
    query_spec: QuerySpec,
    approximation_segments_containers: List[ApproximationSegmentsContainer],
    results: Dict[str, Dict[int, List[List[Segment]]]],
) -> None:
    """Visualize query results for each approximation level

    Args:
        df: Input dataframe
        query_spec: Query specification
        approximation_segments_containers: List of approximation segment containers
        results: Query results dictionary
    """
    for container in approximation_segments_containers:
        for approximation_segments in container.approximation_segments_list:
            level = approximation_segments.approximation_level

            fig, ax = plt.subplots(figsize=(15, 3))
            ax.patch.set_alpha(0.0)
            ax.set_frame_on(False)
            ax.set_xticks([])
            ax.set_yticks([])
            fig.patch.set_alpha(0.0)

            ax.plot(df[container.source], color="gray", alpha=0.8, linewidth=6)

            for segment in approximation_segments.segments:
                ax.plot(
                    [segment.start_idx, segment.end_idx],
                    [df[container.source][segment.start_idx], df[container.source][segment.end_idx]],
                    color="#FF9800",
                    linewidth=6,
                )

            if level in results[container.source]:
                for segments in results[container.source][level]:
                    for segment in segments:
                        ax.plot(
                            [segment.start_idx, segment.end_idx],
                            [df[container.source][segment.start_idx], df[container.source][segment.end_idx]],
                            color="red",
                            linewidth=6,
                        )

            plt.tight_layout()
            plt.savefig(f"query_{level}.png", transparent=True)
            plt.show()


if __name__ == "__main__":
    df = pd.read_csv("../datasets/portfolio_data.csv")
    df = df.iloc[1200:].reset_index(drop=True)
    dataset_info = DatasetInfo(time_column="Date", value_columns=["AMZN"])
    approximation_segments_containers = approximate_dataset(df, dataset_info)

    query_spec1 = QuerySpec(
        targets=["AMZN"],
        trends=[
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
        ],
        single_relations=[SingleRelation(id1=0, id2=2, attribute=SingleAttribute.END_VALUE, comparator=Comparator.APPROXIMATELY_EQUAL_TO)],
        trend_groups=[],
        group_relations=[],
        time_span_condition=None,
        time_scope_condition=None,
        max_value_scope_condition=None,
        min_value_scope_condition=None,
    )

    results = query(query_spec1, approximation_segments_containers, df)
    visualize_query_results(df, query_spec1, approximation_segments_containers, results)
