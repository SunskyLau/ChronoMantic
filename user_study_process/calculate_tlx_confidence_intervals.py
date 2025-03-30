import pandas as pd
import numpy as np
from scipy import stats

# 读取CSV文件
df = pd.read_csv('Thematic Coding-TLX_CSV.csv')

# 定义维度
dimensions = ['Mental', 'Physical', 'Temporal', 'Performance', 'Effort', 'Frustration']

# 计算95%置信区间
def calculate_confidence_interval(data):
    confidence = 0.95
    n = len(data)
    mean = np.mean(data)
    se = stats.sem(data)
    ci = stats.t.interval(confidence, n-1, mean, se)
    return mean, ci[0], ci[1]

# 打印结果
print('TLX问卷数据分析 - 95%置信区间')
print('=' * 50)

for dim in dimensions:
    print(f'\n{dim}维度分析:')
    
    # C工具数据
    c_data = df[f'C_{dim}']
    c_mean, c_lower, c_upper = calculate_confidence_interval(c_data)
    print(f'C工具: 平均值 = {c_mean:.2f}, 置信区间 = [{c_lower:.2f}, {c_upper:.2f}]')
    
    # Q工具数据
    q_data = df[f'Q_{dim}']
    q_mean, q_lower, q_upper = calculate_confidence_interval(q_data)
    print(f'Q工具: 平均值 = {q_mean:.2f}, 置信区间 = [{q_lower:.2f}, {q_upper:.2f}]')