from dataclasses import dataclass, asdict, fields
from typing import List, Optional, Union, get_type_hints


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


@dataclass
class DatasetInfo(DictMixin):
    time_column: str
    value_columns: List[str]
    column_ratio_dict: dict[str, float]


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


@dataclass
class SlopeCondition(DictMixin):
    max_slope: Optional[float] = None
    min_slope: Optional[float] = None


@dataclass
class AngleCondition(DictMixin):
    max_angle: Optional[float]
    min_angle: Optional[float]


@dataclass
class ValueCondition(DictMixin):
    max_value: Optional[float]
    min_value: Optional[float]


@dataclass
class TimeCondition(DictMixin):
    max_time: Optional[float]
    min_time: Optional[float]


@dataclass
class Pattern(DictMixin):
    slope_condition: Optional[SlopeCondition] = None
    angle_condition: Optional[AngleCondition] = None
    start_value_condition: Optional[ValueCondition] = None
    end_value_condition: Optional[ValueCondition] = None
    start_time_condition: Optional[TimeCondition] = None
    end_time_condition: Optional[TimeCondition] = None


@dataclass
class Relation(DictMixin):
    id1: int
    id2: int
    attribute: str  # "angle" or "start_value" or "end_value"
    operator: str  # "greater" or "less" or "approximately_equal_to"


@dataclass
class QuerySpec(DictMixin):
    target: str  # The target column to query
    patterns: List[Pattern]
    relations: Optional[List[Relation]] = None


if __name__ == "__main__":
    # Test DatasetInfo
    dataset_info_json = {"time_column": "timestamp", "value_columns": ["temperature", "humidity", "pressure"]}

    dataset_info = DatasetInfo.from_dict(dataset_info_json)
    print("DatasetInfo from JSON:", dataset_info)
    print("\nDatasetInfo to JSON:", dataset_info.to_dict())
    
    # Test examples
    query_spec_json = {
        "patterns": [
            {
                "slope_condition": {"max_slope": 1.0, "min_slope": -1.0},
                "angle_condition": {"max_angle": 45.0, "min_angle": -45.0},
                "start_value": {"max_value": 100.0, "min_value": 0.0},
            }
        ],
        "relations": [{"id1": 1, "id2": 2, "attribute": "slope", "operator": "greater"}],
    }

    query_spec = QuerySpec.from_dict(query_spec_json)
    print("QuerySpec from JSON:", query_spec)
    print("\nQuerySpec to JSON:", query_spec.to_dict())

    segments_container_json = {
        "source": "test_data",
        "approximation_segments_list": [{"segments": [{"start_idx": 0, "end_idx": 5, "slope": 1.5, "angle": 30.0}], "approximation_level": 1}],
        "max_approximation_level": 3,
    }

    container = ApproximationSegmentsContainer.from_dict(segments_container_json)
    print("\nContainer from JSON:", container)
    print("\nContainer to JSON:", container.to_dict())
