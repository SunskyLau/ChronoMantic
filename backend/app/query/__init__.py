from typing import List, Optional, Dict, Set, Tuple
import pandas as pd
from typeguard import typechecked

from ..model import approximate_dataset
from ..MyTypes import (
    DatasetInfo,
    QuerySpec,
    ApproximationSegmentsContainer,
    Segment,
    SlopeScopeCondition,
    ThresholdCondition,
    Trend,
    TimeScopeCondition,
    ValueScopeCondition,
    TimeSpanCondition,
    Relation,
    Comparator,
    Attribute,
)


@typechecked
def query(query_spec: QuerySpec, approximation_segments_containers: List[ApproximationSegmentsContainer], df: pd.DataFrame) -> Dict[int, List[List[Segment]]]:
    """
    基于QuerySpec在不同近似级别上查询段
    返回Dict[approximation_level, List[连续段序列]]
    """
    container = next((c for c in approximation_segments_containers if c.source == query_spec.target), None)
    if not container:
        return {}

    results_dict = {}

    for approximation_segments in container.approximation_segments_list:
        segments = approximation_segments.segments
        approximation_level = approximation_segments.approximation_level

        results = find_matching_sequences(segments, query_spec, df[query_spec.target])
        if results:
            results_dict[approximation_level] = results

    return results_dict


@typechecked
def find_matching_sequences(segments: List[Segment], query_spec: QuerySpec, df_column: pd.Series) -> List[List[Segment]]:
    """查找满足所有条件的连续段序列"""
    results = []
    # TODO: trend_length为0时的情况没有仔细讨论
    trend_length = len(query_spec.trends) if query_spec.trends else 1

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

    # 检查关系约束
    if query_spec.relations and not satisfies_relations(sequence, query_spec.relations):
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
    if query_spec.value_scope_condition:
        max_thresh = query_spec.value_scope_condition.max
        min_thresh = query_spec.value_scope_condition.min
        if not check_double_threshold_condition(min_value, max_value, min_thresh, max_thresh):
            return False

    # 检查起止时间条件
    if query_spec.time_scope_condition:
        start_time = sequence[0].start_idx
        end_time = sequence[-1].end_idx
        if query_spec.time_scope_condition:
            start_thresh = query_spec.time_scope_condition.min
            end_thresh = query_spec.time_scope_condition.max
            if not check_double_threshold_condition(start_time, end_time, start_thresh, end_thresh):
                return False

    return True


@typechecked
def check_double_threshold_condition(
    min_value: float, max_value: float, min_thresh: Optional[ThresholdCondition], max_thresh: Optional[ThresholdCondition]
) -> bool:
    """检查双值是否满足阈值条件"""
    if max_thresh:
        if max_thresh.inclusive:
            if max_value > max_thresh.value:
                return False
        else:
            if max_value >= max_thresh.value:
                return False

    if min_thresh:
        if min_thresh.inclusive:
            if min_value < min_thresh.value:
                return False
        else:
            if min_value <= min_thresh.value:
                return False
    return True


@typechecked
def check_single_threshold_condition(value: float, min_thresh: Optional[ThresholdCondition], max_thresh: Optional[ThresholdCondition]) -> bool:
    """检查单值是否满足阈值条件"""
    if max_thresh:
        if max_thresh.inclusive:
            if value > max_thresh.value:
                return False
        else:
            if value >= max_thresh.value:
                return False
    if min_thresh:
        if min_thresh.inclusive:
            if value < min_thresh.value:
                return False
        else:
            if value <= min_thresh.value:
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

    # 检查斜率条件
    if trend.slope_scope_condition:
        if not check_single_threshold_condition(segment.slope, trend.slope_scope_condition.min, trend.slope_scope_condition.max):
            return False

    # 检查角度条件
    if trend.angle_scope_condition and segment.angle is not None:
        if not check_single_threshold_condition(segment.angle, trend.angle_scope_condition.min, trend.angle_scope_condition.max):
            return False

    # 检查起止时间条件
    if trend.time_scope_condition:
        if not check_double_threshold_condition(segment.start_time, segment.end_time, trend.time_scope_condition.min, trend.time_scope_condition.max):
            return False

    # 检查时间跨度条件
    if trend.time_span_condition and segment.time_span is not None:
        if not check_single_threshold_condition(segment.time_span, trend.time_span_condition.min, trend.time_span_condition.max):
            return False

    return True


@typechecked
def check_time_span_condition(time_span: int, condition: TimeSpanCondition) -> bool:
    """检查时间跨度是否满足条件"""
    if condition.max:
        thresh = condition.max
        if thresh.inclusive:
            if time_span > thresh.value:
                return False
        else:
            if time_span >= thresh.value:
                return False

    if condition.min:
        thresh = condition.min
        if thresh.inclusive:
            if time_span < thresh.value:
                return False
        else:
            if time_span <= thresh.value:
                return False

    return True


@typechecked
def satisfies_relations(segments: List[Segment], relations: List[Relation]) -> bool:
    """检查段序列是否满足关系约束"""
    for relation in relations:
        if not satisfy_single_relation(segments, relation):
            return False

    return True


@typechecked
def satisfy_single_relation(segments: List[Segment], relation: Relation):
    """检查段序列是否满足单个关系约束"""
    if relation.id1 >= len(segments) or relation.id2 >= len(segments):
        return False

    seg1, seg2 = segments[relation.id1], segments[relation.id2]

    # 获取对应属性的值
    val1 = get_attribute_value(seg1, relation.attribute)
    val2 = get_attribute_value(seg2, relation.attribute)

    if val1 is None or val2 is None:
        return False

    # 根据比较器进行比较
    if relation.comparator == Comparator.GREATER:
        return val1 > val2
    elif relation.comparator == Comparator.LESS:
        return val1 < val2
    elif relation.comparator == Comparator.EQUAL:
        return val1 == val2
    elif relation.comparator == Comparator.NO_GREATER:
        return val1 <= val2
    elif relation.comparator == Comparator.NO_LESS:
        return val1 >= val2
    elif relation.comparator == Comparator.APPROXIMATELY_EQUAL_TO:
        return abs(val1 - val2) <= abs(val1 * 0.05)  # 5%容差

    return False


@typechecked
def get_attribute_value(segment: Segment, attribute: Attribute) -> Optional[float]:
    """从段中获取特定属性的值"""
    if attribute == Attribute.SLOPE:
        return segment.slope
    elif attribute == Attribute.ANGLE:
        return segment.angle
    elif attribute == Attribute.START_VALUE:
        return segment.start_value
    elif attribute == Attribute.END_VALUE:
        return segment.end_value
    elif attribute == Attribute.TIME_SPAN:
        return segment.time_span
    return None


if __name__ == "__main__":
    # 加载数据
    df = pd.read_csv("../portfolio_data.csv")
    dataset_info = DatasetInfo(time_column="Date", value_columns=["AMZN", "DPZ"], column_ratio_dict={"AMZN": 1, "DPZ": 1})
    approximation_segments_containers = approximate_dataset(df, dataset_info)

    query_spec1 = QuerySpec(
        target="AMZN",
        trends=[
            Trend(slope_scope_condition=SlopeScopeCondition(min=ThresholdCondition(value=0.0001, inclusive=True))),
            Trend(slope_scope_condition=SlopeScopeCondition(min=ThresholdCondition(value=0.0001, inclusive=True))),
        ],
        relations=[Relation(comparator=Comparator.GREATER, id1=0, id2=1, attribute=Attribute.END_VALUE)],
    )
    results_dict = query(query_spec1, approximation_segments_containers, df)
    print(results_dict)
