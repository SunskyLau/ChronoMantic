# R2C4 Parser Robustness Summary

This is a lightweight qualitative parser robustness check, not an exhaustive benchmark.

- Started at: `2026-06-03T21:09:55`
- Dataset info: `["AMZN", "DPZ", "BTC", "NFLX"]`
- JSON response format: `True`
- Retries allowed for invalid JSON: `2`
- Cases: `8`
- Test queries: `24`
- Total LLM attempts including retries: `26`
- Valid JSON after retry: `24/24`
- Semantic pass: `24/24`
- Semantic failures among valid JSON outputs: `0`

## Failure Classes

- `pass`: 24

## Per-Case Results

### basin (3/3 semantic pass; 3/3 valid JSON)
- PASS v1 after 1 attempt(s): Find patterns that initially decline, then flatten, and finally rise.
- PASS v2 after 1 attempt(s): Find intervals where the series falls, stays flat, and then rises.
- PASS v3 after 1 attempt(s): Look for a pattern with a downward trend followed by a stable segment and then an upward trend.

### double_top (3/3 semantic pass; 3/3 valid JSON)
- PASS v1 after 1 attempt(s): Find patterns that exhibit two consecutive peaks with approximately equal values.
- PASS v2 after 1 attempt(s): Find intervals with two peaks in a row where the two peak values are about the same.
- PASS v3 after 1 attempt(s): Look for a double-top shape where the first peak and the second peak reach approximately equal heights.

### explicit_multi_relation (3/3 semantic pass; 3/3 valid JSON)
- PASS v1 after 1 attempt(s): Find a pattern that rises, then rises again with a smaller relative slope than the first rise, and then rises once more with a duration approximately equal to the first rise.
- PASS v2 after 1 attempt(s): Look for three rising trends where the second rise is less steep in relative slope than the first, and the third rise lasts about as long as the first.
- PASS v3 after 1 attempt(s): Find intervals with an initial rise, a second rise with a smaller relative slope, and a third rise whose duration is approximately equal to the first rise.

### falling_two_bottoms (3/3 semantic pass; 3/3 valid JSON)
- PASS v1 after 1 attempt(s): Find patterns that exhibit two consecutive valleys with decreasing values.
- PASS v2 after 2 attempt(s): Find intervals with two valleys in a row where the second valley is lower than the first.
- PASS v3 after 1 attempt(s): Look for a double-bottom-like shape whose second bottom reaches a lower value than the first bottom.

### head_and_shoulders (3/3 semantic pass; 3/3 valid JSON)
- PASS v1 after 1 attempt(s): Find patterns that exhibit three consecutive peaks, where the middle peak is higher than the other two.
- PASS v2 after 1 attempt(s): Find a head-and-shoulders shape with three peaks and the center peak higher than both side peaks.
- PASS v3 after 1 attempt(s): Look for three consecutive peaks in which the second peak is taller than the first and third peaks.

### plateau (3/3 semantic pass; 3/3 valid JSON)
- PASS v1 after 1 attempt(s): Find patterns that initially rise, then flatten, and finally decline.
- PASS v2 after 1 attempt(s): Find intervals where the series rises, stays flat, and then falls.
- PASS v3 after 1 attempt(s): Look for a pattern with an upward trend followed by a stable segment and then a downward trend.

### rising_three_tops (3/3 semantic pass; 3/3 valid JSON)
- PASS v1 after 1 attempt(s): Find patterns that exhibit three consecutive peaks with increasing values.
- PASS v2 after 1 attempt(s): Find intervals with three peaks in a row, where each later peak is higher than the previous one.
- PASS v3 after 1 attempt(s): Look for a sequence of three consecutive tops whose peak values rise from left to right.

### target_duration_intensity (3/3 semantic pass; 3/3 valid JSON)
- PASS v1 after 1 attempt(s): Find periods in AMZN where the price rises sharply for about two weeks and then falls gradually.
- PASS v2 after 1 attempt(s): In AMZN, look for a sharp rise lasting around two weeks followed by a gradual decline.
- PASS v3 after 2 attempt(s): Search AMZN for intervals with an upward trend of about two weeks that is sharp, followed by a gentle fall.
