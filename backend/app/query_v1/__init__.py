from typing import List
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from ..model_v2 import bottom_up_merge
from ..MyTypes_v1 import Pattern, QuerySpec, Segment, SlopeCondition


def query(query_spec: QuerySpec, segments: List[Segment]):
    patterns = query_spec.patterns
    results = []
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
    return results


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
    data = pd.read_csv("../portfolio_data.csv")
    y = data["AMZN"].values
    x = data["AMZN"].index
    segments = bottom_up_merge(x, y, k=50)
    query_spec = QuerySpec(
        patterns=[
            Pattern(slope_condition=SlopeCondition(min_slope=0.3)),
            Pattern(slope_condition=SlopeCondition(min_slope=0.3)),
        ]
    )
    results = query(query_spec, segments)
    visualize_results(x, y, results)
    for result in results:
        print(result)
