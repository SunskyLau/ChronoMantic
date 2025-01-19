from flask import Blueprint, request, jsonify
from app.utils import process_csv_file
from app.process_dataset import process_dataset
from ..MyTypes_v1 import DatasetInfo
from ..model_v2 import approximate_dataset

# from app.shared_data import table_info_container, metadata_dict_container, time_series_dataset_container, fm_dict_container
from ..shared_data import dataset_info_container, dataset_container, approximation_segments_containers_container

file_bp = Blueprint("file", __name__)


@file_bp.route("/upload_csv_file", methods=["POST"])
def upload_csv_file():
    """
    | 参数名       | 必填 | 类型 | 说明       |
    |--------------|------|------|------------|
    | file         | 是   | File | CSV文件    |
    | dataset_info | 是   | JSON | 数据集信息 |
    return:
    code: 状态码
    """
    try:
        if "file" not in request.files:
            return jsonify({"code": 400, "message": "No file uploaded"}), 400

        file = request.files["file"]

        # 处理文件和数据集信息
        df, result = process_csv_file(file)

        # 保存数据到shared_data
        dataset_container.set_data(df)

        return jsonify({"code": 200, "message": "File uploaded successfully", **result})

    except ValueError as e:
        return jsonify({"code": 400, "message": str(e)}), 400
    except Exception as e:
        return jsonify({"code": 500, "message": f"Error uploading file: {str(e)}"}), 500


@file_bp.route("/process_dataset", methods=["POST"])
def process_dataset():
    dataset_info = DatasetInfo.from_dict(request.json.get("datasetInfo"))
    dataset_info_container.set_data(dataset_info)
    dataset = dataset_container.get_data()
    approxiamation_segments_containers = approximate_dataset(dataset, dataset_info)
    approximation_segments_containers_container.set_data(approxiamation_segments_containers)
    # 将List[ApproximationSegmentsContainer]转换为可序列化的格式
    serialized_containers = [container.to_dict() for container in approxiamation_segments_containers]
    print(approxiamation_segments_containers)
    return jsonify({"code": 200, "message": "Dataset processed successfully", "approximationSegmentsContainers": serialized_containers})


# @file_bp.route("/process_dataset", methods=["POST"])
# def process_dataset_fn():
#     """
#     | 参数名 | 必填 | 类型 | 说明 |
#     |--------|------|------|------|
#     | csv | 是 | str | CSV文件内容 |
#     | time_column_name | 是 | str | 时间列名 |
#     | value_column_name | 是 | str | 值列名 |
#     | metadata_columns | 是 | list[str] | 元数据列名 |
#     return:
#         code: 状态码
#     """
#     csv_name: str = request.json.get("csvName")
#     time_column_name: str = request.json.get("timeColumnName")
#     value_column_name: str = request.json.get("valueColumnName")
#     id_column_name: str = request.json.get("idColumnName")

#     # Process the dataset to get table_info, metadata_dict, time_series_dataset
#     table_info, metadata_dict, time_series_dataset, fm_dict = process_dataset(csv_name, time_column_name, value_column_name, id_column_name)

#     # Save the processed data to shared_data
#     table_info_container.set_data(table_info)
#     metadata_dict_container.set_data(metadata_dict)
#     time_series_dataset_container.set_data(time_series_dataset)
#     fm_dict_container.set_data(fm_dict)

#     return jsonify({"tableInfo": table_info.to_dict(), "metadataDict": metadata_dict, "timeSeriesDataset": time_series_dataset})
