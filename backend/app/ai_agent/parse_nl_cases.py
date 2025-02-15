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
      "start": 16,
      "end": 20
    }
  },
  "trends": [
    {
      "category": {
        "category": "up",
        "text_source": {
          "text": "rose",
          "start": 38,
          "end": 42
        }
      },
      "daily_average_delta_percentage_scope_condition": {
        "min": {
          "value": 5,
          "inclusive": true,
          "text_source": {
            "text": "sharply",
            "start": 43,
            "end": 50
          }
        }
      }
    },
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "fell",
          "start": 56,
          "end": 60
        }
      },
      "daily_average_delta_percentage_scope_condition": {
        "max": {
          "value": -1,
          "inclusive": true,
          "text_source": {
            "text": "gradually",
            "start": 61,
            "end": 70
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
      "start": 16,
      "end": 19
    }
  },
  "trends": [
    {
      "category": {
        "category": "up",
        "text_source": {
          "text": "rose",
          "start": 37,
          "end": 41
        }
      },
      "daily_average_delta_percentage_scope_condition": {
        "min": {
          "value": 5,
          "inclusive": true,
          "text_source": {
            "text": "sharply",
            "start": 42,
            "end": 49
          }
        }
      }
    },
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "fell",
          "start": 55,
          "end": 59
        }
      },
      "daily_average_delta_percentage_scope_condition": {
        "max": {
          "value": -1,
          "inclusive": true,
          "text_source": {
            "text": "gradually",
            "start": 60,
            "end": 69
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
        "start": 84,
        "end": 98
      }
    },
    "max": {
      "value": 8640000,
      "inclusive": true,
      "text_source": {
        "text": "about 3 months",
        "start": 84,
        "end": 98
      }
    }
  }
}
    """
    case3 = """
输入：
"Show me the periods when the price of Amazon stock shows a sharp head-and-shoulders shape and before that it resembles a slowly formed V shape over 20 days"

输出：

    """
    case4 = """
输入：
"In Amazon stock, look up two consecutive rises and the time period when the first rose slowly and the second rose sharp"

输出：

    """
    case5 = """
    """
