from dataclasses import dataclass, asdict, fields
from enum import Enum
from typing import Dict, List, Optional, Union, get_type_hints

"""Dataclass Mixin for JSON Serialization"""


class DictMixin:
    @classmethod
    def from_dict(cls, data: dict):
        if not data:
            return None

        field_types = get_type_hints(cls)
        kwargs = {}
        for field_name, field_type in field_types.items():
            if field_name not in data:
                continue

            value = data[field_name]
            if value is None:
                kwargs[field_name] = None
                continue

            # Handle list types
            if getattr(field_type, "__origin__", None) is list:
                item_type = field_type.__args__[0]
                if hasattr(item_type, "from_dict"):
                    kwargs[field_name] = [item_type.from_dict(item) for item in value]
                else:
                    kwargs[field_name] = value

            # Handle Union types (including Optional)
            elif getattr(field_type, "__origin__", None) is Union:
                types = [t for t in field_type.__args__ if t is not type(None)]
                if len(types) == 1:
                    item_type = types[0]
                    if hasattr(item_type, "from_dict"):
                        kwargs[field_name] = item_type.from_dict(value)
                    else:
                        kwargs[field_name] = value
                else:
                    kwargs[field_name] = value

            # Handle custom types with from_dict
            elif hasattr(field_type, "from_dict"):
                kwargs[field_name] = field_type.from_dict(value)

            # Direct assignment for other types
            else:
                kwargs[field_name] = value

        return cls(**kwargs)

    def to_dict(self):
        def serialize(obj):
            if hasattr(obj, "to_dict"):
                return obj.to_dict()
            elif isinstance(obj, list):
                return [serialize(item) for item in obj]
            return obj

        return {field.name: serialize(getattr(self, field.name)) for field in fields(self)}


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
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    angle: Optional[float] = None
    time_span: Optional[int] = None


@dataclass
class ApproximationSegments(DictMixin):
    segments: List[Segment]
    approximation_level: int


@dataclass
class ApproximationSegmentsContainer(DictMixin):
    source: str
    approximation_segments_list: List[ApproximationSegments]
    max_approximation_level: int


"""QuerySpec"""


@dataclass
class ThresholdCondition(DictMixin):
    value: float
    inclusive: bool  # 是否包含该值


@dataclass
class SlopeCondition(DictMixin):
    max_slope: Optional[ThresholdCondition] = None
    min_slope: Optional[ThresholdCondition] = None


@dataclass
class AngleCondition(DictMixin):
    max_angle: Optional[ThresholdCondition] = None
    min_angle: Optional[ThresholdCondition] = None


@dataclass
class ValueCondition(DictMixin):
    max_value: Optional[ThresholdCondition] = None
    min_value: Optional[ThresholdCondition] = None


@dataclass
class TimeCondition(DictMixin):
    start_time: Optional[ThresholdCondition] = None
    end_time: Optional[ThresholdCondition] = None


@dataclass
class TimeSpanCondition(DictMixin):
    max_time_span: Optional[ThresholdCondition] = None
    min_time_span: Optional[ThresholdCondition] = None


@dataclass
class Trend(DictMixin):
    slope_condition: Optional[SlopeCondition] = None  # 斜率的范围条件
    angle_condition: Optional[AngleCondition] = None  # 角度的范围条件
    start_end_value_condition: Optional[ValueCondition] = None  # 起止值的范围条件
    time_position_condition: Optional[TimeCondition] = None  # 起止时间的范围条件
    time_span_condition: Optional[TimeSpanCondition] = None  # 时间跨度的范围条件


class Attribute(Enum):
    SLOPE = "slope"
    ANGLE = "angle"
    START_VALUE = "start_value"
    END_VALUE = "end_value"
    TIME_SPAN = "time_span"


class Comparator(Enum):
    GREATER = ">"
    LESS = "<"
    EQUAL = "="
    NO_GREATER = "<="
    NO_LESS = ">="
    APPROXIMATELY_EQUAL_TO = "~="


@dataclass
class Relation(DictMixin):
    id1: int
    id2: int
    attribute: Attribute
    comparator: Comparator


@dataclass
class QuerySpec(DictMixin):
    target: str
    trends: Optional[List[Trend]] = None
    relations: Optional[List[Relation]] = None
    start_end_time_condition: Optional[TimeCondition] = None
    max_min_value_condition: Optional[ValueCondition] = None
