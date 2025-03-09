from app.utils.queryspec import get_segment_info, modify_queryspec_by_intentions
from .constant import FUZZY_FACTOR

# case3 = {
#     "old_queryspec_with_source": None,
#     "segments": [
#         {
#             "duration": 5961600,
#             "end_idx": 1224,
#             "end_time": 1520812800,
#             "end_value": 1598.390015,
#             "max_value": 1598.390015,
#             "min_value": 1189.01001,
#             "r2": 0.8840379990533773,
#             "relative_slope": 4.257350882123469,
#             "slope": 0.00006866948554079441,
#             "source": "user",
#             "start_idx": 1177,
#             "start_time": 1514851200,
#             "start_value": 1189.01001,
#         },
#         {
#             "duration": 3024000,
#             "end_idx": 1248,
#             "end_time": 1523836800,
#             "end_value": 1441.5,
#             "max_value": 1598.390015,
#             "min_value": 1371.98999,
#             "r2": 0.4801922424890831,
#             "relative_slope": 3.2165415755052313,
#             "slope": -0.0000518816187169312,
#             "source": "user",
#             "start_idx": 1224,
#             "start_time": 1520812800,
#             "start_value": 1598.390015,
#         },
#         {
#             "duration": 14515200,
#             "end_idx": 1365,
#             "end_time": 1538352000,
#             "end_value": 2004.359985,
#             "max_value": 2039.51001,
#             "min_value": 1441.5,
#             "r2": 0.8678200653519595,
#             "relative_slope": 2.404102622120279,
#             "slope": 0.000038777280712632275,
#             "source": "user",
#             "start_idx": 1248,
#             "start_time": 1523836800,
#             "start_value": 1441.5,
#         },
#         {
#             "duration": 2505600,
#             "end_idx": 1386,
#             "end_time": 1540857600,
#             "end_value": 1530.420044,
#             "max_value": 2004.359985,
#             "min_value": 1530.420044,
#             "r2": 0.6469810198667505,
#             "relative_slope": 11.727007997458449,
#             "slope": -0.0001891522753033206,
#             "source": "user",
#             "start_idx": 1365,
#             "start_time": 1538352000,
#             "start_value": 2004.359985,
#         },
#     ],
#     "intentions": {
#         "single_segment_intentions": [{"id": 1, "single_choices": ["slope", "duration"]}],
#         "segment_group_intentions": [{"ids": [0, 3], "group_choices": ["duration"]}],
#         "single_relation_intentions": [{"id1": 0, "id2": 2, "relation_choices": ["relative_slope"]}],
#         "group_relation_intentions": [{"group1": [0, 1], "group2": [2, 3], "relation_choices": ["duration"]}],
#     },
# }

# case3["segments"] = get_segment_info(case3["segments"])
# case3["new_queryspec_with_source_without_text_sources"] = modify_queryspec_by_intentions(None, case3["segments"], case3["intentions"])
# print(case3["new_queryspec_with_source_without_text_sources"])


class ModifyNL_Cases:
    case1 = """输入：
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

intentions
```
{
  "single_segment_intentions": [
    { "id": 0, "single_choices": ["category"] }
  ],
  "segment_group_intentions": [],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

new_queryspec_with_source_without_text_sources
```
{
  "group_relations": [],
  "original_text": "",
  "single_relations": [{'attribute': 'end_value', 'comparator': '~=', 'id1': 1, 'id2': 3}],
  "targets": [],
  "text_sources": [],
  "trend_groups": [],
  "trends": [{'category': {'category': 'up'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}}
}
```

输出：
{
  "original_text": "find a rising trend followed by a double top trend",
  "text_sources": [
    {
      "index": 0,
      "text": "rising trend"
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
      "id1": 1,
      "id2": 3,
      "text_source_id": 1
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
        "category": "up",
        "text_source_id": 1
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
        "text_source_id": 1
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 1
      }
    }
  ]
}
    """

    case2 = """输入：
old_queryspec_with_source
```
null
```

intentions
```
{
  "single_segment_intentions": [
    { "id": 0, "single_choices": ["category"] },
    { "id": 1, "single_choices": ["category"] },
    { "id": 2, "single_choices": ["category"] },
    { "id": 3, "single_choices": ["category"] },
    { "id": 4, "single_choices": ["category"] }
  ],
  "segment_group_intentions": [
    { "ids": [1, 3], "group_choices": ["duration"] }
  ],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

new_queryspec_with_source_without_text_sources
```
{'original_text': '', 'text_sources': [], 'targets': [], 'trends': [{'category': {'category': 'down'}}, {'category': {'category': 'up'}}, {'category': {'category': 'up'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}], 'single_relations': [], 'trend_groups': [{'ids': [1, 3], 'duration_condition': {'min': {'value': '22.5', 'inclusive': true}, 'max': {'value': '27.5', 'inclusive': true}, 'unit': 'day'}}], 'group_relations': []}
```

输出：
{
  "original_text": "find a trend that falls then rises three times with a duration of about 25 days and falls again",
  "text_sources": [
    {
      "index": 0,
      "text": "falls"
    },
    {
      "index": 0,
      "text": "rises three times"
    },
    {
      "index": 0,
      "text": "about 25 days"
    },
    {
      "index": 1,
      "text": "falls"
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
        "text_source_id": 1
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
        "category": "down",
        "text_source_id": 3
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
        "text_source_id": 2
      }
    }
  ],
  "single_relations": [],
  "group_relations": []
}
"""

    case3 = """输入：
old_queryspec_with_source
```
null
```

intentions
```
{
  "single_segment_intentions": [{"id": 0, "single_choices": ["category"]}, {"id": 1, "single_choices": ["slope", "duration"]}, {"id": 2, "single_choices": ["category"]}, {"id": 3, "single_choices": ["category"]}],
  "segment_group_intentions": [{"ids": [0, 3], "group_choices": ["duration"]}],
  "single_relation_intentions": [{"id1": 0, "id2": 2, "relation_choices": ["relative_slope"]}],
  "group_relation_intentions": [{"group1": [0, 1], "group2": [2, 3], "relation_choices": ["duration"]}]
}
```

new_queryspec_with_source_without_text_sources
```
{'original_text': '', 'text_sources': [], 'targets': [], 'trends': [{'category': {'category': 'up'}}, {'category': {'category': 'down'}, 'slope_scope_condition': {'max': {'value': -28.24, 'inclusive': True}, 'min': {'value': -34.52, 'inclusive': True}, 'unit': 'week'}, 'duration_condition': {'max': {'value': 5.5, 'inclusive': True}, 'min': {'value': 4.5, 'inclusive': True}, 'unit': 'week'}}, {'category': {'category': 'up'}}, {'category': {'category': 'down'}}], 'single_relations': [{'id1': 0, 'id2': 2, 'attribute': 'relative_slope', 'comparator': '>'}], 'trend_groups': [{'ids': [0, 3], 'duration_condition': {'max': {'value': 47.3, 'inclusive': True}, 'min': {'value': 38.7, 'inclusive': True}, 'unit': 'week'}}], 'group_relations': [{'group1': [0, 1], 'group2': [2, 3], 'attribute': 'duration', 'comparator': '<'}]}
```

输出：
{
  "original_text": "find a trend that rises, then falls with a slope between -34.52 and -28.24 per week over 4.5 to 5.5 weeks, then rises again, and finally falls, where the first rising trend's relative slope is greater than the third rising trend's and the total duration of the first to the last trends is about 43 weeks, while the duration of the first two trends is shorter than the duration of the last two trends",
  "targets": [],
  "text_sources": [
    {"index": 0, "text": "rises"},
    {"index": 0, "text": "falls"},
    {"index": 0, "text": "a slope between -34.52 and -28.24 per week"},
    {"index": 0, "text": "over 4.5 to 5.5 weeks"},
    {"index": 1, "text": "rises"},
    {"index": 1, "text": "falls"},
    {"index": 0, "text": "the first rising trend's relative slope is greater than the third rising trend's"},
    {"index": 0, "text": "total duration of the first to the last trends is about 43 weeks"},
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
