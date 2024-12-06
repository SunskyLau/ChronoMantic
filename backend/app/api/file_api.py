from flask import Blueprint, request, jsonify
from app.utils import process_csv_file

file_bp = Blueprint("file", __name__)


#
@file_bp.route("/upload_csv_file", methods=["POST"])
def upload_csv_file():
    """
    | 参数名 | 必填 | 类型 | 说明 |
    |--------|------|------|------|
    | file   | 是   | File | CSV文件 |
    """
    try:
        if "file" not in request.files:
            return jsonify({"code": 400, "message": "No file uploaded"}), 400

        file = request.files["file"]
        result = process_csv_file(file)

        return jsonify({"code": 200, "message": "File uploaded successfully", **result})

    except ValueError as e:
        return jsonify({"code": 400, "message": str(e)}), 400
    except Exception as e:
        return jsonify({"code": 500, "message": f"Error uploading file: {str(e)}"}), 500
