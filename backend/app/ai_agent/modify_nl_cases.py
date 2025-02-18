class ModifyNL_Cases:
    case1 = """## 示例1
输入：
old_queryspec_with_source:
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
    "slope": 2.5,
    "start_value": 100,
    "end_value": 150,
    "start_time": 1672531200,
    "end_time": 1672617600,
    "delta_percentage": 50,
    "daily_average_delta_percentage": 5.66,
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
    "daily_average_delta_percentage": -0.98,
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
      "single_choices":["daily_average_delta_percentage"]
    },
    {
      "id": 1,
      "single_choices":["daily_average_delta_percentage"]
    }
  ],
  "group_intentions": [],
  "single_relation_intentions": [],
  "group_relation_intentions": []
}
```

输出：
{
  "original_text": "Find periods in AMZN when price first rose sharply then fell gradually",
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
      "daily_average_delta_percentage_scope_condition": {
        "min": {
          "value": 4.5,
          "inclusive": true,
          "text_source": {
            "text": "sharply",
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
      "daily_average_delta_percentage_scope_condition": {
        "min": {
          "value": -1.5,
          "inclusive": true,
          "text_source": {
            "text": "gradually",
            "index": 0
          }
        },
        "max": {
          "value": 0,
          "inclusive": false,
          "text_source": {
            "text": "gradually",
            "index": 0
          }
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
