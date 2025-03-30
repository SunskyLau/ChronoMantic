import pandas as pd

# 读取原始CSV文件
df = pd.read_csv('Thematic Coding-processed_stage1.csv')

# 删除最后一行（平均值行）
df = df[:-1]

# 处理ChronoMantic时间数据
chrono_time_start = 1  # t1列的索引
chrono_times = pd.DataFrame({
    'name': df['name'],
    'ChronoMantic_time': df.iloc[:, chrono_time_start:chrono_time_start+4].values.tolist()
})

# 处理Qetch时间数据
qetch_time_start = 5  # Qetch时间t1列的索引
qetch_times = pd.DataFrame({
    'name': df['name'],
    'Qetch_time': df.iloc[:, qetch_time_start:qetch_time_start+4].values.tolist()
})

# 处理ChronoMantic分数数据
chrono_score_start = 9  # ChronoMantic分数s1列的索引
chrono_scores = pd.DataFrame({
    'name': df['name'],
    'ChronoMantic_score': df.iloc[:, chrono_score_start:chrono_score_start+4].values.tolist()
})

# 处理Qetch分数数据
qetch_score_start = 13  # Qetch分数s1列的索引
qetch_scores = pd.DataFrame({
    'name': df['name'],
    'Qetch_score': df.iloc[:, qetch_score_start:qetch_score_start+4].values.tolist()
})

# 合并所有数据
result_df = pd.merge(chrono_times, qetch_times, on='name')
result_df = pd.merge(result_df, chrono_scores, on='name')
result_df = pd.merge(result_df, qetch_scores, on='name')

# 保存第一个表格
result_df.to_csv('processed_time_score.csv', index=False)

# 创建preference表格
preference_cols = df.columns[-4:]  # 获取最后四列（task1-4）
preference_df = pd.DataFrame({
    'name': df['name'],
    'task1_preference': df[preference_cols[0]],
    'task2_preference': df[preference_cols[1]],
    'task3_preference': df[preference_cols[2]],
    'task4_preference': df[preference_cols[3]]
})

# 保存第二个表格
preference_df.to_csv('processed_preference.csv', index=False)