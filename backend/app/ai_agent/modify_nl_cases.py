class ModifyNL_Cases:
    case1 = """## 示例1
输入：
old_queryspec_with_source:
```
{
  "original_text": "Find periods in AMZN when price first fell then presented a flat trend",
  "target": {
    "target": "AMZN",
    "text_source": {
      "text": "AMZN", 
      "index": 0
    }
  },
  "trends": [
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "fell",
          "index": 0
        }
      },
    },
    {
      "category": {
        "category": "flat",
        "text_source": {
          "text": "a flat trend",
          "index": 0
        }
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
  "target": {
    "target": "AMZN",
    "text_source": {
      "text": "AMZN", 
      "index": 0
    }
  },
  "trends": [
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "fell",
          "index": 0
        }
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
        "text_source": {
          "text": "slightly",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "flat",
        "text_source": {
          "text": "a flat trend",
          "index": 0
        }
      },
    },
    {
      "category": {
        "category": "up",
        "text_source": {
          "text": "rose",
          "index": 0
        }
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
        "text_source": {
          "text": "sharply",
          "index": 0
        }
      } 
    }
  ],
  "single_relations": [],
  "trend_groups": [],
  "group_relations": []
}
    """
    case2 = """
输入：
old_QuerySpecWithSource:
```
{
  "original_text": "Find periods in AMZN when price first rose then fell",
  "target": {
    "target": "AMZN",
    "text_source": {
      "text": "AMZN", 
      "index": 0
    }
  },
  "trends": [
    {
      "category": {
        "category": "up",
        "text_source": {
          "text": "rose",
          "index": 0
        }
      },
    },
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "fell",
          "index": 0
        }
      }
    }
  ],
  "single_relations": [],
  "trend_groups": [],
  "group_relations": [],
}
```

segments:
```
[
  {
    "source": "user",
    "slope": -0.5,
    "start_value": 150,
    "end_value": 100,
    "start_time": 1672444800,
    "end_time": 1672531200,
    "delta_percentage": -33.3,
    "daily_average_delta_percentage": -3,
    "abs_slope_percentage": 80,
    "time_span": 86400
  },
  {
    "source": "result",
    "slope": 2.5,
    "start_value": 100,
    "end_value": 150,
    "start_time": 1672531200,
    "end_time": 1672617600,
    "delta_percentage": 50,
    "daily_average_delta_percentage": 10,
    "abs_slope_percentage": 80,
    "time_span": 86400
  },
  {
    "source": "result", 
    "slope": -1.2,
    "start_value": 150,
    "end_value": 120,
    "start_time": 1672617600,
    "end_time": 1672704000,
    "delta_percentage": -20,
    "daily_average_delta_percentage": -5,
    "abs_slope_percentage": 40,
    "time_span": 86400
  }
]
```

intentions:
```
{
  "single_intentions": [
    {
      "id": 0,
      "single_choices":["category"]
    }
    {
      "id": 1,
      "single_choices":["time_span"]
    },
  ],
  "group_intentions": [],
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

输出:
{
  "original_text": "Find periods in AMZN when price first fell then rose with a duration of about 1 day and then fell with a slope steeper than first fall",
  "target": {
    "target": "AMZN",
    "text_source": {
      "text": "AMZN",
      "index": 0
    }
  },
  "trends": [
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "fell",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "up",
        "text_source": {
          "text": "rose",
          "index": 0
        }
      },
      "time_span_condition": {
        "min": {
          "value": 86400,
          "inclusive": true,
          "text_source": {
            "text": "about 1 day",
            "index": 0
          }
        },
        "max": {
          "value": 172800,
          "inclusive": true,
          "text_source": {
            "text": "about 1 day",
            "index": 0
          }
        }
      }
    },
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "fell",
          "index": 0
        }
      },
    }
  ],
  "single_relations": [
    {
      "id1": 0,
      "id2": 2,
      "attribute": "slope",
      "comparator": ">",
      "text_source": {
        "text": "with a slope steeper than first fall",
        "index": 0
      }
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
    """
    case3 = """
    """
    case4 = """
    """
