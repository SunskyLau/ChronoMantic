import math
import time
import numpy as np
from fastdtw import fastdtw
import pandas as pd
from scipy.signal import find_peaks
from matplotlib import pyplot as plt


def generate_fragments_by_time_granularity(data, time_granularity=30, space_granularity=None):
    if not space_granularity:
        space_granularity = time_granularity // 3
    fragments = []
    for i in range(0, len(data), space_granularity):
        fragments.append({"start": i, "end": min(i + time_granularity, len(data) - 1), "series": data[i : min(i + time_granularity, len(data) - 1)]})
    return fragments


def generate_fragments(data):
    window_size = len(data) // 100
    extrema_based_boundaries = extrema_based_segmentation(data, window_size)
    boundaries = np.unique(
        np.concatenate(
            [
                extrema_based_boundaries,
                [0, len(data) - 1],
            ]
        )
    ).astype(int)
    boundaries = prune_boundaries(boundaries)
    fragments = []
    for i in range(len(boundaries) - 1):
        for j in range(i + 1, len(boundaries)):
            fragments.append(
                {
                    "start": int(boundaries[i]),
                    "end": int(boundaries[j]),
                    "series": data[boundaries[i] : (boundaries[j] + 1)],
                }
            )
    fragments = sorted(fragments, key=lambda x: -len(x["series"]))
    return prune_fragments(fragments, window_size, len(data) // 2)


def prune_boundaries(boundaries, min_distance=1):
    pruned_boundaries = []
    for i in range(len(boundaries) - 1):
        if boundaries[i + 1] - boundaries[i] > min_distance:
            pruned_boundaries.append(boundaries[i])
    pruned_boundaries.append(boundaries[-1])
    return pruned_boundaries


def prune_fragments(fragments, min_length=0, max_length=1e8):
    fragments = [f for f in fragments if len(f["series"]) >= min_length and len(f["series"]) < max_length]
    return fragments


def extrema_based_segmentation(data, window_size):
    peaks, _ = find_peaks(data, distance=window_size)
    valleys, _ = find_peaks(-data, distance=window_size)
    all_extrema = np.sort(np.concatenate([peaks, valleys]))
    return all_extrema


def normalize(x: np.ndarray) -> np.ndarray:
    if x.max() - x.min() == 0:
        return np.ones(len(x)) / 2
    return (x - x.min()) / (x.max() - x.min()), (x.max() - x.min()) / len(x)


extend_step = {"strong": 2, "weak": 0.25}


def query_x(trends, length):
    length = max(1, length)
    prev_end = 0
    start = 0
    x = []
    for index, trend in enumerate(trends):
        step = extend_step[trend["extend"]] if "extend" in trend else 1
        start = prev_end
        end = length if index == 0 else max(1, length - step + 1)
        if trend["trend"] == "up":
            arr = np.arange(start, end, step) + prev_end
        elif trend["trend"] == "down":
            arr = -np.arange(start, end, step) + prev_end
        elif trend["trend"] == "flat":
            arr = np.zeros(start, end, step) + prev_end
        if len(arr) == 0:
            arr = np.array([prev_end]) if trend["trend"] == "flat" else np.array([prev_end + 1]) if trend["trend"] == "up" else np.array([prev_end - 1])
        x.append(arr)
        prev_end = x[-1][-1]
    return np.concatenate(x)


def query(data, trends, max_distance=100, min_distance=0):
    fragments = generate_fragments(data)
    results = []
    for f in fragments:
        if len(f["series"]) >= max_distance or len(f["series"]) <= min_distance:
            continue
        max_length = max(1, len(f["series"]) // 4)
        x = query_x(trends, max_length)
        x, scale_x = normalize(x)
        y, scale_y = normalize(f["series"])
        x = x.reshape(-1, 1)
        y = y.reshape(-1, 1)
        x_mean = np.mean(x)
        y_mean = np.mean(y)
        x_std = np.std(x)
        y_std = np.std(y)
        if abs(x_mean - y_mean) > 0.25 or abs(x_std - y_std) > 0.25:
            continue
        distance, path = fastdtw(x, y, dist=lambda x, y: abs(x - y))
        distance = distance / math.sqrt(len(y))
        is_add = False
        for index, r in enumerate(results):
            if (r["start"] < f["end"] and r["start"] > f["start"]) or (f["start"] < r["end"] and f["end"] > r["start"]):
                if r["distance"] >= distance:
                    del results[index]
                    results.append({"distance": distance, "path": path, "series": f["series"], "start": f["start"], "end": f["end"]})
                is_add = True
                break
        if not is_add:
            results.append({"distance": distance, "path": path, "series": f["series"], "start": f["start"], "end": f["end"]})
    return sorted(results, key=lambda x: x["distance"])


def query_tree(data, trends, max_distance=90, min_distance=0):
    window_size = len(data) // 100
    extrema_based_boundaries = extrema_based_segmentation(data, window_size)
    boundaries = np.unique(np.concatenate([extrema_based_boundaries, [0, len(data) - 1]])).astype(int)
    boundaries = prune_boundaries(boundaries)
    count = 2
    results = []
    distances = [[0, len(boundaries) - 1, 0]]
    visited = set()
    while distances:
        s, e, d = distances.pop(0)
        step = (e - s) // (count + 1) or 1
        for i in range(s, e, step):
            start_index = i
            end_index = min(i + (e - s) // count, e)
            start = boundaries[start_index]
            end = boundaries[end_index]
            if start >= end or end - start <= min_distance:
                continue
            key = (start, end)
            if key in visited:
                continue
            visited.add(key)
            series = data[start:end]
            max_length = max(1, (end - start) // 4)
            x = query_x(trends, max_length)
            x, scale_x = normalize(x)
            y, scale_y = normalize(series)
            x = x.reshape(-1, 1)
            y = y.reshape(-1, 1)
            distance, path = fastdtw(x, y, dist=lambda x, y: abs(x - y))
            distance = distance / math.sqrt(len(y))
            # print(f"start: {start}, end: {end}, distance: {distance}")
            if distance <= d / 2 and end - start <= max_distance:
                results.append({"series": series, "start": start, "end": end, "distance": distance})
            else:
                distances.append([start_index, end_index, distance])
    return sorted(results, key=lambda x: x["distance"])


if __name__ == "__main__":
    csv_path = "../../portfolio_data.csv"
    df = pd.read_csv(csv_path)["AMZN"]
    data = df.values
    start = time.time()
    trends = [
        {"trend": "down"},
        {"trend": "up"},
    ]
    results = query_tree(data, trends, min_distance=7, max_distance=30)
    print(f"Time: {time.time() - start}")
    plt.plot(data)
    for result in results[:5]:
        start = result["start"]
        end = result["end"]
        print(result["distance"])
        plt.axvspan(start, end, alpha=0.1, color="red")
    plt.show()
