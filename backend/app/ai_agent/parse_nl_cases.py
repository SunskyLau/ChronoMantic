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
        },
        "text_source": {
          "text": "sharply",
          "index": 0
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
        },
        "min": {
          "value": -1,
          "inclusive": true,
        },
        "text_source": {
          "text": "gradually",
          "index": 0
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
      "comparator": "<",
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
"Find periods in AMZN when price first presented a double-bottom shape with a duration of about a week and then presented a double-top shape with a duration higher than the first double-bottom's duration"

输出：
{
  "original_text": "Find periods in AMZN when price first presented a double-bottom shape with a duration of about a week and then presented a double-top shape with a duration higher than the first double-bottom's duration",
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
    },
    {
      "category": {
        "category": "up",
        "text_source": {
          "text": "double-top",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "double-top",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "up",
        "text_source": {
          "text": "double-top",
          "index": 0
        }
      }
    },
    {
      "category": {
        "category": "down",
        "text_source": {
          "text": "double-top",
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
    },
    {
      "id1": 4,
      "id2": 6,
      "attribute": "end_value",
      "comparator": "~=",
      "text_source": {
        "text": "double-top",
        "index": 0
      }
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
        }
      },
      "text_source": {
        "text": "about a week",
        "index": 0
      }
    },
  ],
  "group_relations": [
    {
      "group1": [0, 3],
      "group2": [4, 7],
      "attribute": "time_span",
      "comparator": "<",
      "text_source": {
        "text": "higher than the first double-bottom's duration",
        "index": 0
      }
    }
  ]
}
    """
