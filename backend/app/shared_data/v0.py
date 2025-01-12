from typing import Dict, Optional
from ..MyTypes_v0 import TimeSeriesData, TrendConfig


class TABLE_INFO_CONTAINER:
    def __init__(self):
        self.data = None

    def get_data(self):
        return self.data

    def set_data(self, data):
        self.data = data


class METADATA_DICT_CONTAINER:
    def __init__(self):
        self.data = None

    def get_data(self):
        return self.data

    def set_data(self, data):
        self.data = data


class TIME_SERIES_DATASET_CONTAINER:
    def __init__(self):
        self.data: Optional[Dict[str, TimeSeriesData]] = None

    def get_data(self):
        return self.data

    def set_data(self, data):
        self.data = data


class FM_DICT_CONTAINER:
    def __init__(self):
        self.data = None

    def get_data(self):
        return self.data

    def set_data(self, data):
        self.data = data


class TREND_CONFIG_CONTAINER:
    def __init__(self):
        self.data: Optional[TrendConfig] = TrendConfig()

    def get_data(self):
        return self.data

    def set_data(self, data):
        self.data = data


class WIDTH_HEIGHT_RATIO_CONTAINER:
    def __init__(self):
        self.data = 0.00001

    def get_data(self):
        return self.data

    def set_data(self, data):
        self.data = data


table_info_container = TABLE_INFO_CONTAINER()
metadata_dict_container = METADATA_DICT_CONTAINER()
time_series_dataset_container = TIME_SERIES_DATASET_CONTAINER()
fm_dict_container = FM_DICT_CONTAINER()
trend_config_container = TREND_CONFIG_CONTAINER()
width_height_ratio_container = WIDTH_HEIGHT_RATIO_CONTAINER()
