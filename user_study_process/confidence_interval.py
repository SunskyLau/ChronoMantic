import pandas as pd
import numpy as np
from scipy import stats

# 读取数据
df = pd.read_csv('Thematic Coding-processed_stage1_v2.csv')

def calculate_confidence_interval(data, confidence=0.95):
    n = len(data)
    mean = np.mean(data)
    se = stats.sem(data)
    ci = stats.t.interval(confidence, n-1, mean, se)
    return mean, ci[0], ci[1]

# 按不同条件计算置信区间
def analyze_confidence_intervals(df, metric):
    print(f"\n{metric}的95%置信区间分析：")
    print("-" * 50)
    
    # 1. 整体分析
    mean, ci_lower, ci_upper = calculate_confidence_interval(df[metric])
    print(f"整体: 均值={mean:.2f}, 95%置信区间=[{ci_lower:.2f}, {ci_upper:.2f}]")
    
    # 2. 按level分组分析
    for level in df['level'].unique():
        data = df[df['level'] == level][metric]
        mean, ci_lower, ci_upper = calculate_confidence_interval(data)
        print(f"\nLevel {level}: 均值={mean:.2f}, 95%置信区间=[{ci_lower:.2f}, {ci_upper:.2f}]")
    
    # 3. 按tool分组分析
    for tool in df['tool'].unique():
        data = df[df['tool'] == tool][metric]
        mean, ci_lower, ci_upper = calculate_confidence_interval(data)
        print(f"\nTool {tool}: 均值={mean:.2f}, 95%置信区间=[{ci_lower:.2f}, {ci_upper:.2f}]")
    
    # 4. 按level和tool组合分析
    for level in df['level'].unique():
        for tool in df['tool'].unique():
            data = df[(df['level'] == level) & (df['tool'] == tool)][metric]
            if len(data) > 0:  # 只在有数据的情况下计算
                mean, ci_lower, ci_upper = calculate_confidence_interval(data)
                print(f"\nLevel {level}, Tool {tool}: 均值={mean:.2f}, 95%置信区间=[{ci_lower:.2f}, {ci_upper:.2f}]")

# 分析time和score的置信区间
analyze_confidence_intervals(df, 'time')
analyze_confidence_intervals(df, 'score')