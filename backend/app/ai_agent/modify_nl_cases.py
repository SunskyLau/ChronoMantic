class ModifyNL_Cases:
    case1 = """## 示例1
输入：
old_queryspec_with_source:
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
  "target": {
    "target": "AMZN",
    "text_source_id": 0
  },
  "trends": [
    {
      "category": {
        "category": "down",
        "text_source_id": 1
      },
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
  "group_relations": [],
}
```

segments:
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

intentions:
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
  "segment_group_intentions": [],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

输出：
{
  "original_text": "Find periods in AMZN when price first fell slightly then presented a flat trend then rose sharply",
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
      "text": "slightly",
      "index": 0
    },
    {
      "text": "a flat trend",
      "index": 0
    },
    {
      "text": "rose",
      "index": 0
    },
    {
      "text": "sharply",
      "index": 0
    }
  ],
  "target": {
    "target": "AMZN",
    "text_source_id": 0
  },
  "trends": [
    {
      "category": {
        "category": "down",
        "text_source_id": 1
      },
      "daily_average_delta_percentage_scope_condition": {
        "min": {
          "value": -1.5,
          "inclusive": true,
        },
        "max": {
          "value": 0,
          "inclusive": false,
        },
        "text_source_id": 2
      }
    },
    {
      "category": {
        "category": "flat",
        "text_source_id": 3
      },
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 4
      },
      "daily_average_delta_percentage_scope_condition": {
        "min": {
          "value": 10,
          "inclusive": true,
        },
        "max": {
          "value": 20,
          "inclusive": false,
        },
        "text_source_id": 5
      } 
    }
  ],
  "single_relations": [],
  "trend_groups": [],
  "group_relations": []
}
    """
    case2 = """
    """
    case3 = """
    """
    case4 = """
    """
