from typing import List, Tuple
import numpy as np

from .utils import if_keep_fragment, precompute_residuals
from ..MyTypes import Fragment, Segment
from ..config import Config


def calculate_fragment_segmentation_matrix(residuals: np.ndarray, x: np.ndarray, y: np.ndarray, k: int = 9):
    length = len(x)

    # 初始化DP数组
    f = np.full((length, length, k + 1), float("inf"))
    # 记录分割点路径，使用列表存储
    split_points_path_array = [[[] for _ in range(length)] for _ in range(length)]
    for i in range(length):
        split_points_path_array[i] = [{} for _ in range(length)]
        for j in range(length):
            split_points_path_array[i][j] = {m: [] for m in range(k + 1)}

    # 初始化单段情况,i,j不能相等
    for i in range(length - 1):
        for j in range(i + 1, length):
            f[i][j][1] = residuals[i][j]
            split_points_path_array[i][j][1] = []  # 单段不需要分割点

    # 动态规划: f[i][j][m]表示前i~j个点分成m段的最优得分，递推公式为：f[i][j][m] = min(f[i][p][m-1] + f[p][j][1])，其中i < p < j
    for m in range(2, k + 1):  # 段数
        for i in range(length - m):  # 起点：至少要留m个点
            for j in range(i + m, length):  # 终点：至少比起点多m个点
                for p in range(i + 1, j):  # 分割点：处于i~j之间，不包含i和j
                    # 将序列分成两部分：i~p和p~j
                    temp = f[i][p][m - 1] + f[p][j][1]
                    if temp < f[i][j][m]:
                        f[i][j][m] = temp
                        # 存储完整的分割点路径
                        split_points_path_array[i][j][m] = split_points_path_array[i][p][m - 1] + [p]

    return f, split_points_path_array


def segment_sequence(x: np.ndarray, y: np.ndarray, k: int = 9):
    """
    主函数：分割序列
    返回：分割点列表和最小残差和
    参数k必须小于等于序列长度
    """
    length = len(x)
    if k > length:
        raise ValueError("k不能大于序列长度")
    if k < 1:
        raise ValueError("k必须大于等于1")

    f, split_points_path_array = calculate_fragment_segmentation_matrix(x, y, k)

    # 直接获取最优分割点，不需要回溯
    segment_points = sorted([0] + split_points_path_array[0][length - 1][k] + [length - 1])

    return segment_points, f[0][length - 1][k]


def generate_fragments(x: np.ndarray, y: np.ndarray, k: int = 9):
    """
    生成所有片段
    """
    length = len(x)
    # 初始化fragment_matrix:fm[i][j][m]表示前i~j个点分成m段的最优分割情况下产生的Fragment
    fm = [[[None for _ in range(k + 1)] for _ in range(length)] for _ in range(length)]

    # 计算所有区间的残差和、斜率和R²
    residuals, slopes, r_squared = precompute_residuals(x, y)
    f, split_points_path_array = calculate_fragment_segmentation_matrix(residuals, x, y, k)

    kept_results: List[Tuple[int, int, int]] = []  # 根据R2和segment比例指标保留结果
    # 生成所有Fragment
    for m in range(1, k + 1):
        for i in range(length - m):
            for j in range(i + m, length):
                # 生成Fragment
                split_points = [i] + split_points_path_array[i][j][m] + [j]
                # 生成segments
                segments = []
                for p in range(len(split_points) - 1):
                    segments.append(
                        Segment(
                            start_idx=split_points[p],
                            end_idx=split_points[p + 1],
                            slope=slopes[split_points[p]][split_points[p + 1]],
                            r2=r_squared[split_points[p]][split_points[p + 1]],
                        )
                    )

                fragment = Fragment(
                    start_idx=i,
                    end_idx=j,
                    segments=segments,
                    avg_loss=f[i][j][m] / (j - i + 1),
                )
                if if_keep_fragment(fragment, x, y, r_squared):
                    kept_results.append((i, j, m))
                fm[i][j][m] = fragment

    # 根据avg_loss对kept_results排序
    kept_results = sorted(kept_results, key=lambda x: fm[x[0]][x[1]][x[2]].avg_loss)

    return fm, kept_results


# 使用示例
if __name__ == "__main__":
    import time

    # 生成示例数据
    print("生成数据...")
    x = np.linspace(0, 10, 200)
    y = np.sin(x) + np.random.normal(0, 0.1, 200)

    # 计时开始
    start_time = time.time()

    fm, kept_results = generate_fragments(x, y, k=9)

    # 计算耗时
    elapsed_time = time.time() - start_time

    print("耗时:", elapsed_time)

    for kept_result in kept_results:
        print(f"""保留片段: {kept_result}, avg_loss: {fm[kept_result[0]][kept_result[1]][kept_result[2]].avg_loss}""")
    print("共有{}个片段".format(len(kept_results)))
