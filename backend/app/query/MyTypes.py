from dataclasses import dataclass
from enum import Enum
from typing import List
from numpy import pi


class TimeGranularity(Enum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"


class Comparator(Enum):
    GREATER = ">"
    LESS = "<"
    EQUAL = "="
    NO_LESS = ">="
    NO_GREATER = "<="


@dataclass
class ValueCondition:
    comparator: Comparator
    value: float


@dataclass
class FrequenceAndSpan:
    type: str  # 类型：真实世界频率还是自定义频率


@dataclass
class Pattern:
    trend: str | None  # 趋势: up, down, flat
    extent: str | None  # 程度：strong, moderate, weak


@dataclass
class QuerySpec:
    value_column_name: str  # 数值列名
    time_stamp_column_name: str  # 时间戳列名
    patterns: List[Pattern]  # 趋势列表：["up", "down", "flat"]，代表先上升后下降最后平坦
    y_max_condition: ValueCondition  # y最大值大于或小于某个值
    y_min_condition: ValueCondition  # y最小值大于或小于某个值
    time_granularity: TimeGranularity
    start_time: str | None
    end_time: str | None


@dataclass
class Segment:
    start_idx: int
    end_idx: int
    slope: float  # 斜率
    theta: float | None  # 角度
    trend: str | None  # 趋势
    extent: str | None  # 程度：strong, moderate, weak


@dataclass
class Fragment:
    column_name: str
    start_idx: int
    end_idx: int
    segments: List[Segment]


@dataclass
class TrendConfig:
    flat_threshold: float = pi / 18
    weak_threshold: float = pi / 6
    strong_threshold: float = pi / 3
