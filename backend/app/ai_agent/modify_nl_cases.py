class ModifyNL_Cases:
    case1 = """## 示例1
输入：
old_QuerySpecWithSource:
```
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
          "value": 5,
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
        "max": {
          "value": 0,
          "inclusive": false,
          "text_source": {
            "text": "gradually",
            "index": 0
          }
        },
        "min": {
          "value": -1,
          "inclusive": true,
          "text_source": {
            "text": "gradually",
            "index": 0
          }
        }
      }
    }
  ],
  "relations": [],
  "trend_time_span_composition_conditions": []
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
[
  {
    "id": 0,
    "choices":["delta_percentage", "daily_average_delta_percentage", "abs_slope_percentage"]
  },
  {
    "id": 1,
    "choices":["delta_percentage", "daily_average_delta_percentage", "abs_slope_percentage"]
  }
]
```

输出：


    """
    case2 = """
    """
    case3 = """
    """
    case4 = """
    """
