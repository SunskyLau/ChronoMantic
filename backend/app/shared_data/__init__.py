from typing import List, Optional
import pandas as pd

from ..ai_agent import myAIClient
from ..ai_agent.constant import Platforms, Qwen
from ..MyTypes import ApproximationSegmentsContainer, DatasetInfo


class DATASET_INFO_CONTAINER:
    def __init__(self):
        self.data: Optional[DatasetInfo] = None

    def get_data(self):
        return self.data

    def set_data(self, data):
        self.data = data


class DATASET_CONTAINER:
    def __init__(self):
        self.data: Optional[pd.DataFrame] = None

    def get_data(self):
        return self.data

    def set_data(self, data):
        self.data = data


class APPROXIMATION_SEGMENTS_CONTAINERS_CONTAINER:
    def __init__(self):
        self.data: Optional[List[ApproximationSegmentsContainer]] = None

    def get_data(self):
        return self.data

    def set_data(self, data):
        self.data = data


class SYSTEM_PROMPT_CONTAINER:
    def __init__(self):
        self.data: Optional[str] = None

    def get_data(self):
        return self.data

    def set_data(self, data):
        self.data = data


dataset_info_container = DATASET_INFO_CONTAINER()
dataset_container = DATASET_CONTAINER()
approximation_segments_containers_container = APPROXIMATION_SEGMENTS_CONTAINERS_CONTAINER()
parse_nl_system_prompt_container = SYSTEM_PROMPT_CONTAINER()
modify_nl_system_prompt_container = SYSTEM_PROMPT_CONTAINER()
parse_nl_agent = myAIClient(model=Qwen.MODELS.QWEN_MAX, platform=Platforms.QWEN)
modify_nl_agent = myAIClient(model=Qwen.MODELS.QWEN_MAX, platform=Platforms.QWEN)
