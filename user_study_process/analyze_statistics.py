import pandas as pd
import numpy as np
import scipy.stats as stats

# 读取CSV文件
df = pd.read_csv('Thematic Coding-processed_stage1_v2.csv')

# 定义函数计算统计指标
def calculate_statistics(group1, group2, metric):
    mean1 = group1[metric].mean()
    mean2 = group2[metric].mean()
    std1 = group1[metric].std()
    std2 = group2[metric].std()
    
    # 执行t检验
    t_stat, p_val = stats.ttest_ind(group1[metric], group2[metric], equal_var=False)
    
    return {
        'c_mean': mean1,
        'q_mean': mean2,
        'c_std': std1,
        'q_std': std2,
        'p_value': p_val,
        'significant': p_val < 0.05
    }

# 创建结果存储结构
results = []

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
            time_stats = calculate_statistics(c_group, q_group, 'time')
            
            # 计算score的统计指标
            score_stats = calculate_statistics(c_group, q_group, 'score')
            
            # 添加到结果中
            results.append({
                'level': level,
                'category': category,
                'time_stats': time_stats,
                'score_stats': score_stats
            })

# 打印结果
print("统计分析结果:")
print("=" * 80)

for result in results:
    level = result['level']
    category = result['category']
    time_stats = result['time_stats']
    score_stats = result['score_stats']
    
    print(f"\nLevel: {level}, Category: {category}")
    print("-" * 40)
    
    print("Time统计:")
    print(f"  ChronoMantic (c) 均值: {time_stats['c_mean']:.2f}, 标准差: {time_stats['c_std']:.2f}")
    print(f"  Qetch (q) 均值: {time_stats['q_mean']:.2f}, 标准差: {time_stats['q_std']:.2f}")
    print(f"  P值: {time_stats['p_value']:.4f} {'(显著)' if time_stats['significant'] else ''}")
    
    print("\nScore统计:")
    print(f"  ChronoMantic (c) 均值: {score_stats['c_mean']:.2f}, 标准差: {score_stats['c_std']:.2f}")
    print(f"  Qetch (q) 均值: {score_stats['q_mean']:.2f}, 标准差: {score_stats['q_std']:.2f}")
    print(f"  P值: {score_stats['p_value']:.4f} {'(显著)' if score_stats['significant'] else ''}")

# 将结果保存到CSV文件
output_data = []
for result in results:
    level = result['level']
    category = result['category']
    time_stats = result['time_stats']
    score_stats = result['score_stats']
    
    output_data.append({
        'level': level,
        'category': category,
        'metric': 'time',
        'c_mean': time_stats['c_mean'],
        'q_mean': time_stats['q_mean'],
        'c_std': time_stats['c_std'],
        'q_std': time_stats['q_std'],
        'p_value': time_stats['p_value'],
        'significant': time_stats['significant']
    })
    
    output_data.append({
        'level': level,
        'category': category,
        'metric': 'score',
        'c_mean': score_stats['c_mean'],
        'q_mean': score_stats['q_mean'],
        'c_std': score_stats['c_std'],
        'q_std': score_stats['q_std'],
        'p_value': score_stats['p_value'],
        'significant': score_stats['significant']
    })

# 创建DataFrame并保存
output_df = pd.DataFrame(output_data)
output_df.to_csv('statistical_analysis_results.csv', index=False)

print("\n分析结果已保存到 'statistical_analysis_results.csv'")