from dataclasses import dataclass
from typing import List


@dataclass
class Segment:
    start_idx: int
    end_idx: int
    slope: float
    source: str | None = None
    angle: float | None = None
    # time_span: float
    # start_time: float
    # end_time: float
    # start_value: float
    # end_value: float


@dataclass
class SlopeCondition:
    max_slope: float | None = None
    min_slope: float | None = None


@dataclass
class AngleCondition:
    max_angle: float | None
    min_angle: float | None


@dataclass
class ValueCondition:
    max_value: float | None
    min_value: float | None


@dataclass
class TimeCondition:
    max_time: float | None
    min_time: float | None


@dataclass
class Pattern:
    slope_condition: SlopeCondition | None = None
    angle_condition: AngleCondition | None = None
    start_value: ValueCondition | None = None
    end_value: ValueCondition | None = None
    start_time: TimeCondition | None = None
    end_time: TimeCondition | None = None


@dataclass
class Relation:
    id1: int
    id2: int
    attribute: str
    operator: str


@dataclass
class QuerySpec:
    patterns: List[Pattern]
    relations: List[Relation] | None = None
