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
    start_value: float
    end_value: float
    slope: float
    angle: Optional[float] = None


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
    max_time: Optional[ThresholdCondition] = None
    min_time: Optional[ThresholdCondition] = None


@dataclass
class TimeSpanCondition(DictMixin):
    max_time_span: Optional[ThresholdCondition] = None
    min_time_span: Optional[ThresholdCondition] = None


@dataclass
class Trend(DictMixin):
    slope_condition: Optional[SlopeCondition] = None  # 斜率的范围条件
    angle_condition: Optional[AngleCondition] = None  # 角度的范围条件
    start_value_condition: Optional[ValueCondition] = None  # 起始值的范围条件
    end_value_condition: Optional[ValueCondition] = None  # 结束值的范围条件
    max_value_condition: Optional[ValueCondition] = None  # 最大值的范围条件
    min_value_condition: Optional[ValueCondition] = None  # 最小值的范围条件
    start_time_condition: Optional[TimeCondition] = None  # 起始时间的范围条件
    end_time_condition: Optional[TimeCondition] = None  # 结束时间的范围条件
    time_span_condition: Optional[TimeSpanCondition] = None  # 时间跨度的范围条件


class Attribute(Enum):
    SLOPE = "slope"
    ANGLE = "angle"
    START_VALUE = "start_value"
    END_VALUE = "end_value"
    START_TIME = "start_time"
    END_TIME = "end_time"
    MAX_VALUE = "max_value"
    MIN_VALUE = "min_value"
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
    start_time_condition: Optional[TimeCondition] = None
    end_time_condition: Optional[TimeCondition] = None
    max_value_condition: Optional[ValueCondition] = None
    min_value_condition: Optional[ValueCondition] = None


def run_tests():
    # Test DatasetInfo
    dataset_info_dict = {
        "time_column": "timestamp",
        "value_columns": ["temperature", "humidity", "pressure"],
        "column_ratio_dict": {"temperature": 0.5, "humidity": 0.3, "pressure": 0.2},
    }
    dataset_info = DatasetInfo.from_dict(dataset_info_dict)
    print("\n=== DatasetInfo Test ===")
    print("From dict:", dataset_info)
    print("To dict:", dataset_info.to_dict())

    # Test Segment and ApproximationSegments
    segment_dict = {"start_idx": 0, "end_idx": 10, "start_value": 20.5, "end_value": 25.5, "slope": 0.5, "angle": 26.57}
    segment = Segment.from_dict(segment_dict)

    approx_segments_dict = {"segments": [segment_dict, segment_dict], "approximation_level": 2}  # Two identical segments for testing
    approx_segments = ApproximationSegments.from_dict(approx_segments_dict)

    container_dict = {"source": "temperature_data", "approximation_segments_list": [approx_segments_dict], "max_approximation_level": 5}
    container = ApproximationSegmentsContainer.from_dict(container_dict)

    print("\n=== Segments Test ===")
    print("Single Segment:", segment)
    print("Approximation Segments:", approx_segments)
    print("Container:", container)

    # Test Query Components
    threshold_dict = {"value": 100.0, "inclusive": True}
    threshold = ThresholdCondition.from_dict(threshold_dict)

    slope_condition_dict = {"max_slope": threshold_dict, "min_slope": {"value": -100.0, "inclusive": False}}
    slope_condition = SlopeCondition.from_dict(slope_condition_dict)

    angle_condition_dict = {"max_angle": {"value": 45.0, "inclusive": True}, "min_angle": {"value": -45.0, "inclusive": True}}
    angle_condition = AngleCondition.from_dict(angle_condition_dict)

    value_condition_dict = {"max_value": {"value": 1000.0, "inclusive": True}, "min_value": {"value": 0.0, "inclusive": False}}
    value_condition = ValueCondition.from_dict(value_condition_dict)

    # Test Trend
    trend_dict = {
        "slope_condition": slope_condition_dict,
        "angle_condition": angle_condition_dict,
        "start_value_condition": value_condition_dict,
        "end_value_condition": value_condition_dict,
        "max_value_condition": value_condition_dict,
        "min_value_condition": value_condition_dict,
        "time_span_condition": {"max_time_span": {"value": 3600, "inclusive": True}, "min_time_span": {"value": 60, "inclusive": True}},
    }
    trend = Trend.from_dict(trend_dict)

    # Test Relation
    relation_dict = {"id1": 1, "id2": 2, "attribute": "SLOPE", "comparator": ">"}
    relation = Relation.from_dict(relation_dict)

    # Test Complete QuerySpec
    query_spec_dict = {
        "target": "temperature",
        "trends": [trend_dict],
        "relations": [relation_dict],
        "start_time_condition": {"max_time": {"value": 1640995200, "inclusive": True}, "min_time": {"value": 1640908800, "inclusive": True}},
        "max_value_condition": value_condition_dict,
    }
    query_spec = QuerySpec.from_dict(query_spec_dict)

    print("\n=== Query Components Test ===")
    print("Threshold Condition:", threshold)
    print("Slope Condition:", slope_condition)
    print("Angle Condition:", angle_condition)
    print("Value Condition:", value_condition)
    print("Trend:", trend)
    print("Relation:", relation)
    print("QuerySpec:", query_spec)
    print("\nQuerySpec dict:", query_spec.to_dict())


if __name__ == "__main__":
    run_tests()
