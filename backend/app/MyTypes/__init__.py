from dataclasses import dataclass, asdict, fields
from enum import Enum
from typing import Dict, List, Optional, Tuple, Union, get_type_hints
from .DictMixin import DictMixin


"""Foundamental Data"""


@dataclass
class DatasetInfo(DictMixin):
    time_column: str
    value_columns: List[str]
    column_ratio_dict: Dict[str, float]


@dataclass
class Segment(DictMixin):
    start_idx: int
    end_idx: int
    slope: float
    start_value: float
    end_value: float
    max_value: float
    min_value: float
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    delta_percentage: Optional[float] = None
    abs_slope_percentage: Optional[float] = None
    time_span: Optional[int] = None


@dataclass
class ApproximationSegments(DictMixin):  # 近似的连续分段
    segments: List[Segment]
    approximation_level: int


@dataclass
class ApproximationSegmentsContainer(DictMixin):
    source: str
    approximation_segments_list: List[ApproximationSegments]  # 近似的连续分段列表
    max_approximation_level: int


"""QuerySpec"""


@dataclass
class ThresholdCondition(DictMixin):
    value: float  # 阈值
    inclusive: bool  # 是否包含该值


@dataclass
class ScopeCondition(DictMixin):
    max: Optional[ThresholdCondition] = None  # 最大值
    min: Optional[ThresholdCondition] = None  # 最小值


@dataclass
class Trend(DictMixin):
    category: str  # "flat","up","down"
    slope_scope_condition: Optional[ScopeCondition] = None  # 斜率的范围条件
    delta_percentage_scope_condition: Optional[ScopeCondition] = None  # 变化率的范围条件
    average_delta_percentage_scope_condition: Optional[ScopeCondition] = None  # 平均变化率的范围条件
    abs_slope_percentage_scope_condition: Optional[ScopeCondition] = None  # 斜率在所有斜率中的占比范围条件
    time_span_condition: Optional[ScopeCondition] = None  # 时间跨度的范围条件


class Attribute(Enum):
    SLOPE = "slope"  # 斜率
    START_VALUE = "start_value"  # 起始值
    END_VALUE = "end_value"  # 结束值
    TIME_SPAN = "time_span"  # 时间跨度


class Comparator(Enum):
    GREATER = ">"  # 大于
    LESS = "<"  # 小于
    EQUAL = "="  # 等于
    NO_GREATER = "<="  # 小于等于
    NO_LESS = ">="  # 大于等于
    APPROXIMATELY_EQUAL_TO = "~="  # 近似等于


@dataclass
class Relation(DictMixin):  # 不同trend之间的属性比较关系
    id1: int  # 趋势1的id
    id2: int  # 趋势2的id
    attribute: Attribute  # 比较的属性
    comparator: Comparator  # 比较关系


@dataclass
class TrendTimeSpanCompositionCondition(DictMixin):  # 趋势时间跨度组合条件
    id1: int  # 趋势1的id，其中id1应该小于id2
    id2: int  # 趋势2的id，其中id1应该小于id2
    time_span_condition: ScopeCondition  # 代表从id1到id2的之间(包括id1和id2)所有趋势的总体时间跨度


@dataclass
class QuerySpec(DictMixin):
    target: str  # 查询的目标时间序列名
    trends: List[Trend]  # 趋势列表
    relations: List[Relation]  # 不同趋势之间的属性比较关系列表
    trend_time_span_composition_conditions: (
        List[TrendTimeSpanCompositionCondition] | ScopeCondition
    )  # 趋势时间跨度组合条件列表，如果为ScopeCondition，则表示所有趋势的总体时间跨度
    time_scope_condition: Optional[ScopeCondition] = None  # 搜索时间的范围条件
    max_value_scope_condition: Optional[ScopeCondition] = None  # 最大值的范围条件
    min_value_scope_condition: Optional[ScopeCondition] = None  # 最小值的范围条件
