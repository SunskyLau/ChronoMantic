import json
import os
from typing import Optional, Dict, Any
from ChronoMantic.MyTypes import Feature, Fragment, QuerySpec, Statistics
from ChronoMantic.calculate_fragment_features import calculate_fragment_features
from ChronoMantic.query import query
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from LLM_Agent.constant import SYSTEM_PROMPT, YT_GPT_4O, AZURE
from LLM_Agent.AI_agent import MyAIAgent
import io
import logging
import uuid
import numpy as np


app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def safe_get(data: Dict[str, Any], key: str, default: Any = None) -> Any:
    return data.get(key, default)


@app.route("/")
def home():
    return "Hello, Flask!"


UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route("/api/readCsv", methods=["POST"])
def upload_csv_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.endswith(".csv"):
        return jsonify({"error": "Invalid file type"}), 400

    try:
        file_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_FOLDER, file_id)
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        global df
        df = pd.read_csv(stream)
        df.to_csv(file_path, index=False)
        logger.info(f"File uploaded successfully. Shape: {df.shape}")
        return (
            jsonify(
                {
                    "message": "File uploaded successfully",
                    "shape": df.shape,
                    "id": file_id,
                }
            ),
            200,
        )
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        return jsonify({"error": "Error uploading file"}), 500


@app.route("/api/transformNL2Features", methods=["POST"])
def transformNL2Features():
    try:
        data = request.get_json()
        logger.info(f"Received data: {data}")

        if not isinstance(data, str):
            return jsonify({"error": "Invalid data format. Expected a string."}), 400

        query_answer = agent.get_chat_completion(SYSTEM_PROMPT, data)
        print(query_answer)
        # query_answer = my_ai_agent.get_chat_completion(SYSTEM_PROMPT, data, False)

        return jsonify(query_answer)
    except Exception as e:
        logger.error(f"Error in query function: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/retrieveTimeSeriesFragments", methods=["POST"])
def retrieveTimeSeriesFragments():
    pass


@app.route("/api/queryDataset", methods=["GET"])
def queryDataset():
    try:
        file_id = request.args.get("id")
        query_str = request.args.get("query")
        k = int(request.args.get("k", 5))
        if not file_id or not query_str:
            return jsonify({"error": "Missing required parameters"}), 400
        file_path = os.path.join(UPLOAD_FOLDER, file_id)
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
        FEATURE_KEYS = list(map(lambda x: f"Feature.{x}", Feature.__members__.keys()))
        prompt = (
            f"You are a text entity extraction assistant that can extract features from text. Extract the features in the following fragment descriptions according to the text. The feature needs to be limited to {FEATURE_KEYS}."
            + 'If there are something you cannot sure, ingore it. When encountering conjunctions, it represents entering the next fragment and you should ignore the conjunction in the "original" field. You need to add the data of the next fragment to the array like. Finally, output the result in JSON format. EXAMPLE: "a sharp fall and then gradually recovery", OUTPUT: {"original": ["a sharp fall", "gradually recovery"], "features": [["Feature.FALLING", "Feature.SHARP"], ["Feature.RISING", "Feature.SLIGHT"]]}.'
            + f"Question: {query_str}"
        )
        query_json = agent.get_chat_completion(
            SYSTEM_PROMPT,
            prompt,
            True,
        )
        query_json = json.loads(query_json)
        query_spec = QuerySpec(fragment_descriptions=[[eval(f) for f in features] for features in query_json["features"]])
        query_original = query_json["original"]
        df = pd.read_csv(file_path)
        results = {}
        for column in df.columns[1:]:
            try:
                ts = df[column].values
                column_results = query(ts, query_spec)
                formatted_results = [
                    {
                        "start": result[0].start,
                        "end": result[-1].end,
                        "segments": [
                            {
                                "start": segment.start,
                                "end": segment.end,
                                "features": list(map(lambda x: x.value, segment.features)),
                            }
                            for segment in result
                        ],
                    }
                    for result in column_results[:k]
                ]
                if formatted_results:
                    results[column] = formatted_results

            except Exception as e:
                logger.warning(f"Error processing column {column}: {str(e)}")
                continue

        return (
            jsonify(
                {
                    "results": results,
                    "trend": query_original,
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error retrieving time series fragments: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/queryTS", methods=["POST"])
def queryTS():
    try:
        ts = request.get_json()
        fragments = [
            Fragment(
                start=0,
                end=len(t) - 1,
                series=t,
                scores={
                    Feature.RISING: None,
                    Feature.FALLING: None,
                    Feature.CONSTANT: None,
                    Feature.SHARP: None,
                    Feature.SLIGHT: None,
                },
                statistics=Statistics(),
                features=[],
            )
            for t in ts
        ]
        featured_fragments = calculate_fragment_features(fragments)
        result = [list(map(lambda x: x.value, fragment.features)) for fragment in featured_fragments]
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error parsing JSON data: {str(e)}")
        return jsonify({"error": "Invalid JSON data"}), 400


if __name__ == "__main__":
    agent = MyAIAgent()
    df: Optional[pd.DataFrame] = None
    app.run(debug=True)
