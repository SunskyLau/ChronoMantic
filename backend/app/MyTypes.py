from dataclasses import dataclass, asdict
from enum import Enum
from typing import List, Optional
from numpy import pi


class DictMixin:
    @classmethod
    def from_dict(cls, data: dict):
        field_types = cls.__annotations__

        kwargs = {}
        for field_name, field_type in field_types.items():
            if field_name not in data:
                continue

            value = data[field_name]
            if value is None:
                kwargs[field_name] = None
            # 处理枚举类型
            elif isinstance(field_type, type) and issubclass(field_type, Enum):
                kwargs[field_name] = field_type(value)
            # 处理列表类型
            elif getattr(field_type, "__origin__", None) is list:
                item_type = field_type.__args__[0]
                if hasattr(item_type, "from_dict"):
                    kwargs[field_name] = [item_type.from_dict(item) for item in value]
                else:
                    kwargs[field_name] = value
            # 处理可选类型
            elif getattr(field_type, "__origin__", None) is Optional:
                item_type = field_type.__args__[0]
                if value is None:
                    kwargs[field_name] = None
                elif hasattr(item_type, "from_dict"):
                    kwargs[field_name] = item_type.from_dict(value)
                elif isinstance(item_type, type) and issubclass(item_type, Enum):
                    kwargs[field_name] = item_type(value)
                else:
                    kwargs[field_name] = value
            # 处理其他自定义类型
            elif hasattr(field_type, "from_dict"):
                kwargs[field_name] = field_type.from_dict(value)
            else:
                kwargs[field_name] = value

        return cls(**kwargs)

    def to_dict(self):
        return asdict(self)


class TimeGranularity(str, Enum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"


class Comparator(str, Enum):
    GREATER = ">"
    LESS = "<"
    EQUAL = "="
    NO_LESS = ">="
    NO_GREATER = "<="


@dataclass
class ValueCondition(DictMixin):
    comparator: Comparator
    value: float


@dataclass
class FrequenceAndSpan(DictMixin):
    type: str


@dataclass
class Pattern(DictMixin):
    trend: Optional[str] = None
    extent: Optional[str] = None


@dataclass
class QuerySpec(DictMixin):
    patterns: List[Pattern]
    y_max_condition: Optional[ValueCondition] = None
    y_min_condition: Optional[ValueCondition] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None


@dataclass
class Segment(DictMixin):
    start_idx: int
    end_idx: int
    slope: Optional[float] = None
    theta: Optional[float] = None
    trend: Optional[str] = None
    extent: Optional[str] = None
    sum_loss: Optional[float] = None
    r2: Optional[float] = None


@dataclass
class Fragment(DictMixin):
    start_idx: int
    end_idx: int
    segments: List[Segment]
    avg_loss: Optional[float] = None


@dataclass
class FragmentList(DictMixin):
    csv_name: str
    value_column_name: str
    time_column_name: str
    fragments: List[Fragment]


@dataclass
class TrendConfig(DictMixin):
    flat_threshold: float = pi / 18
    weak_threshold: float = pi / 6
    strong_threshold: float = pi / 3


if __name__ == "__main__":
    # 测试 QuerySpec
    query_spec_json = {
        "patterns": [{"trend": "up", "extent": "strong"}, {"trend": "down", "extent": "weak"}],
        "y_max_condition": {"comparator": ">", "value": 100.0},
        "y_min_condition": {"comparator": "<", "value": 0.0},
        "start_time": "2024-01-01",
        "end_time": "2024-12-31",
    }
    query_spec = QuerySpec.from_dict(query_spec_json)
    print("QuerySpec 转换成功:", query_spec)

    # 测试 FragmentList (更复杂的嵌套结构)
    fragment_list_json = {
        "csv_name": "test.csv",
        "value_column_name": "value",
        "time_column_name": "time",
        "fragments": [
            {"start_idx": 0, "end_idx": 10, "segments": [{"start_idx": 0, "end_idx": 5, "slope": 1.5, "theta": pi / 4, "trend": "up", "extent": "strong"}]}
        ],
    }
    fragment_list = FragmentList.from_dict(fragment_list_json)
    print("\nFragmentList 转换成功:", fragment_list)

    # 测试单个 Pattern
    pattern_json = {"trend": "up", "extent": "strong"}
    pattern = Pattern.from_dict(pattern_json)
    print("\nPattern 转换成功:", pattern)
