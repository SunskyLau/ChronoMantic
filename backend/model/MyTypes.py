from dataclasses import dataclass
from enum import Enum
from typing import List


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
class QuerySpec:
    trends: List[str]  # 趋势列表：["up", "down", "flat"]，代表先上升后下降最后平坦
    y_max_condition: ValueCondition  # y最大值大于或小于某个值
    y_min_condition: ValueCondition  # y最小值大于或小于某个值
    time_granularity: TimeGranularity
    start_time: str = None
    end_time: str = None
