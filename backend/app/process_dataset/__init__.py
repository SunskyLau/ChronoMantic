from typing import Dict, List, Optional
from ..MyTypes import TableInfo, TimeSeriesData


# @TODO
def process_dataset(csv, time_column_name, value_column_name, metadata_columns) -> Optional[Dict[str, TimeSeriesData]]:
    """
    Return:
        table_info: TableInfo,表头信息
        metadata_dict: Dict[str, Dict[str, List[str]]], 元数据字典索引
        time_series_dataset: Dict[str, TimeSeriesData], 时间序列数据集
    """
    table_info: TableInfo = TableInfo()
    metadata_dict: Dict[str, Dict[str, List[str]]] = {}
    time_series_dataset: Dict[str, TimeSeriesData] = {}
    return table_info, metadata_dict, time_series_dataset
