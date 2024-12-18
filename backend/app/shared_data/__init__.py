from typing import Dict, Optional
from ..MyTypes import TimeSeriesData


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


table_info_container = TABLE_INFO_CONTAINER()
metadata_dict_container = METADATA_DICT_CONTAINER()
time_series_dataset_container = TIME_SERIES_DATASET_CONTAINER()
fm_dict_container = FM_DICT_CONTAINER()
