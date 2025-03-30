import pandas as pd
from scipy import stats

# 读取CSV文件
df = pd.read_csv('processed_time_score_final.csv')

# 提取ChronoMantic_time和Qetch_time数据
chrono_time = df['ChronoMantic_time'].values
qetch_time = df['Qetch_time'].values

# 提取ChronoMantic_score和Qetch_score数据
chrono_score = df['ChronoMantic_score'].values
qetch_score = df['Qetch_score'].values

# 进行时间维度的配对t检验
t_statistic_time, p_value_time = stats.ttest_rel(chrono_time, qetch_time)

# 进行评分维度的配对t检验
t_statistic_score, p_value_score = stats.ttest_rel(chrono_score, qetch_score)

print(f'时间维度配对t检验结果：')
print(f'p值 = {p_value_time:.4f}')
print(f't统计量 = {t_statistic_time:.4f}')

print(f'\n评分维度配对t检验结果：')
print(f'p值 = {p_value_score:.10f}')
print(f't统计量 = {t_statistic_score:.10f}')