from typing import List, Optional
import pandas as pd

from ..ai_agent import myAIClient
from ..ai_agent.constant import Platforms, Qwen, GroqPlatform
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


dataset_info_container = DATASET_INFO_CONTAINER()
dataset_container = DATASET_CONTAINER()
approximation_segments_containers_container = APPROXIMATION_SEGMENTS_CONTAINERS_CONTAINER()
# parse_nl_agent = myAIClient(model=Qwen.MODELS.QWEN_MAX, platform=Platforms.QWEN)
# modify_nl_agent = myAIClient(model=Qwen.MODELS.QWEN_MAX, platform=Platforms.QWEN)
# parse_nl_agent = myAIClient(model=GroqPlatform.MODELS.LLAMA3_3, platform=Platforms.GROQ)
# modify_nl_agent = myAIClient(model=GroqPlatform.MODELS.LLAMA3_3, platform=Platforms.GROQ)
parse_nl_agent = myAIClient(model=GroqPlatform.MODELS.QWEN2_5_32B, platform=Platforms.GROQ)
modify_nl_agent = myAIClient(model=GroqPlatform.MODELS.QWEN2_5_32B, platform=Platforms.GROQ)
