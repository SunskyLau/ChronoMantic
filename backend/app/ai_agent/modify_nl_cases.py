from .constant import FUZZY_FACTOR


class ModifyNL_Cases:
    case1 = """## 示例1
输入：
old_queryspec_with_source
```{
  "group_relations": [],
  "original_text": "find a double top trend",
  "single_relations": [
    {
      "attribute": "end_value",
      "comparator": "~=",
      "id1": 1,
      "id2": 3,
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
        "category": "up"
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
  "single_segment_intentions": [],
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
[{'relative_slope': 27.560301473913036, 'end_time': 1518048000, 'end_value': 1350.5, 'slope': -66.28, 'source': 'result', 'start_time': 1517961600, 'start_value': 1416.780029, 'duration': 1.0, 'category': 'down', 'unit': 'day'}, {'relative_slope': 11.821487638650382, 'end_time': 1518134400, 'end_value': 1339.599976, 'slope': -10.9, 'source': 'result', 'start_time': 1518048000, 'start_value': 1350.5, 'duration': 1.0, 'category': 'down', 'unit': 'day'}, {'relative_slope': 11.153369933748698, 'end_time': 1518393600, 'end_value': 1386.22998, 'slope': 15.54, 'source': 'result', 'start_time': 1518134400, 'start_value': 1339.599976, 'duration': 3.0, 'category': 'up', 'unit': 'day'}, {'relative_slope': 25.25634184016303, 'end_time': 1518566400, 'end_value': 1451.050049, 'slope': 32.41, 'source': 'result', 'start_time': 1518393600, 'start_value': 1386.22998, 'duration': 2.0, 'category': 'up', 'unit': 'day'}, {'relative_slope': 0.8467667386731758, 'end_time': 1518739200, 'end_value': 1448.689941, 'slope': -1.18, 'source': 'result', 'start_time': 1518566400, 'start_value': 1451.050049, 'duration': 2.0, 'category': 'down', 'unit': 'day'}]
```

intentions
```
{
  "single_segment_intentions": [
    {"id": 4, "single_choices": ["slope"]}
  ],
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

解释：
1. single_segment_intentions 中，需要关注所有segment的source和category，如果source是result，则不需要添加到trends中，保持不变即可，如果source是user，则需要添加到trends中，并设置category为up。
  1.1 需要调整id为0的segment的category，这一段是来源是result，所以不需要添加到trends中，保持不变即可。
  1.2 需要调整id为1的segment的category，这一段是来源是result，所以不需要添加到trends中，保持不变即可。
  1.3 需要调整id为2的segment的category，这一段是来源是result，所以不需要添加到trends中，保持不变即可。
  1.4 需要调整id为3的segment的category，这一段是来源是result，所以不需要添加到trends中，保持不变即可。
  1.5 需要调整id为4的segment的slope，所以应该设置slope大约为-1.18。这一段是来源是result，所以不需要添加到trends中，保持不变即可。
2. segment_group_intentions 中，没有segment_group，所以不需要调整这个属性。
3. single_relation_intentions 中，
  2.1 需要比较id1为0，id2为3的relation的relative_slope，分别是27.56和25.26，计算27.56 ~= 25.26，所以应该设置他们的关系为近似相等~=。
  2.2 需要比较id1为1，id2为2的relation的relative_slope，分别是11.82和11.15，计算11.82 ~= 11.15，所以应该设置他们的关系为近似相等~=。
  2.3 需要比较id1为1，id2为3的relation的end_value，分别是1350.5和1386.23，计算1350.5 ~= 1386.23，所以应该设置他们的关系为近似相等~=。
4. group_relation_intentions 中，需要比较ids为[0, 3]和[4, 4]的segment_group的duration，对应segment0、1、2、3和segment4，先计算[0,3]的duration之和为1 + 1 + 3 + 2 = 7，再计算[4,4]的duration之和为2，发现7>2，所以应该设置他们的关系为大于>。

输出：
{
  "original_text": "Find periods in AMZN when price presented a cup-with-handle shape with a duration of about 2 weeks and the slope of the last segment is about -1.18/day, where the first segment and the fourth segment had similarly relative slopes, while the second segment and the third segment had similarly relative slopes. The second segment started at approximately the same value as the fourth segment, and the first four segments had a longer duration than the last segment.",
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
      "text": "slope of the last segment is about -1.18/day"
    },
    {
      "index": 0,
      "text": "first segment and the fourth segment had similarly slopes"
    },
    {
      "index": 0,
      "text": "second segment and the third segment had similarly slopes"
    },
    {
      "index": 0,
      "text": "second segment started at approximately the same value as the fourth segment"
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
      },
      "slope_scope_condition": {
        "min": {
          "value": """
        + str(-1.18 * (1 + FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(-1.18 * (1 - FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "unit": "day",
        "text_source_id": 3
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
      "text_source_id": 4
    },
    {
      "attribute": "relative_slope",
      "comparator": "~=",
      "id1": 1,
      "id2": 2,
      "text_source_id": 5
    },
    {
      "attribute": "start_value",
      "comparator": "~=",
      "id1": 1,
      "id2": 3,
      "text_source_id": 6
    }
  ],
  "group_relations": [
    {
      "group1": [0, 3],
      "group2": [4, 4],
      "attribute": "duration",
      "comparator": ">=",
      "text_source_id": 7
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
[{'relative_slope': 0.2753391665644733, 'end_idx': 318, 'end_time': 1407196800, 'end_value': 60.407143, 'max_value': 64.654289, 'min_value': 60.265713, 'slope': -0.6, 'source': 'user', 'start_idx': 300, 'start_time': 1404950400, 'start_value': 62.650002, 'duration': 3.71, 'category': 'down', 'unit': 'week'}, {'relative_slope': 1.5111551853629317, 'end_idx': 331, 'end_time': 1408665600, 'end_value': 68.455711, 'max_value': 68.455711, 'min_value': 60.407143, 'slope': 3.31, 'source': 'result', 'start_idx': 318, 'start_time': 1407196800, 'start_value': 60.407143, 'duration': 2.43, 'category': 'up', 'unit': 'week'}, {'relative_slope': 0.054034123249919165, 'end_idx': 344, 'end_time': 1410393600, 'end_value': 68.794289, 'max_value': 69.19857, 'min_value': 67.524284, 'slope': 0.12, 'source': 'result', 'start_idx': 331, 'start_time': 1408665600, 'start_value': 68.455711, 'duration': 2.86, 'category': 'flat', 'unit': 'week'}, {'relative_slope': 1.6075216881683112, 'end_idx': 351, 'end_time': 1411344000, 'end_value': 63.254284, 'max_value': 68.794289, 'min_value': 63.254284, 'slope': -3.53, 'source': 'result', 'start_idx': 344, 'start_time': 1410393600, 'start_value': 68.794289, 'duration': 1.57, 'category': 'down', 'unit': 'week'}]
```

intentions
```
{
  "single_segment_intentions": [],
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

解释：
1. single_segment_intentions 中，需要关注所有segment的source和category，如果source是result，则不需要添加到trends中，保持不变即可，如果source是user，则需要添加到trends中，并设置category为up。
  1.1 id为0的segment，这一段的source是user，所以应该在原有基础上，添加一段trend，并设置category为down。
  1.2 id为1的segment，这一段的source是result，所以不需要添加到trends中，保持不变即可。
  1.3 id为2的segment，这一段的source是result，所以不需要添加到trends中，保持不变即可。
  1.4 id为3的segment，这一段的source是result，所以不需要添加到trends中，保持不变即可。
2. segment_group_intentions 中，需要调整ids为[1,3]的segment_group的duration，对应segment1、2、3的duration之和，所以应该计算 2.43 + 2.86 + 1.57 = 6.86，再加上unit，所以应该调整duration大约 6.86 week。
  2.1 注意：ids为[1,3]的segment_group，对应segment1、2、3，而不是segment1、3。不要把segment1和segment3的duration之和设置为duration_condition。
  2.2 注意：这里不需要设置single_segment_intentions，因为single_segment_intentions是针对单个segment的调整，而segment_group_intentions是针对多个segment形成的组的调整，所以你不应该在trends中的某些位置设置duration_condition。只应该在trend_groups中设置duration_condition。
3. single_relation_intentions 中，没有single_relation，所以不需要调整这个属性。
4. group_relation_intentions 中，没有group_relation，所以不需要调整这个属性。

输出：
{
  "original_text": "Find periods when price first had a gentle downward trend, then presented a high plateau shape lasting about 6.86 weeks with uptrend slope about 3%/day and the slope of downtrend is about 20%/week",
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
      "text": "about 6.86 weeks",
      "index": 0
    },
    {
      "text": "about 3%/day",
      "index": 0
    },
    {
      "text": "about 20%/week",
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
        "text_source_id": 1
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 1
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
    }
  ],
  "single_relations": [],
  "trend_groups": [
    {
      "ids": [1, 3],
      "duration_condition": {
        "min": {
          "value": """
        + str(6.86 * (1 - FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(6.86 * (1 + FUZZY_FACTOR))
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

    case4 = (
        """## 示例4
输入：
old_queryspec_with_source
```
null
```

segments
```
[{'duration': 35.0, 'end_idx': 145, 'end_time': 725, 'end_value': 335, 'max_value': 378, 'min_value': 335, 'relative_slope': 3.0410183875530414, 'slope': -1.23, 'source': 'user', 'start_idx': 138, 'start_time': 690, 'start_value': 378, 'category': 'down', 'unit': 'second'}, {'duration': 25.0, 'end_idx': 150, 'end_time': 750, 'end_value': 447, 'max_value': 447, 'min_value': 335, 'relative_slope': 11.08910891089109, 'slope': 4.48, 'source': 'user', 'start_idx': 145, 'start_time': 725, 'start_value': 335, 'category': 'up', 'unit': 'second'}, {'duration': 5.0, 'end_idx': 151, 'end_time': 755, 'end_value': 397, 'max_value': 447, 'min_value': 397, 'relative_slope': 24.752475247524753, 'slope': -10, 'source': 'user', 'start_idx': 150, 'start_time': 750, 'start_value': 447, 'category': 'down', 'unit': 'second'}]
```

intentions
```
{
  "single_segment_intentions": [
    {
      "id": 0,
      "single_choices": ["slope"]
    }
  ],
  "segment_group_intentions": [
    {
      "ids": [0, 1],
      "group_choices": ["duration"]
    }
  ],
  "single_relation_intentions": [
    {
      "id1": 0,
      "id2": 2,
      "relation_choices": ["slope"]
    }
  ],
  "group_relation_intentions": []
}
```

解释：
1. single_segment_intentions 中，需要关注所有segment的source和category，如果source是result，则不需要添加到trends中，保持不变即可，如果source是user，则需要添加到trends中，并设置category为up。
  1.1 id为0的segment，这一段的source是user，所以应该在原有基础上，添加一段trend，并设置category为down。同时，需要调整id为0的segment的slope，读取它的slope为-1.23，所以应该调整slope大约是-1.23，再根据FUZZY_FACTOR进行模糊调整slope的范围。
  1.2 id为1的segment，这一段的source是user，所以应该在原有基础上，添加一段trend，并设置category为up。
  1.3 id为2的segment，这一段的source是user，所以应该在原有基础上，添加一段trend，并设置category为down。
2. segment_group_intentions 中，需要调整ids为[0,1]的segment_group的duration，对应segment0和segment1的duration之和，所以应该计算35 + 25 = 60，再加上unit，所以应该调整duration为60 second。
3. single_relation_intentions 中，需要调整id1为0，id2为2的relation的slope，对应segment0和segment2的slope，所以应该计算-1.23 > -10，所以应该调整他们的关系是大于>。
4. group_relation_intentions 中，没有group_relation，所以不需要调整这个属性。

输出：
{
  "original_text": "Find a falling trend with a slope about -1.23/second followed by a rising trend with a duration of about 60 seconds, and then followed by another falling trend, and the second downtrend has a steeper slope than the first downtrend",
  "text_sources": [
    {
      "text": "falling trend",
      "index": 0
    },
    {
      "text": "slope about -1.23/second",
      "index": 0
    },
    {
      "text": "rising trend",
      "index": 0
    },
    {
      "text": "about 60 seconds",
      "index": 0
    },
    {
      "text": "falling trend",
      "index": 1
    },
    {
      "text": "steeper slope",
      "index": 0
    }
  ],
  "targets": [],
  "trends": [
    {
      "category": {
        "category": "down",
        "text_source_id": 0
      },
      "slope_scope_condition": {
        "min": {
          "value": """
        + str(-1.23 * (1 - FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(-1.23 * (1 + FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "unit": "number",
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
        "text_source_id": 4
      }
    }
  ],
  "single_relations": [
    {
      "attribute": "slope",
      "comparator": ">",
      "id1": 0,
      "id2": 2,
      "text_source_id": 5
    }
  ],
  "trend_groups": [
    {
      "ids": [0, 1],
      "duration_condition": {
        "min": {
          "value": """
        + str(60 * (1 - FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "max": {
          "value": """
        + str(60 * (1 + FUZZY_FACTOR))
        + """,
          "inclusive": true
        },
        "unit": "second",
        "text_source_id": 3
      }
    }
  ],
  "group_relations": []
}
"""
    )

    case5 = """## 示例5
输入：
old_queryspec_with_source
```
null
```
intentions
```
{
  "single_segment_intentions": [],
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
