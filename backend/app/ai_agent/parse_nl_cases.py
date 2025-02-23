class ParseNL_Cases:
    case1 = """
输入：
Find periods in AMZN when price first rose sharply then fell gradually

输出：
{
  "original_text": "Find periods in AMZN when price first rose sharply then fell gradually",
  "text_sources": [
    {
      "text": "AMZN",
      "index": 0
    },
    {
      "text": "rose",
      "index": 0
    },
    {
      "text": "sharply",
      "index": 0
    },
    {
      "text": "fell",
      "index": 0
    },
    {
      "text": "gradually",
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
          "value": 80,
          "inclusive": true
        },
        "text_source_id": 2
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 3
      },
      "abs_slope_percentage_scope_condition": {
        "max": {
          "value": 20,
          "inclusive": true
        },
        "text_source_id": 4
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
Find periods in DPZ when price presented a double-bottom shape

输出：
{
  "original_text": "Find periods in DPZ when price presented a double-bottom shape",
  "text_sources": [
    {
      "text": "DPZ",
      "index": 0
    },
    {
      "text": "double-bottom",
      "index": 0
    }
  ],
  "targets": [
    {
      "target": "DPZ",
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
    }
  ],
  "single_relations": [
    {
      "id1": 0,
      "id2": 2,
      "attribute": "end_value",
      "comparator": "~=",
      "text_source_id": 1
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
    """
    case3 = """
输入：
Find the time periods in Amazon stock when the price showed three consecutive peaks and the peaks got higher and higher

输出：
{
  "original_text": "Find the time periods in Amazon stock when the price showed three consecutive peaks and the peaks got higher and higher",
  "text_sources": [
    {
      "text": "Amazon stock",
      "index": 0
    },
    {
      "text": "three consecutive peaks",
      "index": 0
    },
    {
      "text": "peaks got higher and higher",
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
      "id1": 0,
      "id2": 2,
      "attribute": "end_value",
      "comparator": "<",
      "text_source_id": 2
    },
    {
      "id1": 2,
      "id2": 4,
      "attribute": "end_value",
      "comparator": "<",
      "text_source_id": 2
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
    """
    case4 = """
输入：
Find periods in AMZN when price presented a head-and-shoulders shape

输出：
{
  "original_text": "Find periods in AMZN when price presented a head-and-shoulders shape",
  "text_sources": [
    {
      "text": "AMZN",
      "index": 0
    },
    {
      "text": "head-and-shoulders",
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
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
    """

    case5 = """
输入：
Find periods in AMZN when price first presented a double-bottom shape with a duration of about a week and then presented a double-top shape with a duration higher than the first double-bottom's duration

输出：
{
  "original_text": "Find periods in AMZN when price first presented a double-bottom shape with a duration of about a week and then presented a double-top shape with a duration higher than the first double-bottom's duration",
  "text_sources": [
    {
      "text": "AMZN",
      "index": 0
    },
    {
      "text": "a double-bottom",
      "index": 0
    },
    {
      "text": "with a duration of about a week",
      "index": 0
    },
    {
      "text": "a double-top",
      "index": 0
    },
    {
      "text": "with a duration higher than the first double-bottom's duration",
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
        "category": "up",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 3
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
        "text_source_id": 3
      }
    }
  ],
  "single_relations": [
    {
      "id1": 0,
      "id2": 2,
      "attribute": "end_value",
      "comparator": "~=",
      "text_source_id": 1
    },
    {
      "id1": 4,
      "id2": 6,
      "attribute": "end_value",
      "comparator": "~=",
      "text_source_id": 3
    }
  ],
  "trend_groups": [
    {
      "ids": [0, 3],
      "time_span_condition": {
        "min": {
          "value": 432000,
          "inclusive": true
        },
        "max": {
          "value": 777600,
          "inclusive": true
        },
        "text_source_id": 2
      }
    }
  ],
  "group_relations": [
    {
      "group1": [0, 3],
      "group2": [4, 7],
      "attribute": "time_span",
      "comparator": "<",
      "text_source_id": 4
    }
  ]
}
    """

    case6 = """
输入：
Find periods when price presented a high plateau shape

输出：
{
  "original_text": "Find periods when price presented a high plateau shape",
  "text_sources": [
    {
      "text": "a high plateau shape",
      "index": 0
    }
  ],
  "targets": [],
  "trends": [
    {
      "category": {
        "category": "up",
        "text_source_id": 0
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
      }
    }
  ],
  "single_relations": [],
  "trend_groups": [],
  "group_relations": []
}
"""
