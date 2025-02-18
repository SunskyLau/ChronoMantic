from dataclasses import dataclass, asdict, fields
from enum import Enum
from typing import Dict, List, Optional, Tuple, Union, get_type_hints
from .DictMixin import DictMixin


"""Foundamental Data"""


@dataclass
class DatasetInfo(DictMixin):
    time_column: str
    value_columns: List[str]


@dataclass
class Segment(DictMixin):
    start_idx: int
    end_idx: int
    slope: float
    start_value: float
    end_value: float
    max_value: float
    min_value: float
    start_time: Optional[int] = None
    end_time: Optional[int] = None
    delta_percentage: Optional[float] = None
    daily_average_delta_percentage: Optional[float] = None
    abs_slope_percentage: Optional[float] = None
    time_span: Optional[int] = None

@dataclass
class SimplifiedSegment(DictMixin):
    source: str  # 片段的来源，可以是"result"或者"user"
    slope: float  # 片段的斜率，表示变化趋势
    start_value: float  # 片段起始点的值
    end_value: float  # 片段终止点的值
    start_time: Optional[int] = None  # 片段起始时间，单位是秒
    end_time: Optional[int] = None  # 片段终止时间，单位是秒
    delta_percentage: Optional[float] = None  # 片段的总体变化百分比，单位是%
    daily_average_delta_percentage: Optional[float] = None  # 片段的日均变化百分比，单位是%
    abs_slope_percentage: Optional[float] = None  # 片段斜率在所有斜率中的占比，单位是%
    time_span: Optional[int] = None  # 片段的时间跨度，单位是秒
    

@dataclass
class SegmentGroup(DictMixin):
    ids: Tuple[int, int]  # 组内趋势的id列表，ids[1]>=ids[0]
    time_span: int


@dataclass
class ApproximationSegments(DictMixin):
    segments: List[Segment]  # 近似的连续分段列表
    approximation_level: int  # 近似程度


@dataclass
class ApproximationSegmentsContainer(DictMixin):
    source: str  # 数据来源
    approximation_segments_list: List[ApproximationSegments]  # 近似的连续分段列表
    max_approximation_level: int  # 最大近似程度


"""QuerySpec"""


@dataclass
class ThresholdCondition(DictMixin):
    value: float  # 阈值
    inclusive: bool  # 是否包含该值


@dataclass
class ScopeCondition(DictMixin):
    max: Optional[ThresholdCondition] = None  # 最大值条件
    min: Optional[ThresholdCondition] = None  # 最小值条件


class TrendCategory(Enum):
    FLAT = "flat"  # 平坦
    UP = "up"  # 上升
    DOWN = "down"  # 下降
    ARBITRARY = "arbitrary"  # 任意


@dataclass
class Trend(DictMixin):
    category: TrendCategory  # 趋势类别
    slope_scope_condition: Optional[ScopeCondition] = None  # 斜率的范围条件
    delta_percentage_scope_condition: Optional[ScopeCondition] = None  # 变化率的范围条件, 单位是%, 例如70就代表70%
    daily_average_delta_percentage_scope_condition: Optional[ScopeCondition] = None  # 日平均变化率的范围条件, 单位是%/day，例如5就代表5%/day
    abs_slope_percentage_scope_condition: Optional[ScopeCondition] = None  # 斜率在所有斜率中的占比范围条件, 单位是%，例如30就代表30%
    time_span_condition: Optional[ScopeCondition] = None  # 时间跨度的范围条件, 单位是秒，例如3600就代表1小时


class SingleAttribute(Enum):
    SLOPE = "slope"  # 斜率
    START_VALUE = "start_value"  # 起始值
    END_VALUE = "end_value"  # 结束值
    TIME_SPAN = "time_span"  # 时间跨度,单位是秒
    DELTA_PERCENTAGE = "delta_percentage"  # 变化率,单位是%
    DAILY_AVERAGE_DELTA_PERCENTAGE = "daily_average_delta_percentage"  # 日均变化率,单位是%/day
    ABS_SLOPE_PERCENTAGE = "abs_slope_percentage"  # 斜率占比,单位是%


class GroupAttribute(Enum):
    TIME_SPAN = "time_span"  # 时间跨度,单位是秒


class Comparator(Enum):
    GREATER = ">"  # 大于
    LESS = "<"  # 小于
    EQUAL = "="  # 等于
    NO_GREATER = "<="  # 小于等于
    NO_LESS = ">="  # 大于等于
    APPROXIMATELY_EQUAL_TO = "~="  # 近似等于


@dataclass
class SingleRelation(DictMixin):  # 两个单趋势之间的比较关系
    id1: int  # 趋势1的id
    id2: int  # 趋势2的id
    attribute: SingleAttribute  # 比较的属性
    comparator: Comparator  # 比较关系


@dataclass
class TrendGroup(DictMixin):  # 趋势组合
    ids: Tuple[int, int]  # 组内趋势的id列表，ids[1]>=ids[0]
    time_span_condition: Optional[ScopeCondition] = None  # 该组的时间跨度条件


@dataclass
class GroupRelation(DictMixin):
    group1: Tuple[int, int]  # 第一个组合的趋势id列表
    group2: Tuple[int, int]  # 第二个组合的趋势id列表
    comparator: Comparator  # 比较关系
    attribute: GroupAttribute  # 比较的属性


@dataclass
class QuerySpec(DictMixin):
    target: str  # 查询的目标时间序列名
    trends: List[Trend]  # 趋势列表
    single_relations: List[SingleRelation]  # 不同趋势之间的属性比较关系列表
    trend_groups: List[TrendGroup]  # 趋势组合列表
    group_relations: List[GroupRelation]  # 组合之间的关系列表
    time_span_condition: Optional[ScopeCondition] = None  # 总时间跨度的范围条件
    time_scope_condition: Optional[ScopeCondition] = None  # 时间范围的范围条件
    max_value_scope_condition: Optional[ScopeCondition] = None  # 最大值的范围条件
    min_value_scope_condition: Optional[ScopeCondition] = None  # 最小值的范围条件
