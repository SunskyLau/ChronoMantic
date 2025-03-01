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
    "abs_slope_percentage": 2.0044006295398686,
    "daily_average_delta_percentage": -0.808347110206753,
    "delta_percentage": -17.699390117203826,
    "end_time": 1397174400,
    "end_value": 311.730011,
    "slope": -0.00003233023630401235,
    "start_time": 1395100800,
    "start_value": 378.769989,
    "time_span": 2073600
  },
  {
    "source": "result",
    "abs_slope_percentage": 0.00012242216338669335,
    "daily_average_delta_percentage": 0.000054724881026757544,
    "delta_percentage": 0.016035671329695883,
    "end_time": 1422489600,
    "end_value": 311.779999,
    "slope": 1.9746239413468913e-9,
    "start_time": 1397174400,
    "start_value": 311.730011,
    "time_span": 25315200
  },
  {
    "source": "user",
    "abs_slope_percentage": 30.67595048894415,
    "daily_average_delta_percentage": 13.711591550810166,
    "delta_percentage": 13.711591550810159,
    "end_time": 1422576000,
    "end_value": 354.529999,
    "slope": 0.0004947916666666667,
    "start_time": 1422489600,
    "start_value": 311.779999,
    "time_span": 86400
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
      "single_choices":["daily_average_delta_percentage"]
    },
    {
      "id": 2,
      "single_choices":["category", "daily_average_delta_percentage"]
    }
  ],
  "segment_group_intentions": [
    {
      "ids": [0, 1],
      "group_choices":["time_span"]
    }
  ],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

输出：
{
  "original_text": "Find periods in AMZN when price first fell with a average daily change rate of 0.8% then presented a flat trend, with a duration about 293 days, and finally rose with a average daily change rate of 13%",
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
      "text": "with a average daily change rate of 0.8%",
      "index": 0
    },
    {
      "text": "a flat trend",
      "index": 0
    },
    {
      "text": "about 293 days",
      "index": 0
    },
    {
      "text": "rose",
      "index": 0
    },
    {
      "text": "with a average daily change rate of 13%",
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
      "daily_average_delta_percentage_scope_condition": {
        "min": {
          "value": -1.5,
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
      "daily_average_delta_percentage_scope_condition": {
        "min": {
          "value": 10,
          "inclusive": true
        },
        "max": {
          "value": 16,
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
      "time_span_condition": {
        "min": {
          "value": """
        + str(293 * (1 - FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(293 * (1 + FUZZY_FACTOR))
        + """,
          "inclusive": false
        },
        "unit": "day",
        "text_source_id": 4
      }
    }
  ],
  "group_relations": []
}
    """
    )
    case2 = """## 示例2
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
      "ids": [0, 1, 2, 3, 4],
      "time_span_condition": {
        "min": {
          "value": 12,
          "inclusive": true
        },
        "max": {
          "value": 16,
          "inclusive": true
        },
        "unit": "day",
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
    "abs_slope_percentage": 47.560301473913036,
    "end_time": 1518048000,
    "end_value": 1350.5,
    "slope": -0.0007671299652777779,
    "source": "result",
    "start_time": 1517961600,
    "start_value": 1416.780029,
    "time_span": 86400
  },
  {
    "abs_slope_percentage": 7.821487638650382,
    "end_time": 1518134400,
    "end_value": 1339.599976,
    "slope": -0.00012615768518518553,
    "source": "result",
    "start_time": 1518048000,
    "start_value": 1350.5,
    "time_span": 86400
  },
  {
    "abs_slope_percentage": 11.153369933748698,
    "end_time": 1518393600,
    "end_value": 1386.22998,
    "slope": 0.00017989970679012384,
    "source": "result",
    "start_time": 1518134400,
    "start_value": 1339.599976,
    "time_span": 259200
  },
  {
    "abs_slope_percentage": 23.25634184016303,
    "end_time": 1518566400,
    "end_value": 1451.050049,
    "slope": 0.00037511614004629557,
    "source": "result",
    "start_time": 1518393600,
    "start_value": 1386.22998,
    "time_span": 172800
  },
  {
    "abs_slope_percentage": 0.8467667386731758,
    "end_time": 1518739200,
    "end_value": 1448.689941,
    "slope": -0.000013658032407406566,
    "source": "result",
    "start_time": 1518566400,
    "start_value": 1451.050049,
    "time_span": 172800
  }
]
```

segment_group_ids
```
[]
```

intentions
```
{
  "single_segment_intentions": [
    {
      "id": 0,
      "single_choices": ["abs_slope_percentage"]
    },
    {
      "id": 1,
      "single_choices": ["abs_slope_percentage"]
    }
  ],
  "segment_group_intentions": [
    {
      "ids": [0, 1, 2, 3, 4],
      "group_choices": ["time_span"]
    }
  ],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

输出：
{
  "original_text": "Find periods in AMZN when price presented a cup-with-handle shape with a duration of about 2 weeks, where the first down trend had a slope of about 47% and the second down trend had a slope of about 8%",
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
      "text": "first down trend had a slope of about 47%"
    },
    {
      "index": 0,
      "text": "second down trend had a slope of about 8%"
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
      "abs_slope_percentage_scope_condition": {
        "min": {
          "value": 42,
          "inclusive": true
        },
        "max": {
          "value": 52,
          "inclusive": true
        },
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 1
      },
      "abs_slope_percentage_scope_condition": {
        "min": {
          "value": 6,
          "inclusive": true
        },
        "max": {
          "value": 10,
          "inclusive": true
        },
        "text_source_id": 4
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
      "ids": [0, 1, 2, 3, 4],
      "time_span_condition": {
        "min": {
          "value": 12,
          "inclusive": true
        },
        "max": {
          "value": 16,
          "inclusive": true
        },
        "unit": "day",
        "text_source_id": 2
      }
    }
  ],
  "group_relations": []
}
    """
    case3 = """## 示例3
输入：
old_queryspec_with_source
```
{
  "original_text": "Find periods when price presented a high plateau shape with a slope of downtrend is about 20/week and uptrend slope about 35/day",
  "text_sources": [
    {
      "text": "a high plateau shape",
      "index": 0
    },
    {
      "text": "slope of downtrend is about 20/week",
      "index": 0
    },
    {
      "text": "uptrend slope about 35/day",
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
        "min": {
          "value": 31,
          "inclusive": true
        },
        "max": {
          "value": 39,
          "inclusive": true
        },
        "unit": "day",
        "text_source_id": 2
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
          "value": 18,
          "inclusive": true
        },
        "max": {
          "value": 22,
          "inclusive": true
        },
        "unit": "week",
        "text_source_id": 1
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
    "abs_slope_percentage": 35.2,
    "end_time": 1518048000,
    "end_value": 150.5,
    "slope": 0.0005,
    "source": "result",
    "start_time": 1517961600,
    "start_value": 100.2,
    "time_span": 86400
  },
  {
    "abs_slope_percentage": 0.5,
    "end_time": 1518393600,
    "end_value": 151.0,
    "slope": 0.00001,
    "source": "result",
    "start_time": 1518048000,
    "start_value": 150.5,
    "time_span": 345600
  },
  {
    "abs_slope_percentage": 20.1,
    "end_time": 1518739200,
    "end_value": 120.0,
    "slope": -0.0003,
    "source": "result",
    "start_time": 1518393600,
    "start_value": 151.0,
    "time_span": 345600
  }
]
```

segment_group_ids
```
[]
```

intentions
```
{
  "single_segment_intentions": [
    {
      "id": 2,
      "single_choices": ["slope"]
    }
  ],
  "segment_group_intentions": [],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

输出：
{
  "original_text": "Find periods when price presented a high plateau shape with a slope of downtrend about 20% per week, where the uptrend had a slope of about 35% and the flat trend lasted about 4 days",
  "text_sources": [
    {
      "text": "a high plateau shape",
      "index": 0
    },
    {
      "text": "slope of downtrend about 20% per week",
      "index": 0
    },
    {
      "text": "uptrend had a slope of about 35%",
      "index": 0
    },
    {
      "text": "flat trend lasted about 4 days",
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
      "abs_slope_percentage_scope_condition": {
        "min": {
          "value": 31,
          "inclusive": true
        },
        "max": {
          "value": 39,
          "inclusive": true
        },
        "text_source_id": 2
      }
    },
    {
      "category": {
        "category": "flat",
        "text_source_id": 0
      },
      "time_span_condition": {
        "min": {
          "value": 3,
          "inclusive": true
        },
        "max": {
          "value": 5,
          "inclusive": true
        },
        "unit": "day",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 0
      },
      "abs_slope_percentage_scope_condition": {
        "min": {
          "value": 18,
          "inclusive": true
        },
        "max": {
          "value": 22,
          "inclusive": true
        },
        "unit": "week",
        "text_source_id": 1
      }
    }
  ],
  "single_relations": [],
  "trend_groups": [],
  "group_relations": []
}
"""

    case4 = """## 示例4
输入：
old_queryspec_with_source
```
{
  "original_text": "Find periods in AMZN when price presented a head-and-shoulders shape with first shoulder's uptrend slope about 25/day and head's uptrend slope about 36/day, followed by a cup-with-handle shape with first downtrend slope about 40/week",
  "text_sources": [
    {
      "text": "AMZN",
      "index": 0
    },
    {
      "text": "head-and-shoulders",
      "index": 0
    },
    {
      "text": "cup-with-handle",
      "index": 0
    },
    {
      "text": "first shoulder's uptrend slope about 25/day",
      "index": 0
    },
    {
      "text": "head's uptrend slope about 36/day",
      "index": 0
    },
    {
      "text": "first downtrend slope about 40/week",
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
        "category": "up",
        "text_source_id": 1
      },
      "slope_scope_condition": {
        "min": {
          "value": 23,
          "inclusive": true
        },
        "max": {
          "value": 27,
          "inclusive": true
        },
        "unit": "day",
        "text_source_id": 3
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
      },
      "slope_scope_condition": {
        "min": {
          "value": 34,
          "inclusive": true
        },
        "max": {
          "value": 38,
          "inclusive": true
        },
        "unit": "day",
        "text_source_id": 4
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
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 2
      },
      "slope_scope_condition": {
        "min": {
          "value": 36,
          "inclusive": true
        },
        "max": {
          "value": 44,
          "inclusive": true
        },
        "unit": "week",
        "text_source_id": 5
      }
    }
  ],
  "single_relations": [
    {
      "id1": 0,
      "id2": 2,
      "attribute": "end_value",
      "comparator": "<",
      "text_source_id": 1
    },
    {
      "id1": 2,
      "id2": 4,
      "attribute": "end_value",
      "comparator": ">",
      "text_source_id": 1
    },
    {
      "id1": 6,
      "id2": 7,
      "attribute": "slope",
      "comparator": "<",
      "text_source_id": 2
    },
    {
      "id1": 8,
      "id2": 9,
      "attribute": "slope",
      "comparator": "<",
      "text_source_id": 2
    },
    {
      "id1": 7,
      "id2": 10,
      "attribute": "end_value",
      "comparator": "<",
      "text_source_id": 2
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
```

segments
```
[
  {
    "abs_slope_percentage": 25.5,
    "end_time": 1518048000,
    "end_value": 150.5,
    "slope": 0.0004,
    "source": "result",
    "start_time": 1517961600,
    "start_value": 120.2,
    "time_span": 86400
  },
  {
    "abs_slope_percentage": 15.2,
    "end_time": 1518134400,
    "end_value": 130.5,
    "slope": -0.0002,
    "source": "result",
    "start_time": 1518048000,
    "start_value": 150.5,
    "time_span": 86400
  },
  {
    "abs_slope_percentage": 35.8,
    "end_time": 1518393600,
    "end_value": 180.0,
    "slope": 0.0006,
    "source": "result",
    "start_time": 1518134400,
    "start_value": 130.5,
    "time_span": 259200
  }
]
```

segment_group_ids
```
[]
```

intentions
```
{
  "single_segment_intentions": [
    {
      "id": 0,
      "single_choices": ["abs_slope_percentage"]
    },
    {
      "id": 2,
      "single_choices": ["abs_slope_percentage"]
    }
  ],
  "segment_group_intentions": [],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

输出：
{
  "original_text": "Find periods in AMZN when price presented a head-and-shoulders shape with first shoulder's uptrend slope about 25% and head's uptrend slope about 36%, followed by a cup-with-handle shape",
  "text_sources": [
    {
      "text": "AMZN",
      "index": 0
    },
    {
      "text": "head-and-shoulders",
      "index": 0
    },
    {
      "text": "cup-with-handle",
      "index": 0
    },
    {
      "text": "first shoulder's uptrend slope about 25%",
      "index": 0
    },
    {
      "text": "head's uptrend slope about 36%",
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
        "category": "up",
        "text_source_id": 1
      },
      "abs_slope_percentage_scope_condition": {
        "min": {
          "value": 23,
          "inclusive": true
        },
        "max": {
          "value": 27,
          "inclusive": true
        },
        "text_source_id": 3
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
      },
      "abs_slope_percentage_scope_condition": {
        "min": {
          "value": 34,
          "inclusive": true
        },
        "max": {
          "value": 38,
          "inclusive": true
        },
        "text_source_id": 4
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
    },
    {
      "category": {
        "category": "down",
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
  ],
  "single_relations": [
    {
      "id1": 0,
      "id2": 2,
      "attribute": "end_value",
      "comparator": "<",
      "text_source_id": 1
    },
    {
      "id1": 2,
      "id2": 4,
      "attribute": "end_value",
      "comparator": ">",
      "text_source_id": 1
    },
    {
      "id1": 6,
      "id2": 7,
      "attribute": "slope",
      "comparator": "<",
      "text_source_id": 2
    },
    {
      "id1": 8,
      "id2": 9,
      "attribute": "slope",
      "comparator": "<",
      "text_source_id": 2
    },
    {
      "id1": 7,
      "id2": 10,
      "attribute": "end_value",
      "comparator": "<",
      "text_source_id": 2
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
"""
