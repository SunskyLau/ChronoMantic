import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from app.MyTypes import Pattern, QuerySpec, ValueCondition
from app.model import get_best_segments, get_best_segments_optimized
from app.query.precise_time_query import generate_fragments_by_time_granularity

# 读取数据
data = pd.read_csv("../portfolio_data.csv")

# 创建查询规范
querySpec = QuerySpec(
    patterns=[Pattern(trend="up", extent=None), Pattern(trend="down", extent=None), Pattern(trend="up", extent=None)],
    y_max_condition=ValueCondition(comparator=">", value=100),
    y_min_condition=ValueCondition(comparator="<", value=10),
    start_time=None,
    end_time=None,
)

# 根据频率得到片段
fragment_list = generate_fragments_by_time_granularity(
    time_granularity="year", csv_name="portfolio_data.csv", time_column_name="Date", value_column_name="AMZN"
)
print(f"Total fragments: {len(fragment_list.fragments)}")


import time

start_time = time.time()

for fragment in fragment_list.fragments:
    start_idx = fragment.start_idx
    end_idx = fragment.end_idx
    # fragment_dates = data["Date"][start_idx : end_idx + 1]
    fragment_values = data["AMZN"][start_idx : end_idx + 1]
    x = np.arange(len(fragment_values))
    # print(f"Fragment {start_idx}:{end_idx} ({fragment_dates.min()} to {fragment_dates.max()}): {fragment_values.values}")
    segment_points = get_best_segments(x, fragment_values.values, 8)
    print("segment_points:", segment_points)
    # get_best_segments_optimized(x, fragment_values.values, 8)

end_time = time.time()
print(f"执行时长: {end_time - start_time:.2f} 秒")
