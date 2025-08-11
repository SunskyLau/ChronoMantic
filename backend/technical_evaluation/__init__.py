"""基准测试模块

该模块用于评估时间序列模式识别系统的性能。
主要功能包括：
1. 加载ground truth数据和预测结果
2. 执行各种模式查询（peak、valley、plateau等）
3. 计算IOU匹配和性能指标（Precision、Recall、F1-Score）
"""

import json
import os
import sys
from typing import List, Tuple
import pandas as pd
from datetime import datetime

# 添加父目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.query import query
from app.model import approximate_dataset
from app.MyTypes import DatasetInfo, QuerySpec, Trend, TrendCategory, SingleRelation, SingleAttribute, Comparator

# 全局配置
IOU_THRESHOLD = 0.75
results = {}


def calculate_iou(interval1: Tuple[float, float], interval2: Tuple[float, float]) -> float:
    """计算两个时间间隔的IOU (Intersection over Union)

    Args:
        interval1: 第一个时间间隔 (start_time, end_time)
        interval2: 第二个时间间隔 (start_time, end_time)

    Returns:
        IOU值，范围[0, 1]
    """
    start1, end1 = interval1
    start2, end2 = interval2

    # 计算交集
    intersection_start = max(start1, start2)
    intersection_end = min(end1, end2)
    intersection = max(0, intersection_end - intersection_start)

    # 计算并集
    union_start = min(start1, start2)
    union_end = max(end1, end2)
    union = union_end - union_start

    # 避免除零
    if union == 0:
        return 0.0

    return intersection / union


def load_ground_truth(file_path: str) -> dict:
    """加载ground truth数据

    Args:
        file_path: ground truth文件路径

    Returns:
        ground truth数据字典
    """
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def process_ground_truth(ground_truth_data: dict) -> None:
    """处理ground truth数据，将其添加到results字典中

    Args:
        ground_truth_data: 从JSON文件加载的ground truth数据
    """
    for column_annotation in ground_truth_data[0]["columnAnnotations"]:
        value_column = column_annotation["columnName"]
        if value_column not in results:
            results[value_column] = {}

        for level_annotation in column_annotation["levelAnnotations"]:
            for annotation in level_annotation["annotations"]:
                pattern_type = annotation["pattern"]
                start_time = datetime.strptime(annotation["startTime"], "%m/%d/%Y").timestamp()
                end_time = datetime.strptime(annotation["endTime"], "%m/%d/%Y").timestamp()

                if pattern_type not in results[value_column]:
                    results[value_column][pattern_type] = {"predictions": [], "ground_truths": [], "tp": 0, "fp": 0, "fn": 0}

                results[value_column][pattern_type]["ground_truths"].append((start_time, end_time))


def add_predictions_to_results(query_results: dict, pattern_type: str, df: pd.DataFrame) -> None:
    """将查询结果添加到results字典中相应的predictions中
    
    对查询结果进行过滤：
    - 过滤掉时间长度 < 数据集总跨度的1/160的结果
    - 过滤掉时间长度 > 数据集总跨度的1/3的结果
    - 过滤掉存在segment的R2<=0.5的结果

    Args:
        query_results: 查询返回的结果字典
        pattern_type: 模式类型名称
        df: 原始数据DataFrame
    """
    # 计算数据集的总时间跨度
    dataset_start_time = pd.to_datetime(df.iloc[0]["Date"]).timestamp()
    dataset_end_time = pd.to_datetime(df.iloc[-1]["Date"]).timestamp()
    total_time_span = dataset_end_time - dataset_start_time
    
    # 计算过滤阈值
    min_duration = total_time_span / 160  # 最小时间长度阈值
    max_duration = total_time_span / 3    # 最大时间长度阈值
    r2_threshold = -0.5  # R2阈值
    
    for target_name, target_results in query_results.items():
        if target_name not in results:
            results[target_name] = {}
        if pattern_type not in results[target_name]:
            results[target_name][pattern_type] = {"predictions": [], "ground_truths": [], "tp": 0, "fp": 0, "fn": 0}

        for level, sequences in target_results.items():
            for sequence in sequences:
                if sequence:  # 确保序列不为空
                    start_time = pd.to_datetime(df.iloc[sequence[0].start_idx]["Date"]).timestamp()
                    end_time = pd.to_datetime(df.iloc[sequence[-1].end_idx]["Date"]).timestamp()
                    duration = end_time - start_time
                    
                    # 检查是否存在R2值过低的segment
                    has_low_r2 = False
                    for segment in sequence:
                        if segment.r2 is not None and segment.r2 <= r2_threshold:
                            has_low_r2 = True
                            break
                    
                    # 应用所有过滤条件
                    if (min_duration <= duration <= max_duration and not has_low_r2):
                        results[target_name][pattern_type]["predictions"].append((start_time, end_time))


def find_best_matches(
    predictions: List[Tuple[float, float]], ground_truths: List[Tuple[float, float]], iou_threshold: float
) -> List[Tuple[int, int, float]]:
    """找到预测和真实标注之间的最佳匹配
    
    使用改进的贪心算法：每次选择全局IOU最大的ground_truth和prediction对

    Args:
        predictions: 预测结果列表
        ground_truths: 真实标注列表
        iou_threshold: IOU阈值

    Returns:
        匹配结果列表，每个元素为(prediction_idx, ground_truth_idx, iou_score)
    """
    matches = []
    used_predictions = set()
    used_ground_truths = set()

    while True:
        # 找到全局最大IOU的匹配对
        best_iou = 0
        best_pred_idx = -1
        best_gt_idx = -1

        for gt_idx, gt in enumerate(ground_truths):
            if gt_idx in used_ground_truths:
                continue
                
            for pred_idx, pred in enumerate(predictions):
                if pred_idx in used_predictions:
                    continue

                iou = calculate_iou(pred, gt)
                if iou >= iou_threshold and iou > best_iou:
                    best_iou = iou
                    best_pred_idx = pred_idx
                    best_gt_idx = gt_idx

        # 如果没有找到满足条件的匹配，退出循环
        if best_pred_idx == -1:
            break

        # 记录匹配并标记为已使用
        matches.append((best_pred_idx, best_gt_idx, best_iou))
        used_predictions.add(best_pred_idx)
        used_ground_truths.add(best_gt_idx)

    return matches


def calculate_matches() -> None:
    """计算所有目标和模式的匹配结果，并输出性能指标"""
    total_tp = 0
    total_fp = 0
    total_fn = 0
    
    # 用于统计各个pattern_type的总体性能
    pattern_stats = {}

    for target_name, target_results in results.items():
        for pattern_type, pattern_data in target_results.items():
            predictions = pattern_data["predictions"]
            ground_truths = pattern_data["ground_truths"]

            if not ground_truths:
                # 没有ground truth，所有predictions都是FP
                tp = 0
                fp = len(predictions)
                fn = 0
            elif not predictions:
                # 没有predictions，所有ground truths都是FN
                tp = 0
                fp = 0
                fn = len(ground_truths)
            else:
                # 找到最佳匹配
                matches = find_best_matches(predictions, ground_truths, IOU_THRESHOLD)

                tp = len(matches)
                fp = len(predictions) - tp
                fn = len(ground_truths) - tp

            # 更新结果
            pattern_data["tp"] = tp
            pattern_data["fp"] = fp
            pattern_data["fn"] = fn

            # 累计总体统计
            total_tp += tp
            total_fp += fp
            total_fn += fn
            
            # 累计各pattern_type的统计
            if pattern_type not in pattern_stats:
                pattern_stats[pattern_type] = {"tp": 0, "fp": 0, "fn": 0}
            pattern_stats[pattern_type]["tp"] += tp
            pattern_stats[pattern_type]["fp"] += fp
            pattern_stats[pattern_type]["fn"] += fn

    # 计算并输出各pattern_type的总体性能
    print(f"\n=== 各模式类型总体性能 ===")
    for pattern_type, stats in pattern_stats.items():
        tp = stats["tp"]
        fp = stats["fp"]
        fn = stats["fn"]
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        
        print(f"{pattern_type}: TP={tp}, FP={fp}, FN={fn}, P={precision:.3f}, R={recall:.3f}, F1={f1:.3f}")

    # 计算总体指标
    overall_precision = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 0
    overall_recall = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 0
    overall_f1 = 2 * overall_precision * overall_recall / (overall_precision + overall_recall) if (overall_precision + overall_recall) > 0 else 0

    print(f"\n=== 总体性能 ===")
    print(f"总计: TP={total_tp}, FP={total_fp}, FN={total_fn}")
    print(f"Precision: {overall_precision:.3f}")
    print(f"Recall: {overall_recall:.3f}")
    print(f"F1-Score: {overall_f1:.3f}")


def execute_pattern_queries(approximation_segments_containers: dict, df: pd.DataFrame) -> None:
    """执行所有模式查询并收集结果

    Args:
        approximation_segments_containers: 近似分段容器
        df: 原始数据DataFrame
    """
    targets = ["AMZN", "DPZ", "BTC", "NFLX"]

    # 1. Plateau模式查询
    plateau_query = QuerySpec(
        targets=targets,
        trends=[Trend(category=TrendCategory.UP), Trend(category=TrendCategory.FLAT), Trend(category=TrendCategory.DOWN)],
        single_relations=[],
        trend_groups=[],
        group_relations=[],
    )
    plateau_results = query(plateau_query, approximation_segments_containers, df)
    add_predictions_to_results(plateau_results, "plateau", df)

    # 2. Basin模式查询
    basin_query = QuerySpec(
        targets=targets,
        trends=[Trend(category=TrendCategory.DOWN), Trend(category=TrendCategory.FLAT), Trend(category=TrendCategory.UP)],
        single_relations=[],
        trend_groups=[],
        group_relations=[],
    )
    basin_results = query(basin_query, approximation_segments_containers, df)
    add_predictions_to_results(basin_results, "basin", df)

    # 3. Double-top模式查询
    double_tops_query = QuerySpec(
        targets=targets,
        trends=[Trend(category=TrendCategory.UP), Trend(category=TrendCategory.DOWN), Trend(category=TrendCategory.UP), Trend(category=TrendCategory.DOWN)],
        single_relations=[SingleRelation(id1=0, id2=2, attribute=SingleAttribute.END_VALUE, comparator=Comparator.APPROXIMATELY_EQUAL_TO)],
        trend_groups=[],
        group_relations=[],
    )
    double_tops_results = query(double_tops_query, approximation_segments_containers, df)
    add_predictions_to_results(double_tops_results, "double-top", df)

    # 4. Double-bottom模式查询
    double_bottoms_query = QuerySpec(
        targets=targets,
        trends=[Trend(category=TrendCategory.DOWN), Trend(category=TrendCategory.UP), Trend(category=TrendCategory.DOWN), Trend(category=TrendCategory.UP)],
        single_relations=[SingleRelation(id1=0, id2=2, attribute=SingleAttribute.END_VALUE, comparator=Comparator.APPROXIMATELY_EQUAL_TO)],
        trend_groups=[],
        group_relations=[],
    )
    double_bottoms_results = query(double_bottoms_query, approximation_segments_containers, df)
    add_predictions_to_results(double_bottoms_results, "double-bottom", df)

    # 5. Head-and-shoulders模式查询
    head_and_shoulders_query = QuerySpec(
        targets=targets,
        trends=[
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
        ],
        single_relations=[
            SingleRelation(id1=0, id2=2, attribute=SingleAttribute.END_VALUE, comparator=Comparator.LESS),
            SingleRelation(id1=2, id2=4, attribute=SingleAttribute.END_VALUE, comparator=Comparator.GREATER),
        ],
        trend_groups=[],
        group_relations=[],
    )
    head_and_shoulders_results = query(head_and_shoulders_query, approximation_segments_containers, df)
    add_predictions_to_results(head_and_shoulders_results, "head-and-shoulders", df)

    # 6. Inverted-head-and-shoulders模式查询
    inverted_head_and_shoulders_query = QuerySpec(
        targets=targets,
        trends=[
            Trend(category=TrendCategory.DOWN),
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
        ],
        single_relations=[
            SingleRelation(id1=0, id2=2, attribute=SingleAttribute.END_VALUE, comparator=Comparator.GREATER),
            SingleRelation(id1=2, id2=4, attribute=SingleAttribute.END_VALUE, comparator=Comparator.LESS),
        ],
        trend_groups=[],
        group_relations=[],
    )
    inverted_head_and_shoulders_results = query(inverted_head_and_shoulders_query, approximation_segments_containers, df)
    add_predictions_to_results(inverted_head_and_shoulders_results, "inverted-head-and-shoulders", df)

    # 7. Rising-two-tops模式查询
    rising_two_tops_query = QuerySpec(
        targets=targets,
        trends=[Trend(category=TrendCategory.UP), Trend(category=TrendCategory.DOWN), Trend(category=TrendCategory.UP), Trend(category=TrendCategory.DOWN)],
        single_relations=[SingleRelation(id1=0, id2=2, attribute=SingleAttribute.END_VALUE, comparator=Comparator.LESS)],
        trend_groups=[],
        group_relations=[],
    )
    rising_two_tops_results = query(rising_two_tops_query, approximation_segments_containers, df)
    add_predictions_to_results(rising_two_tops_results, "rising-two-tops", df)

    # 8. Falling-two-tops模式查询
    falling_two_tops_query = QuerySpec(
        targets=targets,
        trends=[Trend(category=TrendCategory.UP), Trend(category=TrendCategory.DOWN), Trend(category=TrendCategory.UP), Trend(category=TrendCategory.DOWN)],
        single_relations=[SingleRelation(id1=0, id2=2, attribute=SingleAttribute.END_VALUE, comparator=Comparator.GREATER)],
        trend_groups=[],
        group_relations=[],
    )
    falling_two_tops_results = query(falling_two_tops_query, approximation_segments_containers, df)
    add_predictions_to_results(falling_two_tops_results, "falling-two-tops", df)

    # 9. Rising-three-tops模式查询
    rising_three_tops_query = QuerySpec(
        targets=targets,
        trends=[
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
        ],
        single_relations=[
            SingleRelation(id1=0, id2=2, attribute=SingleAttribute.END_VALUE, comparator=Comparator.LESS),
            SingleRelation(id1=2, id2=4, attribute=SingleAttribute.END_VALUE, comparator=Comparator.LESS),
        ],
        trend_groups=[],
        group_relations=[],
    )
    rising_three_tops_results = query(rising_three_tops_query, approximation_segments_containers, df)
    add_predictions_to_results(rising_three_tops_results, "rising-three-tops", df)

    # 10. Falling-three-tops模式查询
    falling_three_tops_query = QuerySpec(
        targets=targets,
        trends=[
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
        ],
        single_relations=[
            SingleRelation(id1=0, id2=2, attribute=SingleAttribute.END_VALUE, comparator=Comparator.GREATER),
            SingleRelation(id1=2, id2=4, attribute=SingleAttribute.END_VALUE, comparator=Comparator.GREATER),
        ],
        trend_groups=[],
        group_relations=[],
    )
    falling_three_tops_results = query(falling_three_tops_query, approximation_segments_containers, df)
    add_predictions_to_results(falling_three_tops_results, "falling-three-tops", df)

    # 11. Rising-two-bottoms模式查询
    rising_two_bottoms_query = QuerySpec(
        targets=targets,
        trends=[Trend(category=TrendCategory.DOWN), Trend(category=TrendCategory.UP), Trend(category=TrendCategory.DOWN), Trend(category=TrendCategory.UP)],
        single_relations=[SingleRelation(id1=0, id2=2, attribute=SingleAttribute.END_VALUE, comparator=Comparator.LESS)],
        trend_groups=[],
        group_relations=[],
    )
    rising_two_bottoms_results = query(rising_two_bottoms_query, approximation_segments_containers, df)
    add_predictions_to_results(rising_two_bottoms_results, "rising-two-bottoms", df)

    # 12. Falling-two-bottoms模式查询
    falling_two_bottoms_query = QuerySpec(
        targets=targets,
        trends=[Trend(category=TrendCategory.DOWN), Trend(category=TrendCategory.UP), Trend(category=TrendCategory.DOWN), Trend(category=TrendCategory.UP)],
        single_relations=[SingleRelation(id1=0, id2=2, attribute=SingleAttribute.END_VALUE, comparator=Comparator.GREATER)],
        trend_groups=[],
        group_relations=[],
    )
    falling_two_bottoms_results = query(falling_two_bottoms_query, approximation_segments_containers, df)
    add_predictions_to_results(falling_two_bottoms_results, "falling-two-bottoms", df)

    # 13. Rising-three-bottoms模式查询
    rising_three_bottoms_query = QuerySpec(
        targets=targets,
        trends=[
            Trend(category=TrendCategory.DOWN),
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
            Trend(category=TrendCategory.UP),
        ],
        single_relations=[
            SingleRelation(id1=0, id2=2, attribute=SingleAttribute.END_VALUE, comparator=Comparator.LESS),
            SingleRelation(id1=2, id2=4, attribute=SingleAttribute.END_VALUE, comparator=Comparator.LESS),
        ],
        trend_groups=[],
        group_relations=[],
    )
    rising_three_bottoms_results = query(rising_three_bottoms_query, approximation_segments_containers, df)
    add_predictions_to_results(rising_three_bottoms_results, "rising-three-bottoms", df)

    # 14. Falling-three-bottoms模式查询
    falling_three_bottoms_query = QuerySpec(
        targets=targets,
        trends=[
            Trend(category=TrendCategory.DOWN),
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
            Trend(category=TrendCategory.UP),
            Trend(category=TrendCategory.DOWN),
            Trend(category=TrendCategory.UP),
        ],
        single_relations=[
            SingleRelation(id1=0, id2=2, attribute=SingleAttribute.END_VALUE, comparator=Comparator.GREATER),
            SingleRelation(id1=2, id2=4, attribute=SingleAttribute.END_VALUE, comparator=Comparator.GREATER),
        ],
        trend_groups=[],
        group_relations=[],
    )
    falling_three_bottoms_results = query(falling_three_bottoms_query, approximation_segments_containers, df)
    add_predictions_to_results(falling_three_bottoms_results, "falling-three-bottoms", df)


def main() -> None:
    """主函数：执行完整的基准测试流程"""
    # 1. 初始化文件路径
    script_dir = os.path.dirname(__file__)
    ground_truth_file = os.path.join(script_dir, "portfolio_data.csv_annotations_0728_filtered_iou.json")
    dataset_file_path = os.path.join(script_dir, "..", "..", "datasets", "portfolio_data.csv")

    # 2. 加载和处理ground truth数据
    ground_truth_data = load_ground_truth(ground_truth_file)
    process_ground_truth(ground_truth_data)

    # 3. 加载数据集并进行近似处理
    df = pd.read_csv(dataset_file_path)
    dataset_info = DatasetInfo(time_column="Date", value_columns=["AMZN", "DPZ", "BTC", "NFLX"])
    approximation_segments_containers = approximate_dataset(df, dataset_info)

    # 4. 执行所有模式查询
    execute_pattern_queries(approximation_segments_containers, df)

    # 5. 计算匹配结果和性能指标
    calculate_matches()

    # 6. 保存结果到JSON文件
    output_file = os.path.join(script_dir, "results.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\n结果已保存到: {output_file}")


if __name__ == "__main__":
    main()
