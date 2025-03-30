import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns

# 读取数据
df = pd.read_csv('processed_time_score_final.csv')

# 要检验的列
columns_to_test = ['ChronoMantic_time', 'Qetch_time', 'ChronoMantic_score', 'Qetch_score']

# 创建一个图形，包含QQ图和直方图
plt.figure(figsize=(15, 10))

for idx, column in enumerate(columns_to_test, 1):
    # 进行Shapiro-Wilk检验
    statistic, p_value = stats.shapiro(df[column])
    
    # 创建QQ图
    plt.subplot(2, 2, idx)
    stats.probplot(df[column], dist="norm", plot=plt)    
    plt.title(f'{column} Q-Q Plot\nShapiro-Wilk test: p={p_value:.4f}')

    # 打印检验结果
    print(f'\n{column} 的正态性检验结果：')
    print(f'Shapiro-Wilk 统计量: {statistic:.4f}')
    print(f'P值: {p_value:.4f}')
    print(f'结论: {"符合正态分布" if p_value > 0.05 else "不符合正态分布"}')

# 调整子图布局
plt.tight_layout()

# 显示图形
plt.show()