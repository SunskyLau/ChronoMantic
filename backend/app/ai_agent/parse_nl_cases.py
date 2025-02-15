class ParseNL_Cases:
    case1 = """
输入：
"Find periods in AMZN when price first rose sharply then fell gradually"

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
"""

    case2 = """
输入：
"Find periods in DPZ when price first rose sharply then fell gradually, and the whole duration is about 3 months"

输出：
{
  "original_text": "Find periods in DPZ when price first rose sharply then fell gradually, and the whole duration is about 3 months",
  "target": {
    "target": "DPZ",
    "text_source": {
      "text": "DPZ",
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
  "trend_time_span_composition_conditions": {
    "min": {
      "value": 6912000,
      "inclusive": true,
      "text_source": {
        "text": "about 3 months",
        "index": 0
      }
    },
    "max": {
      "value": 8640000,
      "inclusive": true,
      "text_source": {
        "text": "about 3 months",
        "index": 0
      }
    }
  }
}
    """
    case3 = """
输入：
"Find periods in AMZN when price presented a double-bottom shape"

输出：
{
  "original_text": "Find periods in AMZN when price presented a double-bottom shape",
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
          "text": "double-bottom",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "up",
        "text_source": {
          "text": "double-bottom",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "double-bottom",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "up",
        "text_source": {
          "text": "double-bottom",
          "index": 0
        }
      }
    }
  ],
  "relations": [
    {
      "id1": 0,
      "id2": 2,
      "attribute": "END_VALUE",
      "comparator": "APPROXIMATELY_EQUAL_TO",
      "text_source": {
        "text": "double-bottom",
        "index": 0
      }
    }
  ],
  "trend_time_span_composition_conditions": []
}
    """
    case4 = """
输入：
"In Amazon stock, look up two consecutive rises and the time period when the first rose slowly and the second rose sharp"

输出：

    """
    case5 = """
    """
