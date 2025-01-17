from typing import List, Optional
from typeguard import typechecked
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from ..model_v2 import approximate_dataset, bottom_up_merge
from ..MyTypes_v1 import ApproximationSegmentsContainer, DatasetInfo, Trend, QuerySpec, Relation, Segment, SlopeCondition


@typechecked
def query(query_spec: QuerySpec, approximation_segments_containers: List[ApproximationSegmentsContainer]):
    target, patterns, relations = query_spec.target, query_spec.patterns, query_spec.relations
    # 找到source为target的approximation_segments_container
    approximation_segments_container = None
    for container in approximation_segments_containers:
        if container.source == target:
            approximation_segments_container = container
            break

    results_dict = {}

    if approximation_segments_container is None:
        return results_dict

    # 遍历每一个approximation_segments,不同的approximation_level有一个approximation_segments
    for approximation_segments in approximation_segments_container.approximation_segments_list:
        segments = approximation_segments.segments
        approximation_level = approximation_segments.approximation_level
        results = match_patterns_in_segments(patterns, relations, segments)
        results_dict[approximation_level] = results

    return results_dict


@typechecked
def match_patterns_in_segments(patterns: List[Trend], relations: Optional[List[Relation]], segments: List[Segment]):
    """根据patterns和relations在segments中匹配结果"""
    results: List[List[Segment]] = []
    for i in range(len(segments)):
        result = []
        flag = True
        for j, pattern in enumerate(patterns):
            if i + j >= len(segments):
                flag = False
                break
            if pattern.slope_condition is not None:
                if pattern.slope_condition.max_slope is not None and segments[i + j].slope > pattern.slope_condition.max_slope:
                    flag = False
                    break
                if pattern.slope_condition.min_slope is not None and segments[i + j].slope < pattern.slope_condition.min_slope:
                    flag = False
                    break
                result.append(segments[i + j])
        if flag:
            results.append(result)

    for result in results:
        if not if_satisfy_relations(result, relations):
            results.remove(result)

    return results


@typechecked
def if_satisfy_relations(result: List[Segment], relations: Optional[List[Relation]] = None):
    if relations is None:
        return True

    flag = True
    min_value, max_value = np.inf, -np.inf

    for segment in result:
        min_value = min(min_value, segment.start_value, segment.end_value)
        max_value = max(max_value, segment.start_value, segment.end_value)

    gap = max_value - min_value

    for relation in relations:
        operator, id1, id2, attribute = relation.operator, relation.id1, relation.id2, relation.attribute
        if attribute == "end_value":
            id1_attribute, id2_attribute = result[id1].end_value, result[id2].end_value
        elif attribute == "start_value":
            id1_attribute, id2_attribute = result[id1].start_value, result[id2].start_value
        elif attribute == "angle":
            id1_attribute, id2_attribute = result[id1].angle, result[id2].angle

        if id1_attribute is None or id2_attribute is None:
            flag = False
            break
        diff = id2_attribute - id1_attribute
        if attribute == "end_value" or attribute == "start_value":
            if operator == "greater":
                if diff < 0 and abs(diff) > 0.1 * gap:
                    continue
                else:
                    flag = False
                    break
            elif operator == "less":
                if diff > 0 and abs(diff) > 0.1 * gap:
                    continue
                else:
                    flag = False
                    break
            elif operator == "approximately_equal_to":
                if abs(diff) < 0.1 * gap:
                    continue
                else:
                    flag = False
                    break

    return flag


def visualize_results(x, y, results):
    plt.figure(figsize=(12, 6))
    plt.plot(x, y, color="gray", alpha=0.5, label="Original Data")

    for result in results:
        for segment in result:
            plt.plot([segment.start_idx, segment.end_idx], [y[segment.start_idx], y[segment.end_idx]], color="lightblue", linewidth=2)

    plt.xlabel("Index")
    plt.ylabel("Value")
    plt.title("Query Results Visualization")
    plt.legend()
    plt.show()


if __name__ == "__main__":
    # 加载数据
    df = pd.read_csv("../portfolio_data.csv")
    dataset_info = DatasetInfo(time_column="Date", value_columns=["AMZN", "DPZ"], column_ratio_dict={"AMZN": 1, "DPZ": 1})
    approxiamation_segments_containers = approximate_dataset(df, dataset_info)
    # 构建query_spec
    query_spec = QuerySpec(
        target="AMZN",
        patterns=[
            Trend(slope_condition=SlopeCondition(min_slope=0.0001)),
            Trend(slope_condition=SlopeCondition(min_slope=0.0001)),
        ],
    )
    results_dict = query(query_spec, approxiamation_segments_containers)
    print(results_dict)
