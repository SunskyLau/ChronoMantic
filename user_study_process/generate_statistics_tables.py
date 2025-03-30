import pandas as pd
import numpy as np
import scipy.stats as stats

# 读取CSV文件
df = pd.read_csv('Thematic Coding-processed_stage1_v2.csv')

# 创建结果表格
def create_summary_tables():
    # 创建time和score的结果表格
    time_table = pd.DataFrame(columns=['level_category', 'c_mean', 'q_mean', 'diff', 'c_std', 'q_std', 'p_value', 'significant'])
    score_table = pd.DataFrame(columns=['level_category', 'c_mean', 'q_mean', 'diff', 'c_std', 'q_std', 'p_value', 'significant'])
    
    # 对每个level和category组合进行分析
    for level in ['l1', 'l2', 'l3', 'l4']:
        for category in ['d', 'u']:
            # 筛选当前level和category的数据
            current_data = df[(df['level'] == level) & (df['category'] == category)]
            
            # 按工具分组
            c_group = current_data[current_data['tool'] == 'c']
            q_group = current_data[current_data['tool'] == 'q']
            
            # 如果两组都有数据，计算统计指标
            if not c_group.empty and not q_group.empty:
                # 计算time的统计指标
                c_time_mean = c_group['time'].mean()
                q_time_mean = q_group['time'].mean()
                c_time_std = c_group['time'].std()
                q_time_std = q_group['time'].std()
                time_diff = c_time_mean - q_time_mean
                
                # 执行t检验
                t_stat_time, p_val_time = stats.ttest_ind(c_group['time'], q_group['time'], equal_var=False)
                time_significant = p_val_time < 0.05
                
                # 添加到time表格
                time_table = pd.concat([time_table, pd.DataFrame({
                    'level_category': [f'{level}_{category}'],
                    'c_mean': [round(c_time_mean, 2)],
                    'q_mean': [round(q_time_mean, 2)],
                    'diff': [round(time_diff, 2)],
                    'c_std': [round(c_time_std, 2)],
                    'q_std': [round(q_time_std, 2)],
                    'p_value': [round(p_val_time, 4)],
                    'significant': ['是' if time_significant else '否']
                })], ignore_index=True)
                
                # 计算score的统计指标
                c_score_mean = c_group['score'].mean()
                q_score_mean = q_group['score'].mean()
                c_score_std = c_group['score'].std()
                q_score_std = q_group['score'].std()
                score_diff = c_score_mean - q_score_mean
                
                # 执行t检验
                t_stat_score, p_val_score = stats.ttest_ind(c_group['score'], q_group['score'], equal_var=False)
                score_significant = p_val_score < 0.05
                
                # 添加到score表格
                score_table = pd.concat([score_table, pd.DataFrame({
                    'level_category': [f'{level}_{category}'],
                    'c_mean': [round(c_score_mean, 2)],
                    'q_mean': [round(q_score_mean, 2)],
                    'diff': [round(score_diff, 2)],
                    'c_std': [round(c_score_std, 2)],
                    'q_std': [round(q_score_std, 2)],
                    'p_value': [round(p_val_score, 4)],
                    'significant': ['是' if score_significant else '否']
                })], ignore_index=True)
    
    return time_table, score_table

# 生成表格并保存
time_table, score_table = create_summary_tables()

# 保存到CSV文件
time_table.to_csv('time_statistics_table.csv', index=False)
score_table.to_csv('score_statistics_table.csv', index=False)

# 打印表格
print("\n时间(Time)统计表:")
print("=" * 100)
print(time_table.to_string(index=False))

print("\n\n得分(Score)统计表:")
print("=" * 100)
print(score_table.to_string(index=False))

print("\n统计表格已保存到 'time_statistics_table.csv' 和 'score_statistics_table.csv'")