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
  "single_relations": [],
  "trend_groups": [],
  "group_relations": [],
}
"""

    case2 = """
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
  "single_relations": [
    {
      "id1": 0,
      "id2": 2,
      "attribute": "end_value",
      "comparator": "~=",
      "text_source": {
        "text": "double-bottom",
        "index": 0
      }
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
    """
    case3 = """
输入：
"Find the time periods in Amazon stock when the price showed three consecutive peaks and the peaks got higher and higher"

输出：
{
  "original_text": "Find the time periods in Amazon stock when the price showed three consecutive peaks and the peaks got higher and higher",
  "target": {
    "target": "AMZN",
    "text_source": {
      "text": "Amazon stock",
      "index": 0
    }
  },
  "trends": [
    {
      "category": {
        "category": "up",
        "text_source": {
          "text": "three consecutive peaks",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "three consecutive peaks",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "up",
        "text_source": {
          "text": "three consecutive peaks",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "three consecutive peaks",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "up",
        "text_source": {
          "text": "three consecutive peaks",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "three consecutive peaks",
          "index": 0
        }
      }
    }
  ],
  "single_relations": [
    {
      "id1": 0,
      "id2": 2,
      "attribute": "end_value",
      "comparator": "<",
      "text_source": {
        "text": "the peaks got higher and higher",
        "index": 0
      }
    },
    {
      "id1": 2,
      "id2": 4,
      "attribute": "end_value",
      "comparator": ">",
      "text_source": {
        "text": "the peaks got higher and higher",
        "index": 0
      }
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
    """
    case4 = """
输入：
"Find periods in AMZN when price presented a head-and-shoulders shape"

输出：
{
  "original_text": "Find periods in AMZN when price presented a head-and-shoulders shape",
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
          "text": "head-and-shoulders",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "head-and-shoulders",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "up",
        "text_source": {
          "text": "head-and-shoulders",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "head-and-shoulders",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "up",
        "text_source": {
          "text": "head-and-shoulders",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "head-and-shoulders",
          "index": 0
        }
      }
    }
  ],
  "single_relations": [
    {
      "id1": 0,
      "id2": 2,
      "attribute": "end_value",
      "comparator": "<",
      "text_source": {
        "text": "head-and-shoulders",
        "index": 0
      }
    },
    {
      "id1": 2,
      "id2": 4,
      "attribute": "end_value",
      "comparator": ">",
      "text_source": {
        "text": "head-and-shoulders",
        "index": 0
      }
    },
    {
      "id1": 4,
      "id2": 0,
      "attribute": "end_value",
      "comparator": "~=",
      "text_source": {
        "text": "head-and-shoulders",
        "index": 0
      }
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
	"""

    case5 = """
输入：
"Find periods in AMZN when price first rose sharply with a duration of about 3 days and then presented a double-bottom shape with a duration of about a week."

输出：
{
  "original_text": "Find periods in AMZN when price first rose sharply with a duration of about 3 days and then presented a double-bottom shape with a duration of about a week.",       
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
      },
      "time_span_condition": {
        "min": {
          "value": 259200,
          "inclusive": true,
          "text_source": {
            "text": "about 3 days",
            "index": 0
          }
        },
        "max": {
          "value": 432000,
          "inclusive": true,
          "text_source": {
            "text": "about 3 days",
            "index": 0
          }
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
  "single_relations": [
    {
      "id1": 1,
      "id2": 3,
      "attribute": "end_value",
      "comparator": "~=",
      "text_source": {
        "text": "double-bottom",
        "index": 0
      }
    }
  ],
  "trend_groups": [
    {
      "ids": [1, 4],
      "time_span_condition": {
        "min": {
          "value": 432000,
          "inclusive": true
        },
        "max": {
          "value": 777600,
          "inclusive": true
        }
      },
      "text_source": {
        "text": "about a week",
        "index": 0
      }
    }
  ],
  "group_relations": []
}
    """
