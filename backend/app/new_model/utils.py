import numpy as np
from ..MyTypes import Fragment
from .config import Config


def if_keep_fragment(fragment: Fragment, x: np.ndarray, y: np.ndarray, r_squared: np.ndarray) -> bool:
    """
    检查是否保留该fragment
    """
    segments = fragment.segments
    if not segments:
        return False

    # 计算每个段的x和y方向的span
    x_spans = []
    y_spans = []

    for segment in segments:
        start, end = segment.start_idx, segment.end_idx
        if r_squared[start][end] < Config.R2_THRESHOLD:
            return False
        x_span = abs(x[end] - x[start])
        y_span = max(y[start : end + 1]) - min(y[start : end + 1])
        x_spans.append(x_span)
        y_spans.append(y_span)

    # 计算最大span
    max_x_span = max(x_spans)
    max_y_span = max(y_spans)

    # 计算最小的span
    min_x_span = min(x_spans)
    min_y_span = min(y_spans)

    # 计算span比例
    x_ratio = min_x_span / max_x_span if max_x_span > 0 else 0
    y_ratio = min_y_span / max_y_span if max_y_span > 0 else 0

    return x_ratio >= Config.SPAN_THRESHOLD or y_ratio >= Config.SPAN_THRESHOLD


def precompute_residuals(x: np.ndarray, y: np.ndarray) -> tuple:
    """
    预计算所有可能区间的统计量

    Returns:
        tuple: (residuals, slopes, intercepts, r_squared)
        - residuals[i][j]: 区间[i,j]的残差和
        - slopes[i][j]: 区间[i,j]的斜率
        - intercepts[i][j]: 区间[i,j]的截距
        - r_squared[i][j]: 区间[i,j]的R²值
    """
    n = len(x)
    residuals = np.zeros((n, n))
    slopes = np.zeros((n, n))
    r_squared = np.zeros((n, n))

    for i in range(n - 1):
        for j in range(i + 1, n):
            # 提取区间数据
            x_segment = x[i : j + 1]
            y_segment = y[i : j + 1]

            # 计算斜率和截距
            dy = y[j] - y[i]
            dx = x[j] - x[i]
            k = dy / dx
            b = y[i] - k * x[i]

            # 计算拟合值
            y_fit = k * x_segment + b

            # 计算残差
            residual = np.sum(np.abs(y_segment - y_fit))

            # 计算R²
            y_mean = np.mean(y_segment)
            ss_tot = np.sum((y_segment - y_mean) ** 2)
            ss_res = np.sum((y_segment - y_fit) ** 2)
            r2 = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0

            # 对称存储所有值
            residuals[i][j] = residuals[j][i] = residual
            slopes[i][j] = slopes[j][i] = k
            r_squared[i][j] = r_squared[j][i] = r2

    return residuals, slopes, r_squared
