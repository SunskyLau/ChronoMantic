import pandas as pd
import numpy as np
from statsmodels.stats.power import TTestIndPower
import matplotlib.pyplot as plt

# 读取统计分析结果
df = pd.read_csv('statistical_analysis_results.csv')

# 创建结果DataFrame
power_results = pd.DataFrame(columns=['level', 'category', 'metric', 'effect_size', 'power', 'sample_size'])

# 计算效应量(Cohen's d)和统计功效
def calculate_power(row):
    # 计算效应量 (Cohen's d)
    # Cohen's d = |μ1 - μ2| / sqrt((σ1² + σ2²) / 2)
    mean_diff = abs(row['c_mean'] - row['q_mean'])
    pooled_std = np.sqrt((row['c_std']**2 + row['q_std']**2) / 2)
    
    if pooled_std == 0:  # 避免除以零
        effect_size = 0
    else:
        effect_size = mean_diff / pooled_std
    
    # 计算统计功效
    # 使用statsmodels的TTestIndPower
    power_analysis = TTestIndPower()
    # 假设每组有8个观测值
    sample_size = 8
    # 显著性水平alpha=0.05
    alpha = 0.05
    # 计算功效
    power = power_analysis.power(effect_size=effect_size, nobs1=sample_size, alpha=alpha, ratio=1.0)
    
    return pd.Series({
        'level': row['level'],
        'category': row['category'],
        'metric': row['metric'],
        'effect_size': round(effect_size, 2),
        'power': round(power, 2),
        'sample_size': sample_size
    })

# 对每一行计算功效
power_results = df.apply(calculate_power, axis=1)

# 保存结果到CSV
power_results.to_csv('statistical_power_results.csv', index=False)

# 打印结果
print("统计功效分析结果:")
print("=" * 80)

# 按指标分组显示结果
for metric in ['time', 'score']:
    metric_results = power_results[power_results['metric'] == metric]
    print(f"\n{metric.upper()}指标的统计功效分析:")
    print("-" * 60)
    
    # 创建表格格式输出
    print(f"{'Level-Category':<15} {'效应量(Cohen d)':<20} {'统计功效':<15} {'样本量':<10}")
    print("-" * 60)
    
    for _, row in metric_results.iterrows():
        level_cat = f"{row['level']}_{row['category']}"
        print(f"{level_cat:<15} {row['effect_size']:<20.2f} {row['power']:<15.2f} {row['sample_size']:<10}")

# 创建可视化
plt.figure(figsize=(12, 8))

# 为time和score分别创建子图
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 12))

# 筛选time数据
time_data = power_results[power_results['metric'] == 'time']
# 创建level_category列
time_data['level_category'] = time_data['level'] + '_' + time_data['category']

# 筛选score数据
score_data = power_results[power_results['metric'] == 'score']
# 创建level_category列
score_data['level_category'] = score_data['level'] + '_' + score_data['category']

# 绘制time功效条形图
bars1 = ax1.bar(time_data['level_category'], time_data['power'], color='skyblue')
ax1.set_title('TIME指标的统计功效')
ax1.set_xlabel('Level-Category')
ax1.set_ylabel('统计功效')
ax1.set_ylim(0, 1.1)
ax1.axhline(y=0.8, color='red', linestyle='--', label='推荐功效水平(0.8)')
ax1.legend()

# 在条形上方添加功效值标签
for bar in bars1:
    height = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2., height + 0.05,
            f'{height:.2f}', ha='center', va='bottom')

# 绘制score功效条形图
bars2 = ax2.bar(score_data['level_category'], score_data['power'], color='lightgreen')
ax2.set_title('SCORE指标的统计功效')
ax2.set_xlabel('Level-Category')
ax2.set_ylabel('统计功效')
ax2.set_ylim(0, 1.1)
ax2.axhline(y=0.8, color='red', linestyle='--', label='推荐功效水平(0.8)')
ax2.legend()

# 在条形上方添加功效值标签
for bar in bars2:
    height = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2., height + 0.05,
            f'{height:.2f}', ha='center', va='bottom')

plt.tight_layout()
plt.savefig('statistical_power_analysis.png')
plt.close()

print("\n统计功效分析结果已保存到 'statistical_power_results.csv'")
print("统计功效可视化已保存到 'statistical_power_analysis.png'")

# 计算达到0.8功效所需的样本量
print("\n达到0.8功效所需的样本量分析:")
print("=" * 80)
print(f"{'Level-Category':<15} {'指标':<10} {'效应量':<15} {'当前功效':<15} {'当前样本量':<15} {'所需样本量':<15}")
print("-" * 80)

for _, row in power_results.iterrows():
    level_cat = f"{row['level']}_{row['category']}"
    effect_size = row['effect_size']
    current_power = row['power']
    current_sample = row['sample_size']
    
    # 计算达到0.8功效所需的样本量
    power_analysis = TTestIndPower()
    if effect_size > 0:
        required_sample = power_analysis.solve_power(
            effect_size=effect_size, 
            power=0.8, 
            alpha=0.05, 
            ratio=1.0
        )
        required_sample = int(np.ceil(required_sample))
    else:
        required_sample = "无法计算"
    
    print(f"{level_cat:<15} {row['metric']:<10} {effect_size:<15.2f} {current_power:<15.2f} {current_sample:<15} {required_sample}")