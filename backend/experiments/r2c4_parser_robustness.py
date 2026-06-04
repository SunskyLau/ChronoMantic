"""
Small parser robustness check for R2C4 rebuttal.

This script evaluates whether semantically equivalent English paraphrases
produce consistent structured QuerySpec outputs. It is intended as a
lightweight qualitative robustness analysis, not as an exhaustive benchmark.

Run from the repository root with the chi25_TSNLQ conda environment:

    conda activate chi25_TSNLQ
    python backend/experiments/r2c4_parser_robustness.py --dry-run
    python backend/experiments/r2c4_parser_robustness.py --json-format
"""

from __future__ import annotations

import argparse
import csv
import json
import logging
import re
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.ai_agent.prompts import create_parse_nl_info  # noqa: E402
from app.shared_data import parse_nl_agent  # noqa: E402
from app.utils.queryspec import fix_text_source_id  # noqa: E402


DEFAULT_DATASET_INFO = '["AMZN", "DPZ", "BTC", "NFLX"]'
DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent / "r2c4_parser_robustness_out"
COMPACT_JSON_INSTRUCTION = """
# Robustness Experiment Output Constraint
Return one complete, valid, compact JSON object only.
Do not use markdown code fences.
Do not include explanations, comments, apologies, or reasoning text.
Keep the JSON compact to avoid truncation while preserving all required fields.
"""


@dataclass
class ExpectedSpec:
    targets: Optional[List[str]] = None
    trends: Optional[List[str]] = None
    single_relations: List[Tuple[int, int, str, str]] = field(default_factory=list)
    group_relations: List[Tuple[Tuple[int, int], Tuple[int, int], str, str]] = field(default_factory=list)
    require_global_duration: bool = False
    require_comparator_between_start_end_value: Optional[str] = None
    trend_condition_requirements: Dict[int, List[str]] = field(default_factory=dict)


@dataclass
class QueryCase:
    case_id: str
    source: str
    intent: str
    expected: ExpectedSpec
    paraphrases: List[str]


def build_cases() -> List[QueryCase]:
    return [
        QueryCase(
            case_id="plateau",
            source="model_evaluation",
            intent="Plateau: rise, then flat, then decline.",
            expected=ExpectedSpec(trends=["up", "flat", "down"]),
            paraphrases=[
                "Find patterns that initially rise, then flatten, and finally decline.",
                "Find intervals where the series rises, stays flat, and then falls.",
                "Look for a pattern with an upward trend followed by a stable segment and then a downward trend.",
            ],
        ),
        QueryCase(
            case_id="basin",
            source="model_evaluation",
            intent="Basin: decline, then flat, then rise.",
            expected=ExpectedSpec(trends=["down", "flat", "up"]),
            paraphrases=[
                "Find patterns that initially decline, then flatten, and finally rise.",
                "Find intervals where the series falls, stays flat, and then rises.",
                "Look for a pattern with a downward trend followed by a stable segment and then an upward trend.",
            ],
        ),
        QueryCase(
            case_id="double_top",
            source="model_evaluation",
            intent="Double-top: two consecutive peaks with approximately equal values.",
            expected=ExpectedSpec(
                trends=["up", "down", "up", "down"],
                single_relations=[(0, 2, "end_value", "~=")],
            ),
            paraphrases=[
                "Find patterns that exhibit two consecutive peaks with approximately equal values.",
                "Find intervals with two peaks in a row where the two peak values are about the same.",
                "Look for a double-top shape where the first peak and the second peak reach approximately equal heights.",
            ],
        ),
        QueryCase(
            case_id="head_and_shoulders",
            source="model_evaluation",
            intent="Head-and-shoulders: three consecutive peaks where the middle peak is higher.",
            expected=ExpectedSpec(
                trends=["up", "down", "up", "down", "up", "down"],
                single_relations=[
                    (2, 0, "end_value", ">"),
                    (2, 4, "end_value", ">"),
                ],
            ),
            paraphrases=[
                "Find patterns that exhibit three consecutive peaks, where the middle peak is higher than the other two.",
                "Find a head-and-shoulders shape with three peaks and the center peak higher than both side peaks.",
                "Look for three consecutive peaks in which the second peak is taller than the first and third peaks.",
            ],
        ),
        QueryCase(
            case_id="rising_three_tops",
            source="model_evaluation",
            intent="Rising-three-tops: three consecutive peaks with increasing values.",
            expected=ExpectedSpec(
                trends=["up", "down", "up", "down", "up", "down"],
                single_relations=[
                    (2, 0, "end_value", ">"),
                    (4, 2, "end_value", ">"),
                ],
            ),
            paraphrases=[
                "Find patterns that exhibit three consecutive peaks with increasing values.",
                "Find intervals with three peaks in a row, where each later peak is higher than the previous one.",
                "Look for a sequence of three consecutive tops whose peak values rise from left to right.",
            ],
        ),
        QueryCase(
            case_id="falling_two_bottoms",
            source="model_evaluation",
            intent="Falling-two-bottoms: two consecutive valleys where the second valley is lower.",
            expected=ExpectedSpec(
                trends=["down", "up", "down", "up"],
                single_relations=[(0, 2, "end_value", ">")],
            ),
            paraphrases=[
                "Find patterns that exhibit two consecutive valleys with decreasing values.",
                "Find intervals with two valleys in a row where the second valley is lower than the first.",
                "Look for a double-bottom-like shape whose second bottom reaches a lower value than the first bottom.",
            ],
        ),
        QueryCase(
            case_id="target_duration_intensity",
            source="parser_feature",
            intent="Targeted query with trend intensity and duration constraints.",
            expected=ExpectedSpec(
                targets=["AMZN"],
                trends=["up", "down"],
                trend_condition_requirements={
                    0: ["relative_slope_scope_condition", "duration_condition"],
                    1: ["relative_slope_scope_condition"],
                },
            ),
            paraphrases=[
                "Find periods in AMZN where the price rises sharply for about two weeks and then falls gradually.",
                "In AMZN, look for a sharp rise lasting around two weeks followed by a gradual decline.",
                "Search AMZN for intervals with an upward trend of about two weeks that is sharp, followed by a gentle fall.",
            ],
        ),
        QueryCase(
            case_id="explicit_multi_relation",
            source="parser_feature",
            intent="Explicit relation query over repeated rising trends.",
            expected=ExpectedSpec(
                trends=["up", "up", "up"],
                single_relations=[
                    (0, 1, "relative_slope", ">"),
                    (0, 2, "duration", "~="),
                ],
            ),
            paraphrases=[
                "Find a pattern that rises, then rises again with a smaller relative slope than the first rise, and then rises once more with a duration approximately equal to the first rise.",
                "Look for three rising trends where the second rise is less steep in relative slope than the first, and the third rise lasts about as long as the first.",
                "Find intervals with an initial rise, a second rise with a smaller relative slope, and a third rise whose duration is approximately equal to the first rise.",
            ],
        ),
    ]


def remove_code_fence(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text


def extract_json_object(text: str) -> str:
    text = remove_code_fence(text)
    if text.startswith("{") and text.endswith("}"):
        return text
    start = text.find("{")
    end = text.rfind("}")
    if start >= 0 and end > start:
        return text[start : end + 1]
    return text


def parse_json_response(response_text: str) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    if not response_text:
        return None, "empty_response"
    json_text = extract_json_object(response_text)
    try:
        parsed = json.loads(json_text)
        try:
            parsed = fix_text_source_id(parsed)
        except Exception:
            pass
        return parsed, None
    except json.JSONDecodeError as exc:
        return None, f"invalid_json: {exc}"


def canonical_comparator(id1: int, id2: int, comparator: str) -> Tuple[int, int, str]:
    if comparator == "<":
        return id2, id1, ">"
    if comparator == "<=":
        return id2, id1, ">="
    if comparator in {"~=", "="} and id2 < id1:
        return id2, id1, comparator
    return id1, id2, comparator


def canonical_single_relation(rel: Dict[str, Any]) -> Optional[Tuple[int, int, str, str]]:
    try:
        id1 = int(rel["id1"])
        id2 = int(rel["id2"])
        attribute = str(rel["attribute"])
        comparator = str(rel["comparator"])
    except (KeyError, TypeError, ValueError):
        return None
    id1, id2, comparator = canonical_comparator(id1, id2, comparator)
    return id1, id2, attribute, comparator


def canonical_group_relation(rel: Dict[str, Any]) -> Optional[Tuple[Tuple[int, int], Tuple[int, int], str, str]]:
    try:
        group1 = tuple(int(v) for v in rel["group1"])
        group2 = tuple(int(v) for v in rel["group2"])
        attribute = str(rel["attribute"])
        comparator = str(rel["comparator"])
    except (KeyError, TypeError, ValueError):
        return None
    if comparator == "<":
        return group2, group1, attribute, ">"
    if comparator == "<=":
        return group2, group1, attribute, ">="
    if comparator in {"~=", "="} and group2 < group1:
        return group2, group1, attribute, comparator
    return group1, group2, attribute, comparator


def normalize_spec(spec: Dict[str, Any]) -> Dict[str, Any]:
    trends = []
    for trend in spec.get("trends", []) or []:
        category = trend.get("category", {})
        if isinstance(category, dict):
            trends.append(category.get("category"))
        else:
            trends.append(category)

    targets = []
    for target in spec.get("targets", []) or []:
        if isinstance(target, dict):
            targets.append(target.get("target"))
        else:
            targets.append(target)

    single_relations = []
    for rel in spec.get("single_relations", []) or []:
        canonical = canonical_single_relation(rel)
        if canonical is not None:
            single_relations.append(canonical)

    group_relations = []
    for rel in spec.get("group_relations", []) or []:
        canonical = canonical_group_relation(rel)
        if canonical is not None:
            group_relations.append(canonical)

    return {
        "targets": targets,
        "trends": trends,
        "single_relations": sorted(single_relations),
        "group_relations": sorted(group_relations),
        "raw": spec,
    }


def evaluate_spec(parsed: Optional[Dict[str, Any]], expected: ExpectedSpec, parse_error: Optional[str]) -> Tuple[bool, List[str], Dict[str, Any]]:
    if parse_error is not None or parsed is None:
        return False, [parse_error or "parse_error"], {}

    normalized = normalize_spec(parsed)
    failures: List[str] = []

    if expected.targets is not None and normalized["targets"] != expected.targets:
        failures.append("target_mismatch")

    if expected.trends is not None and normalized["trends"] != expected.trends:
        failures.append("trend_sequence_mismatch")

    actual_single = set(normalized["single_relations"])
    expected_single = set()
    for id1, id2, attribute, comparator in expected.single_relations:
        cid1, cid2, ccomp = canonical_comparator(id1, id2, comparator)
        expected_single.add((cid1, cid2, attribute, ccomp))
    missing_single = sorted(expected_single - actual_single)
    if missing_single:
        failures.append("relation_mismatch")

    actual_group = set(normalized["group_relations"])
    expected_group = set(expected.group_relations)
    missing_group = sorted(expected_group - actual_group)
    if missing_group:
        failures.append("group_relation_mismatch")

    raw = normalized["raw"]
    if expected.require_global_duration and "duration_condition" not in raw:
        failures.append("global_duration_missing")

    if expected.require_comparator_between_start_end_value is not None:
        comp = raw.get("comparator_between_start_end_value", {})
        actual_comp = comp.get("comparator") if isinstance(comp, dict) else None
        if actual_comp != expected.require_comparator_between_start_end_value:
            failures.append("start_end_comparator_mismatch")

    for trend_id, required_keys in expected.trend_condition_requirements.items():
        trends = raw.get("trends", []) or []
        if trend_id >= len(trends):
            failures.append(f"trend_{trend_id}_missing")
            continue
        for key in required_keys:
            if key not in trends[trend_id]:
                failures.append(f"trend_{trend_id}_{key}_missing")

    return not failures, failures, normalized


def classify_failure(failures: Iterable[str]) -> str:
    failures = list(failures)
    if not failures:
        return "pass"
    priority = [
        "empty_response",
        "invalid_json",
        "target_mismatch",
        "trend_sequence_mismatch",
        "relation_mismatch",
        "group_relation_mismatch",
        "start_end_comparator_mismatch",
        "global_duration_missing",
    ]
    for item in priority:
        if any(failure.startswith(item) for failure in failures):
            return item
    if any("duration_condition_missing" in failure for failure in failures):
        return "duration_constraint_missing"
    if any("relative_slope_scope_condition_missing" in failure for failure in failures):
        return "intensity_constraint_missing"
    return failures[0]


def build_parse_prompt(nl_query: str, dataset_info: str, retry_error: Optional[str] = None) -> str:
    parse_nl_info = create_parse_nl_info(dataset_info)
    retry_instruction = ""
    if retry_error:
        retry_instruction = f"""
# Retry Instruction
The previous output was not valid complete JSON ({retry_error}).
Regenerate the full QuerySpecWithSource as one complete JSON object only.
"""
    return parse_nl_info + COMPACT_JSON_INSTRUCTION + retry_instruction + "\n\nInput:" + nl_query + "\n\nOutput:"


def run_parser(
    nl_query: str,
    dataset_info: str,
    if_json_format: bool,
    retries: int,
) -> Tuple[str, Optional[Dict[str, Any]], Optional[str], List[Dict[str, Any]]]:
    attempts: List[Dict[str, Any]] = []
    last_response = ""
    last_error: Optional[str] = None
    parsed: Optional[Dict[str, Any]] = None

    for attempt_index in range(retries + 1):
        prompt = build_parse_prompt(nl_query, dataset_info, last_error if attempt_index > 0 else None)
        response_text = parse_nl_agent.send_prompt(prompt, if_json_format)
        parsed, error = parse_json_response(response_text)
        attempts.append(
            {
                "attempt": attempt_index + 1,
                "parse_error": error,
                "raw_response": response_text,
            }
        )
        last_response = response_text
        last_error = error
        if error is None and parsed is not None:
            return last_response, parsed, None, attempts

    return last_response, parsed, last_error, attempts


def write_outputs(results: List[Dict[str, Any]], output_dir: Path, started_at: str, dataset_info: str, if_json_format: bool, retries: int) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    raw_path = output_dir / "r2c4_parser_robustness_results.json"
    csv_path = output_dir / "r2c4_parser_robustness_summary.csv"
    md_path = output_dir / "r2c4_parser_robustness_summary.md"

    payload = {
        "started_at": started_at,
        "dataset_info": dataset_info,
        "if_json_format": if_json_format,
        "retries": retries,
        "note": "Lightweight qualitative parser robustness check for R2C4; not an exhaustive benchmark.",
        "results": results,
    }
    raw_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    fieldnames = [
        "case_id",
        "source",
        "variant_index",
        "passed",
        "format_valid",
        "attempt_count",
        "failure_class",
        "failures",
        "query",
        "parsed_targets",
        "parsed_trends",
        "parsed_single_relations",
    ]
    with csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in results:
            normalized = row.get("normalized") or {}
            writer.writerow(
                {
                    "case_id": row["case_id"],
                    "source": row["source"],
                    "variant_index": row["variant_index"],
                    "passed": row["passed"],
                    "format_valid": row["format_valid"],
                    "attempt_count": row["attempt_count"],
                    "failure_class": row["failure_class"],
                    "failures": "; ".join(row["failures"]),
                    "query": row["query"],
                    "parsed_targets": json.dumps(normalized.get("targets", []), ensure_ascii=False),
                    "parsed_trends": json.dumps(normalized.get("trends", []), ensure_ascii=False),
                    "parsed_single_relations": json.dumps(normalized.get("single_relations", []), ensure_ascii=False),
                }
            )

    total = len(results)
    passed = sum(1 for row in results if row["passed"])
    format_valid = sum(1 for row in results if row["format_valid"])
    semantic_failed = sum(1 for row in results if row["format_valid"] and not row["passed"])
    total_attempts = sum(int(row["attempt_count"]) for row in results)
    by_failure: Dict[str, int] = {}
    for row in results:
        by_failure[row["failure_class"]] = by_failure.get(row["failure_class"], 0) + 1

    lines = [
        "# R2C4 Parser Robustness Summary",
        "",
        "This is a lightweight qualitative parser robustness check, not an exhaustive benchmark.",
        "",
        f"- Started at: `{started_at}`",
        f"- Dataset info: `{dataset_info}`",
        f"- JSON response format: `{if_json_format}`",
        f"- Retries allowed for invalid JSON: `{retries}`",
        f"- Cases: `{len(set(row['case_id'] for row in results))}`",
        f"- Test queries: `{total}`",
        f"- Total LLM attempts including retries: `{total_attempts}`",
        f"- Valid JSON after retry: `{format_valid}/{total}`",
        f"- Semantic pass: `{passed}/{total}`",
        f"- Semantic failures among valid JSON outputs: `{semantic_failed}`",
        "",
        "## Failure Classes",
        "",
    ]
    for failure_class, count in sorted(by_failure.items()):
        lines.append(f"- `{failure_class}`: {count}")

    lines.extend(["", "## Per-Case Results", ""])
    for case_id in sorted(set(row["case_id"] for row in results)):
        case_rows = [row for row in results if row["case_id"] == case_id]
        case_passed = sum(1 for row in case_rows if row["passed"])
        case_valid = sum(1 for row in case_rows if row["format_valid"])
        lines.append(f"### {case_id} ({case_passed}/{len(case_rows)} semantic pass; {case_valid}/{len(case_rows)} valid JSON)")
        for row in case_rows:
            status = "PASS" if row["passed"] else "FAIL"
            lines.append(f"- {status} v{row['variant_index']} after {row['attempt_count']} attempt(s): {row['query']}")
            if row["failures"]:
                lines.append(f"  - Failures: {', '.join(row['failures'])}")
        lines.append("")

    md_path.write_text("\n".join(lines), encoding="utf-8")

    print(f"Wrote {raw_path}")
    print(f"Wrote {csv_path}")
    print(f"Wrote {md_path}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the R2C4 parser robustness check.")
    parser.add_argument("--dataset-info", default=DEFAULT_DATASET_INFO, help="JSON-like list of available time-series columns.")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR, help="Directory for output files.")
    parser.add_argument("--dry-run", action="store_true", help="List cases without calling the LLM.")
    parser.add_argument("--json-format", action="store_true", help="Request JSON response format from the LLM client.")
    parser.add_argument("--retries", type=int, default=2, help="Retry count when the response is not valid complete JSON.")
    parser.add_argument("--sleep", type=float, default=0.0, help="Seconds to sleep between parser calls.")
    args = parser.parse_args()

    logging.getLogger("VIS24_Prompt").setLevel(logging.ERROR)

    cases = build_cases()
    if args.dry_run:
        print(f"Dataset info: {args.dataset_info}")
        print(f"Cases: {len(cases)}")
        print(f"Parser calls: {sum(len(case.paraphrases) for case in cases)}")
        print(f"JSON response format: {args.json_format}")
        print(f"Retries for invalid JSON: {args.retries}")
        for case in cases:
            print(f"\n[{case.case_id}] {case.intent}")
            for idx, query in enumerate(case.paraphrases, start=1):
                print(f"  {idx}. {query}")
        return 0

    started_at = datetime.now().isoformat(timespec="seconds")
    results: List[Dict[str, Any]] = []

    for case in cases:
        for idx, query in enumerate(case.paraphrases, start=1):
            print(f"[{case.case_id} v{idx}] parsing...")
            response_text, parsed, parse_error, attempts = run_parser(query, args.dataset_info, args.json_format, args.retries)
            passed, failures, normalized = evaluate_spec(parsed, case.expected, parse_error)
            result = {
                "case_id": case.case_id,
                "source": case.source,
                "intent": case.intent,
                "variant_index": idx,
                "query": query,
                "passed": passed,
                "format_valid": parse_error is None and parsed is not None,
                "attempt_count": len(attempts),
                "failures": failures,
                "failure_class": classify_failure(failures),
                "normalized": normalized,
                "parsed": parsed,
                "raw_response": response_text,
                "attempts": attempts,
            }
            results.append(result)
            print(f"  {'PASS' if passed else 'FAIL'} after {len(attempts)} attempt(s): {result['failure_class']}")
            if args.sleep > 0:
                time.sleep(args.sleep)

    write_outputs(results, args.output_dir, started_at, args.dataset_info, args.json_format, args.retries)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
