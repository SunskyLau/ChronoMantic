"""
评分函数
"""

import numpy as np


def calculate_residual(x: np.ndarray, y: np.ndarray) -> float:
    """
    计算残差
    """
    coeffs = np.polyfit(x, y, 1)
    k = coeffs[0]  # 斜率
    b = coeffs[1]  # 截距

    # 计算拟合值
    y_fit = k * x + b

    # 计算残差
    residual = np.sum(np.abs(y - y_fit))

    return residual


def scoring_r2(x: np.ndarray, y: np.ndarray):
    # 拟合直线
    coeffs = np.polyfit(x, y, 1)
    k = coeffs[0]  # 斜率
    b = coeffs[1]  # 截距

    # 计算拟合值
    y_fit = k * x + b

    # 计算R2
    y_mean = np.mean(y)
    ss_tot = np.sum((y - y_mean) ** 2)
    ss_res = np.sum((y - y_fit) ** 2)
    r2 = 1 - (ss_res / ss_tot)

    return r2


def scoring_up(x: np.ndarray, y: np.ndarray, alpha: float, r2_torelance: float = 0.8):
    """
    上升评分函数
    alpha: 横纵比-x方向单位长度所占物理长度和y方向单位长度所占物理长度的比值
    r2_torelance: R2容忍度
    """
    # 拟合直线
    # 拟合直线
    coeffs = np.polyfit(x, y, 1)
    k = coeffs[0]  # 斜率
    b = coeffs[1]  # 截距
    # 计算拟合值
    y_fit = k * x + b

    # 计算R2
    y_mean = np.mean(y)
    ss_tot = np.sum((y - y_mean) ** 2)
    ss_res = np.sum((y - y_fit) ** 2)
    r2 = 1 - (ss_res / ss_tot)

    return r2


def scoring_down(x: np.ndarray, y: np.ndarray):
    """
    下降评分函数
    """
    pass


def scoring_flat(x: np.ndarray, y: np.ndarray):
    """
    平坦评分函数
    """
    pass


def scoring_and(x: np.ndarray, y: np.ndarray):
    """
    与评分函数
    """
    pass


def scoring_or(x: np.ndarray, y: np.ndarray):
    """
    或评分函数
    """
    pass


def scoring_concat(x: np.ndarray, y: np.ndarray):
    """
    连接评分函数
    """
    pass


def scoring_theta(x: np.ndarray, y: np.ndarray):
    """
    角度评分函数
    """
    pass
