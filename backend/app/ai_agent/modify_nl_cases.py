from .constant import FUZZY_FACTOR


class ModifyNL_Cases:
    case1 = (
        """## 示例1
输入：
old_queryspec_with_source
```
{
  "original_text": "Find periods in AMZN when price first fell then presented a flat trend",
  "text_sources": [
    {
      "text": "AMZN",
      "index": 0
    },  
    {
      "text": "fell",
      "index": 0
    },
    {
      "text": "a flat trend",
      "index": 0
    }
  ],
  "targets": [
    {
      "target": "AMZN",
      "text_source_id": 0
    }
  ],
  "trends": [
    {
      "category": {
        "category": "down",
        "text_source_id": 1
      }
    },
    {
      "category": {
        "category": "flat",
        "text_source_id": 2
      }
    }
  ],
  "trend_groups": [],
  "single_relations": [],
  "group_relations": []
}
```

segments
```
[
  {
    "source": "result",
    "relative_slope": 2.0044006295398686,
    "daily_average_delta_percentage": -0.808347110206753,
    "delta_percentage": -17.699390117203826,
    "end_time": 1397174400,
    "end_value": 311.730011,
    "slope": -0.00003233023630401235,
    "start_time": 1395100800,
    "start_value": 378.769989,
    "duration": 2073600
  },
  {
    "source": "result",
    "relative_slope": 0.00012242216338669335,
    "daily_average_delta_percentage": 0.000054724881026757544,
    "delta_percentage": 0.016035671329695883,
    "end_time": 1422489600,
    "end_value": 311.779999,
    "slope": 1.9746239413468913e-9,
    "start_time": 1397174400,
    "start_value": 311.730011,
    "duration": 25315200
  },
  {
    "source": "user",
    "relative_slope": 30.67595048894415,
    "daily_average_delta_percentage": 13.711591550810166,
    "delta_percentage": 13.711591550810159,
    "end_time": 1422576000,
    "end_value": 354.529999,
    "slope": 0.0004947916666666667,
    "start_time": 1422489600,
    "start_value": 311.779999,
    "duration": 86400
  }
]
```

segment_groups
```
[]
```

intentions
```
{
  "single_segment_intentions": [
    {
      "id": 0,
      "single_choices":["relative_slope"]
    },
    {
      "id": 2,
      "single_choices":["category", "slope", "relative_slope"]
    }
  ],
  "segment_group_intentions": [
    {
      "ids": [0, 1],
      "group_choices":["duration"]
    }
  ],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

输出：
{
  "original_text": "Find periods in AMZN where the price first fell very slowly, then showed a flat trend for about 10 months, and finally rose moderately by about 30% and the slope of this trend is about 0.000494 per second",
  "text_sources": [
    {
      "text": "AMZN",
      "index": 0
    },
    {
      "text": "fell",
      "index": 0
    },
    {
      "text": "very slowly",
      "index": 0
    },
    {
      "text": "a flat trend",
      "index": 0
    },
    {
      "text": "about 10 months",
      "index": 0
    },
    {
      "text": "rose",
      "index": 0
    },
    {
      "text": "moderately by about 30%",
      "index": 0
    },
    {
      "text": "about 0.000494 per second",
      "index": 0
    }
  ],
  "targets": [
    {
      "target": "AMZN",
      "text_source_id": 0
    }
  ],
  "trends": [
    {
      "category": {
        "category": "down",
        "text_source_id": 1
      },
      "relative_slope_scope_condition": {
        "min": {
          "value": -3,
          "inclusive": true
        },
        "max": {
          "value": 0,
          "inclusive": false
        },
        "text_source_id": 2
      }
    },
    {
      "category": {
        "category": "flat",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 5
      },
      "slope_scope_condition": {
        "min": {
          "value": """
        + str(0.000494 * (1 - FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(0.000494 * (1 + FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "unit": "second",
        "text_source_id": 7
      },
      "relative_slope_scope_condition": {
        "min": {
          "value": """
        + str(30 * (1 - FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(30 * (1 + FUZZY_FACTOR))
        + """,
          "inclusive": false
        },
        "text_source_id": 6
      }
    }
  ],
  "single_relations": [],
  "trend_groups": [
    {
      "ids": [0, 1],
      "duration_condition": {
        "min": {
          "value": """
        + str(10 * (1 - FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(10 * (1 + FUZZY_FACTOR))
        + """,
          "inclusive": false
        },
        "unit": "month",
        "text_source_id": 4
      }
    }
  ],
  "group_relations": []
}
    """
    )

    case2 = (
        """## 示例2
输入：
old_queryspec_with_source
```
{
  "original_text": "Find periods in AMZN when price presented a cup-with-handle shape with a duration of about 2 weeks",
  "text_sources": [
    {
      "index": 0,
      "text": "AMZN"
    },
    {
      "index": 0,
      "text": "cup-with-handle"
    },
    {
      "index": 0,
      "text": "about 2 weeks"
    }
  ],
  "targets": [
    {
      "target": "AMZN",
      "text_source_id": 0
    }
  ],
  "trends": [
    {
      "category": {
        "category": "down",
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
  ],
  "single_relations": [
    {
      "attribute": "slope",
      "comparator": "<",
      "id1": 0,
      "id2": 1,
      "text_source_id": 1
    },
    {
      "attribute": "slope",
      "comparator": "<",
      "id1": 2,
      "id2": 3,
      "text_source_id": 1
    },
    {
      "attribute": "end_value",
      "comparator": "<",
      "id1": 1,
      "id2": 4,
      "text_source_id": 1
    }
  ],
  "trend_groups": [
    {
      "ids": [0, 4],
      "duration_condition": {
        "min": {
          "value": """
        + str(2 * (1 - FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(2 * (1 + FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "unit": "week",
        "text_source_id": 2
      }
    }
  ],
  "group_relations": []
}
```

segments
```
[
  {
    "relative_slope": 47.560301473913036,
    "end_time": 1518048000,
    "end_value": 1350.5,
    "slope": -0.0007671299652777779,
    "source": "result",
    "start_time": 1517961600,
    "start_value": 1416.780029,
    "duration": 86400
  },
  {
    "relative_slope": 7.821487638650382,
    "end_time": 1518134400,
    "end_value": 1339.599976,
    "slope": -0.00012615768518518553,
    "source": "result",
    "start_time": 1518048000,
    "start_value": 1350.5,
    "duration": 86400
  },
  {
    "relative_slope": 11.153369933748698,
    "end_time": 1518393600,
    "end_value": 1386.22998,
    "slope": 0.00017989970679012384,
    "source": "result",
    "start_time": 1518134400,
    "start_value": 1339.599976,
    "duration": 259200
  },
  {
    "relative_slope": 23.25634184016303,
    "end_time": 1518566400,
    "end_value": 1451.050049,
    "slope": 0.00037511614004629557,
    "source": "result",
    "start_time": 1518393600,
    "start_value": 1386.22998,
    "duration": 172800
  },
  {
    "relative_slope": 0.8467667386731758,
    "end_time": 1518739200,
    "end_value": 1448.689941,
    "slope": -0.000013658032407406566,
    "source": "result",
    "start_time": 1518566400,
    "start_value": 1451.050049,
    "duration": 172800
  }
]
```

segment_groups
```
[]
```

intentions
```
{
  "single_segment_intentions": [],
  "segment_group_intentions": [],
  "single_relation_intentions": [
    {"id1": 0, "id2": 3, "single_choices": ["relative_slope"]},
    {"id1": 1, "id2": 2, "single_choices": ["relative_slope"]},
    {"id1": 1, "id2": 3, "single_choices": ["start_value"]}
  ],
  "group_relation_intentions": [
    {"group1": [0, 3], "group2": [4, 4], "single_choices": ["duration"]}
  ]
}
```

输出：
{
  "original_text": "Find periods in AMZN when price presented a cup-with-handle shape with a duration of about 2 weeks, where the first down trend and the second up trend had similarly sharp slopes, while the second down trend and the first up trend had similarly gentle slopes. The second down trend started at approximately the same value as the second up trend, and the first four segments had a longer duration than the last segment.",
  "text_sources": [
    {
      "index": 0,
      "text": "AMZN"
    },
    {
      "index": 0,
      "text": "cup-with-handle"
    },
    {
      "index": 0,
      "text": "about 2 weeks"
    },
    {
      "index": 0,
      "text": "first down trend and the second up trend had similarly slopes"
    },
    {
      "index": 0,
      "text": "second down trend and the first up trend had similarly gentle slopes"
    },
    {
      "index": 0,
      "text": "second down trend started at approximately the same value as the second up trend"
    },
    {
      "index": 0,
      "text": "first four segments had a longer duration than the last segment"
    }
  ],
  "targets": [
    {
      "target": "AMZN",
      "text_source_id": 0
    }
  ],
  "trends": [
    {
      "category": {
        "category": "down",
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
  ],
  "single_relations": [
    {
      "attribute": "slope",
      "comparator": "<",
      "id1": 0,
      "id2": 1,
      "text_source_id": 1
    },
    {
      "attribute": "slope",
      "comparator": "<",
      "id1": 2,
      "id2": 3,
      "text_source_id": 1
    },
    {
      "attribute": "end_value",
      "comparator": "<",
      "id1": 1,
      "id2": 4,
      "text_source_id": 1
    }
  ],
  "trend_groups": [
    {
      "ids": [0, 4],
      "duration_condition": {
        "min": {
          "value": """
        + str(2 * (1 - FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(2 * (1 + FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "unit": "week",
        "text_source_id": 2
      }
    }
  ],
  "single_relations": [
    {
      "attribute": "relative_slope",
      "comparator": "~=",
      "id1": 0,
      "id2": 3,
      "text_source_id": 3
    },
    {
      "attribute": "relative_slope",
      "comparator": "~=",
      "id1": 1,
      "id2": 2,
      "text_source_id": 4
    },
    {
      "attribute": "start_value",
      "comparator": "~=",
      "id1": 1,
      "id2": 3,
      "text_source_id": 5
    }
  ],
  "group_relations": [
    {
      "group1": [0, 3],
      "group2": [4, 4],
      "attribute": "duration",
      "comparator": ">=",
      "text_source_id": 6
    }
  ]
}
    """
    )
    case3 = (
        """## 示例3
输入：
old_queryspec_with_source
```
{
  "original_text": "Find periods when price presented a high plateau shape with uptrend slope about 3%/day and the slope of downtrend is about 20%/week",
  "text_sources": [
    {
      "text": "high plateau",
      "index": 0
    },
    {
      "text": "uptrend slope about 3%/day",
      "index": 0
    },
    {
      "text": "slope of downtrend is about 20%/week",
      "index": 0
    }
  ],
  "targets": [],
  "trends": [
    {
      "category": {
        "category": "up",
        "text_source_id": 0
      },
      "slope_scope_condition": {
        "text_source_id": 1,
        "min": {
          "value": """
        + str(0.03 * (1 - FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(0.03 * (1 + FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "unit": "day"
      }
    },
    {
      "category": {
        "category": "flat",
        "text_source_id": 0
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 0
      },
      "slope_scope_condition": {
        "max": {
          "inclusive": true,
          "value": """
        + str(0.2 * (1 + FUZZY_FACTOR))
        + """,
        },
        "min": {
          "inclusive": true,
          "value": """
        + str(-0.2 * (1 - FUZZY_FACTOR))
        + """,
        },
        "text_source_id": 2,
        "unit": "week"
      }
    }
  ],
  "single_relations": [],
  "trend_groups": [],
  "group_relations": []
}
```

segments
```
[
  {
    "relative_slope": 0.2753391665644733,
    "end_idx": 318,
    "end_time": 1407196800,
    "end_value": 60.407143,
    "max_value": 64.654289,
    "min_value": 60.265713,
    "r2": 0.3969188923110135,
    "slope": -9.984237001424515e-7,
    "source": "user",
    "start_idx": 300,
    "start_time": 1404950400,
    "start_value": 62.650002,
    "duration": 2246400
  },
  {
    "relative_slope": 1.5111551853629317,
    "end_idx": 331,
    "end_time": 1408665600,
    "end_value": 68.455711,
    "max_value": 68.455711,
    "min_value": 60.407143,
    "r2": 0.7891829733803885,
    "slope": 0.000005479689542483657,
    "source": "result",
    "start_idx": 318,
    "start_time": 1407196800,
    "start_value": 60.407143,
    "duration": 1468800
  },
  {
    "relative_slope": 0.054034123249919165,
    "end_idx": 344,
    "end_time": 1410393600,
    "end_value": 68.794289,
    "max_value": 69.19857,
    "min_value": 67.524284,
    "r2": -0.5486946042665466,
    "slope": 1.9593634259259983e-7,
    "source": "result",
    "start_idx": 331,
    "start_time": 1408665600,
    "start_value": 68.455711,
    "duration": 1728000
  },
  {
    "relative_slope": 1.6075216881683112,
    "end_idx": 351,
    "end_time": 1411344000,
    "end_value": 63.254284,
    "max_value": 68.794289,
    "min_value": 63.254284,
    "r2": 0.8130511506610364,
    "slope": -0.000005829129840067348,
    "source": "result",
    "start_idx": 344,
    "start_time": 1410393600,
    "start_value": 68.794289,
    "duration": 950400
  },
  {
    "relative_slope": 0.11518305133769169,
    "end_idx": 368,
    "end_time": 1413331200,
    "end_value": 64.084282,
    "max_value": 66.694283,
    "min_value": 62.654285,
    "r2": -0.35735071825608977,
    "slope": 4.1767210144927703e-7,
    "source": "user",
    "start_idx": 351,
    "start_time": 1411344000,
    "start_value": 63.254284,
    "duration": 1987200
  }
]
```

segment_groups
```
[[1,3]]
```

intentions
```
{
  "single_segment_intentions": [
    {
      "id": 0,
      "single_choices": ["category"]
    },
    {
      "id": 4,
      "single_choices": ["category"]
    }
  ],
  "segment_group_intentions": [
    {
      "ids": [1,3],
      "group_choices": ["duration"]
    }
  ],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

输出：
{
  "original_text": "Find periods when price first had a gentle downward trend, then showed a high plateau pattern lasting about 7 weeks, where the price first rose with a slope of about 3% per day, followed by a flat trend, then a downward trend with a slope of about 20% per week, and finally showed a gentle upward trend.",
  "text_sources": [
    {
      "text": "a gentle downward trend",
      "index": 0
    },
    {
      "text": "a high plateau pattern",
      "index": 0
    },
    {
      "text": "about 7 weeks",
      "index": 0
    },
    {
      "text": "about 3% per day",
      "index": 0
    },
    {
      "text": "about 20% per week",
      "index": 0
    },
    {
      "text": "a gentle upward trend",
      "index": 0
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
      },
      "slope_scope_condition": {
        "min": {
          "value": """
        + str(0.03 * (1 - FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(0.03 * (1 + FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "unit": "day",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "flat",
        "text_source_id": 0
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 0
      },
      "slope_scope_condition": {
        "min": {
          "value": """
        + str(-0.2 * (1 + FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(-0.2 * (1 - FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "unit": "week",
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
  "single_relations": [],
  "trend_groups": [
    {
      "ids": [1, 3],
      "duration_condition": {
        "min": {
          "value": """
        + str(7 * (1 - FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(7 * (1 + FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "unit": "week",
        "text_source_id": 2
      }
    }
  ],
  "group_relations": []
}
"""
    )
