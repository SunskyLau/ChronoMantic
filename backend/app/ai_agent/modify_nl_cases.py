from app.utils.queryspec import get_segment_info, modify_queryspec_by_intentions
from .constant import FUZZY_FACTOR

# case3 = {
#     "old_queryspec_with_source": None,
#     "segments": [
#         {
#             "duration": 259200,
#             "end_idx": 3,
#             "end_time": 1367798400,
#             "end_value": 255.720001,
#             "max_value": 258.049988,
#             "min_value": 255.720001,
#             "r2": 1,
#             "relative_slope": 0.5573065563499661,
#             "score": 1,
#             "slope": -0.000008989147376543166,
#             "source": "user",
#             "start_idx": 2,
#             "start_time": 1367539200,
#             "start_value": 258.049988,
#         },
#         {
#             "duration": 86400,
#             "end_idx": 4,
#             "end_time": 1367884800,
#             "end_value": 257.730011,
#             "max_value": 257.730011,
#             "min_value": 255.720001,
#             "r2": 1,
#             "relative_slope": 1.4423150232112851,
#             "score": 1,
#             "slope": 0.00002326400462962956,
#             "source": "user",
#             "start_idx": 3,
#             "start_time": 1367798400,
#             "start_value": 255.720001,
#         },
#         {
#             "duration": 86400,
#             "end_idx": 5,
#             "end_time": 1367971200,
#             "end_value": 258.679993,
#             "max_value": 258.679993,
#             "min_value": 257.730011,
#             "r2": 1,
#             "relative_slope": 0.6816748724535481,
#             "score": 1,
#             "slope": 0.00001099516203703743,
#             "source": "user",
#             "start_idx": 4,
#             "start_time": 1367884800,
#             "start_value": 257.730011,
#         },
#         {
#             "duration": 86400,
#             "end_idx": 6,
#             "end_time": 1368057600,
#             "end_value": 260.160004,
#             "max_value": 260.160004,
#             "min_value": 258.679993,
#             "r2": 1,
#             "relative_slope": 1.0620057113237993,
#             "score": 1,
#             "slope": 0.000017129756944444334,
#             "source": "user",
#             "start_idx": 5,
#             "start_time": 1367971200,
#             "start_value": 258.679993,
#         },
#         {
#             "duration": 86400,
#             "end_idx": 7,
#             "end_time": 1368144000,
#             "end_value": 263.630005,
#             "max_value": 263.630005,
#             "min_value": 260.160004,
#             "r2": 1,
#             "relative_slope": 2.489955061347034,
#             "score": 1,
#             "slope": 0.00004016204861111074,
#             "source": "user",
#             "start_idx": 6,
#             "start_time": 1368057600,
#             "start_value": 260.160004,
#         },
#         {
#             "duration": 259200,
#             "end_idx": 8,
#             "end_time": 1368403200,
#             "end_value": 264.51001,
#             "max_value": 264.51001,
#             "min_value": 263.630005,
#             "r2": 1,
#             "relative_slope": 0.2104872499806979,
#             "score": 1,
#             "slope": 0.0000033950810185186716,
#             "source": "user",
#             "start_idx": 7,
#             "start_time": 1368144000,
#             "start_value": 263.630005,
#         },
#     ],
#     "intentions": {"single_segment_intentions": [], "segment_group_intentions": [], "single_relation_intentions": [], "group_relation_intentions": []},
# }

# case3["segments"] = get_segment_info(case3["segments"])
# case3["new_queryspec_with_source_without_text_sources"] = modify_queryspec_by_intentions(
#     case3["old_queryspec_with_source"], case3["segments"], case3["intentions"]
# )
# print(case3["new_queryspec_with_source_without_text_sources"])


class ModifyNL_Cases:
    case1 = """Input:
old_queryspec_with_source
```{
  "group_relations": [],
  "original_text": "find a double top trend",
  "single_relations": [
    {
      "attribute": "end_value",
      "comparator": "~=",
      "id1": 0,
      "id2": 2,
      "text_source_id": 0
    }
  ],
  "targets": [],
  "text_sources": [
    {
      "index": 0,
      "text": "double top"
    }
  ],
  "trend_groups": [],
  "trends": [
    {
      "category": {
        "category": "up",
        "text_source_id": 0
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 0
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 0
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 0
      }
    }
  ]
}
```

new_queryspec_with_source_without_text_sources
```
{
  "group_relations": [],
  "original_text": "",
  "single_relations": [{'attribute': 'end_value', 'comparator': '~=', 'id1': 2, 'id2': 4}],
  "targets": [],
  "text_sources": [],
  "trend_groups": [],
  "trends": [{'category': {'category': 'down'}}, {'category': {'category': 'up'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}}
}
```

intentions
```
{
  "single_segment_intentions": [
    { "id": 0, "single_choices": ["user"] },
    { "id": 1, "single_choices": ["user"] },
    { "id": 2, "single_choices": ["result"] },
    { "id": 3, "single_choices": ["result"] },
    { "id": 4, "single_choices": ["result"] },
    { "id": 5, "single_choices": ["result"] }
  ],
  "segment_group_intentions": [],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

Explanation:
1. Analyze input data:
  - old_queryspec_with_source contains the original "double top" pattern
  - new_queryspec_with_source_without_text_sources contains six trend segments
  - intentions show the source of the trend segments (user/result)

2. Analyze the source of trend segments:
  - id 0-1: A new trend specified by the user
  - id 2-5: Marked as result, matching the original double top pattern

3. Analyze relationships:
    - single_relations remain unchanged because they originate from the original double top pattern
    - text_source_id needs to be updated to match the new text sources

4. Generate natural language description:
  - Beginning: Describe the upward trend specified by the user
  - Middle: Retain the description of the original double top pattern

Output:
{
  "original_text": "find a rising trend then falls followed by a double top trend",
  "text_sources": [
    {
      "index": 0,
      "text": "rising trend"
    },
    {
      "index": 0,
      "text": "falls"
    },
    {
      "index": 0,
      "text": "double top"
    }
  ],
  "single_relations": [
    {
      "attribute": "end_value",
      "comparator": "~=",
      "id1": 2,
      "id2": 4,
      "text_source_id": 2
    }
  ],
  "targets": [],
  "trend_groups": [],
  "group_relations": [],
  "trends": [
    {
      "category": {
        "category": "up",
        "text_source_id": 0
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 1
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 2
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 2
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 2
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 2
      }
    }
  ]
}
    """

    case2 = """Input:
old_queryspec_with_source
```
{
  "group_relations": [],
  "original_text": "find a head-and-shoulders shape",
  "single_relations": [
      {"attribute": "end_value", "comparator": "<", "id1": 0, "id2": 2, "text_source_id": 0},
      {"attribute": "end_value", "comparator": ">", "id1": 2, "id2": 4, "text_source_id": 0},
  ],
  "targets": [],
  "text_sources": [{"index": 0, "text": "head-and-shoulders"}],
  "trend_groups": [],
  "trends": [
      {"category": {"category": "up", "text_source_id": 0}},
      {"category": {"category": "down", "text_source_id": 0}},
      {"category": {"category": "up", "text_source_id": 0}},
      {"category": {"category": "down", "text_source_id": 0}},
      {"category": {"category": "up", "text_source_id": 0}},
      {"category": {"category": "down", "text_source_id": 0}},
  ]
}
```

new_queryspec_with_source_without_text_sources
```
{'group_relations': [], 'original_text': '', 'single_relations': [{'attribute': 'end_value', 'comparator': '<', 'id1': 2, 'id2': 4}, {'attribute': 'end_value', 'comparator': '>', 'id1': 4, 'id2': 6}], 'targets': [], 'text_sources': [], 'trend_groups': [], 'trends': [{'category': {'category': 'up'}}, {'category': {'category': 'down'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}, {'category': {'category': 'up'}}]}
```

intentions
```
{
  "single_segment_intentions": [
    { "id": 0, "single_choices": ["user"] },
    { "id": 1, "single_choices": ["user"] },
    { "id": 2, "single_choices": ["result"] },
    { "id": 3, "single_choices": ["result"] },
    { "id": 4, "single_choices": ["result"] },
    { "id": 5, "single_choices": ["result"] },
    { "id": 6, "single_choices": ["result"] },
    { "id": 7, "single_choices": ["result"] },
    { "id": 8, "single_choices": ["user"] }
  ],
  "segment_group_intentions": [],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

Explanation:
1. Analyze input data:
   - old_queryspec_with_source contains the original "head-and-shoulders" pattern
   - new_queryspec_with_source_without_text_sources contains nine trend segments
   - intentions show the source of the trend segments (user/result)

2. Analyze the source of trend segments:
   - id 0-1: New trends specified by the user
   - id 2-7: Marked as result, matching the original head-and-shoulders pattern
   - id 8: A new trend specified by the user

3. Analyze relationships:
   - single_relations remain unchanged because they originate from the original head-and-shoulders pattern
   - text_source_id needs to be updated to match the new text sources

4. Generate natural language description:
   - Beginning: Describe the upward and downward trends specified by the user
   - Middle: Retain the description of the original head-and-shoulders pattern
   - End: Describe the upward trend specified by the user

Output:
{
  "original_text": "find a trend that rises, then falls, followed by a head-and-shoulders shape, and ending with a final rise",
  "targets": [],
  "text_sources": [
    {"index": 0, "text": "rises"},
    {"index": 0, "text": "falls"},
    {"index": 0, "text": "head-and-shoulders"},
    {"index": 0, "text": "rise"}
  ],
  "trends": [
    {"category": {"category": "up", "text_source_id": 0}},
    {"category": {"category": "down", "text_source_id": 1}},
    {"category": {"category": "up", "text_source_id": 2}},
    {"category": {"category": "down", "text_source_id": 2}},
    {"category": {"category": "up", "text_source_id": 2}},
    {"category": {"category": "down", "text_source_id": 2}},
    {"category": {"category": "up", "text_source_id": 2}},
    {"category": {"category": "down", "text_source_id": 2}},
    {"category": {"category": "up", "text_source_id": 3}}
  ],
  "trend_groups": [],
  "single_relations": [
      {"attribute": "end_value", "comparator": "<", "id1": 2, "id2": 4, "text_source_id": 2},
      {"attribute": "end_value", "comparator": ">", "id1": 4, "id2": 6, "text_source_id": 2},
  ],
  "group_relations": []
}
"""

    case3 = """Input:
old_queryspec_with_source
```
null
```
new_queryspec_with_source_without_text_sources
```
{'original_text': '', 'text_sources': [], 'targets': [], 'trends': [{'category': {'category': 'down'}}, {'category': {'category': 'up'}}, {'category': {'category': 'up'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}], 'single_relations': [], 'trend_groups': [{'ids': [1, 3], 'duration_condition': {'min': {'value': '22.5', 'inclusive': true}, 'max': {'value': '27.5', 'inclusive': true}, 'unit': 'day'}}], 'group_relations': []}
```

intentions
```
{
  "single_segment_intentions": [
    { "id": 0, "single_choices": ["user"] },
    { "id": 1, "single_choices": ["user"] },
    { "id": 2, "single_choices": ["user"] },
    { "id": 3, "single_choices": ["user"] },
    { "id": 4, "single_choices": ["user"] }
  ],
  "segment_group_intentions": [
    { "ids": [1, 3], "group_choices": ["duration"] }
  ],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

Explanation:
1. `rises` is different from `rise`, so we need to set `index` separately for `rises` and `rise`.
2. `falls` is different from `drop`, so we need to set `index` separately for `falls` and `drop`.

Output:
{
  "original_text": "Look for a trend that first falls, then rises, followed by a rise, and finally rises again, and these three trends last about 25 days in total, ending with a final drop.",
  "text_sources": [
    {
      "index": 0,
      "text": "falls"
    },
    {
      "index": 0,
      "text": "rises"
    },
    {
      "index": 0,
      "text": "rise"
    },
    {
      "index": 1,
      "text": "rises"
    },
    {
      "index": 0,
      "text": "about 25 days"
    },
    {
      "index": 0,
      "text": "drop"
    }
  ],
  "targets": [],
  "trends": [
    {
      "category": {
        "category": "down",
        "text_source_id": 0
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 1
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 2
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 5
      }
    }
  ],
  "trend_groups": [
    {
      "ids": [1, 3],
      "duration_condition": {
        "min": { "value": "22.5", "inclusive": true },
        "max": { "value": "27.5", "inclusive": true },
        "unit": "day",
        "text_source_id": 4
      }
    }
  ],
  "single_relations": [],
  "group_relations": []
}
"""

    case4 = """Input:
old_queryspec_with_source
```
null
```

new_queryspec_with_source_without_text_sources
```
{'original_text': '', 'text_sources': [], 'targets': [], 'trends': [{'category': {'category': 'up'}}, {'category': {'category': 'down'}, 'slope_scope_condition': {'max': {'value': -28.24, 'inclusive': True}, 'min': {'value': -34.52, 'inclusive': True}, 'unit': 'week'}, 'duration_condition': {'max': {'value': 5.5, 'inclusive': True}, 'min': {'value': 4.5, 'inclusive': True}, 'unit': 'week'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}], 'single_relations': [{'id1': 0, 'id2': 2, 'attribute': 'relative_slope', 'comparator': '>'}], 'trend_groups': [{'ids': [0, 3], 'duration_condition': {'max': {'value': 47.3, 'inclusive': True}, 'min': {'value': 38.7, 'inclusive': True}, 'unit': 'week'}}], 'group_relations': [{'group1': [0, 1], 'group2': [2, 3], 'attribute': 'duration', 'comparator': '<'}]}
```

intentions
```
{
  "single_segment_intentions": [{"id": 0, "single_choices": ["user"]}, {"id": 1, "single_choices": ["user"]}, {"id": 2, "single_choices": ["user"]}, {"id": 3, "single_choices": ["user"]}],
  "segment_group_intentions": [{"ids": [0, 3], "group_choices": ["duration"]}],
  "single_relation_intentions": [{"id1": 0, "id2": 2, "relation_choices": ["relative_slope"]}],
  "group_relation_intentions": [{"group1": [0, 1], "group2": [2, 3], "relation_choices": ["duration"]}]
}
```

Output:
{
  "original_text": "find a trend that rises, then falls with a slope between -34.52 and -28.24 per week over about 5 weeks, then rises again, and finally falls, where the first trend's relative slope is greater than the third trend's and the total duration of the first trend to the last trend is about 43 weeks, while the duration of the first two trends is shorter than the duration of the last two trends",
  "targets": [],
  "text_sources": [
    {"index": 0, "text": "rises"},
    {"index": 0, "text": "falls"},
    {"index": 0, "text": "a slope between -34.52 and -28.24 per week"},
    {"index": 0, "text": "over about 5 weeks"},
    {"index": 1, "text": "rises"},
    {"index": 1, "text": "falls"},
    {"index": 0, "text": "the first trend's relative slope is greater than the third trend's"},
    {"index": 0, "text": "total duration of the first trend to the last trend is about 43 weeks"},
    {"index": 0, "text": "the duration of the first two trends is shorter than the duration of the last two trends"},
  ],
  "trends": [
    {"category": {"category": "up", "text_source_id": 0}},
    {
      "category": {"category": "down", "text_source_id": 1},
      "duration_condition": {"max": {"inclusive": true, "value": 5.5}, "min": {"inclusive": true, "value": 4.5}, "text_source_id": 3, "unit": "week"},
      "slope_scope_condition": {
        "max": {"inclusive": true, "value": -28.24},
        "min": {"inclusive": true, "value": -34.52},
        "text_source_id": 2,
        "unit": "week",
      },
    },
    {"category": {"category": "up", "text_source_id": 4}},
    {"category": {"category": "down", "text_source_id": 5}}
  ],
  "trend_groups": [
    {
      "ids": [0, 3],
      "duration_condition": {"max": {"inclusive": True, "value": 47.3}, "min": {"inclusive": True, "value": 38.7}, "text_source_id": 7, "unit": "week"}
    }
  ],
  "single_relations": [{"attribute": "relative_slope", "comparator": ">", "id1": 0, "id2": 2, "text_source_id": 6}],
  "group_relations": [{"attribute": "duration", "comparator": "<", "group1": [0, 1], "group2": [2, 3], "text_source_id": 8}]
}
    """

    case5 = """Input:
old_queryspec_with_source
```
null
```

new_queryspec_with_source_without_text_sources
```
{'original_text': '', 'text_sources': [], 'targets': [], 'trends': [{'category': {'category': 'down'}}, {'category': {'category': 'up'}}, {'category': {'category': 'up'}}, {'category': {'category': 'up'}}, {'category': {'category': 'up'}}, {'category': {'category': 'up'}}], 'single_relations': [], 'trend_groups': [], 'group_relations': []}
```

intentions
```
{
  "single_segment_intentions": [{"id": 0, "single_choices": ["user"]}, {"id": 1, "single_choices": ["user"]}, {"id": 2, "single_choices": ["user"]}, {"id": 3, "single_choices": ["user"]}, {"id": 4, "single_choices": ["user"]}, {"id": 5, "single_choices": ["user"]}],
  "segment_group_intentions": [],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

Output:
{
  "original_text": "Look for a trend that first falls, then rises, followed by a rise, then rises again, then with a another rise, finally ending with a final rise.",
  "text_sources": [
    {
      "index": 0,
      "text": "falls"
    },
    {
      "index": 0,
      "text": "rises"
    },
    {
      "index": 0,
      "text": "rise"
    },
    {
      "index": 1,
      "text": "rises"
    },
    {
      "index": 1,
      "text": "rise"
    },
    {
      "index": 2,
      "text": "rise"
    }
  ],
  "targets": [],
  "trends": [
    {
      "category": {
        "category": "down",
        "text_source_id": 0
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 1
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 2
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 4
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 5
      }
    }
  ],
  "trend_groups": [],
  "single_relations": [],
  "group_relations": []
}
"""
