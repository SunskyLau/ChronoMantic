from .constant import FUZZY_FACTOR


class ParseNL_Cases:
    case1 = """
Input:
Find periods in AMZN when price first rose sharply then fell gradually and the price was higher than 100

Output:
{
  "original_text": "Find periods in AMZN when price first rose sharply then fell gradually and the price was higher than 100",
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
    },
    {
      "text": "higher than 100",
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
      "relative_slope_scope_condition": {
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
      "relative_slope_scope_condition": {
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
  "group_relations": [],
  "min_value_scope_condition": {
    "min": {
      "value": 100,
      "inclusive": true
    },
    "text_source_id": 5
  }
}
"""

    case2 = """
Input:
Find periods in DPZ when price presented a double-bottom shape where the first bottom's slope was steeper than the second bottom's slope

Explanation:
1. Double-bottom represents two falling-rising trends, so it should be parsed as down->up->down->up.
2. The user's query is about a double-bottom shape where the first bottom's slope was steeper than the second bottom's slope, so it means the slope of `trend_id=0` < `trend_id=2` and `trend_id=1` > `trend_id=3`.
3. Note: If the user inputs triple-bottom, it should be parsed as three groups of such falling-rising patterns: down->up->down->up->down->up.

Output:
{
  "original_text": "Find periods in DPZ when price presented a double-bottom shape where the first bottom's slope was steeper than the second bottom's slope",
  "text_sources": [
    {
      "text": "DPZ",
      "index": 0
    },
    {
      "text": "double-bottom",
      "index": 0
    },
    {
      "text": "first bottom's slope was steeper than the second bottom's slope",
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
    },
    {
      "id1": 0,
      "id2": 2,
      "attribute": "slope",
      "comparator": "<",
      "text_source_id": 2
    },
    {
      "id1": 1,
      "id2": 3,
      "attribute": "slope",
      "comparator": ">",
      "text_source_id": 2
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
    """
    case3 = """
Input:
Find the time periods in Amazon stock when the price showed three consecutive peaks with the first rising trend's end value is greater than the last falling trend's start value and each trend's slope should be steeper than 10 per month

Explanation:
1. Three consecutive peaks represent three consecutive rising-falling trends, so it should be parsed as up->down->up->down->up->down.

Output:
{
  "original_text": "Find the time periods in Amazon stock when the price showed three consecutive peaks with the first rising trend's end value is greater than the last falling trend's start value and each trend's slope should be steeper than 10 per month",
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
      "text": "the first rising trend's end value is greater than the last falling trend's start value",
      "index": 0
    },
    {
      "text": "each trend's slope should be steeper than 10 per month",
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
      "slope_scope_condition": {
        "min": {
          "value": 10,
          "inclusive": true
        },
        "unit": "month",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 1
      },
      "slope_scope_condition": {
        "max": {
          "value": -10,
          "inclusive": true
        },
        "unit": "month",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 1
      },
      "slope_scope_condition": {
        "min": {
          "value": 10,
          "inclusive": true
        },
        "unit": "month",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 1
      },
      "slope_scope_condition": {
        "max": {
          "value": -10,
          "inclusive": true
        },
        "unit": "month",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "up",
        "text_source_id": 1
      },
      "slope_scope_condition": {
        "min": {
          "value": 10,
          "inclusive": true
        },
        "unit": "month",
        "text_source_id": 3
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 1
      },
      "slope_scope_condition": {
        "max": {
          "value": -10,
          "inclusive": true
        },
        "unit": "month",
        "text_source_id": 3
      }
    }
  ],
  "single_relations": [{
      "id1": 1,
      "id2": 5,
      "attribute": "start_value",
      "comparator": ">",
      "text_source_id": 2
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
    """
    case4 = """
Input:
Find periods in AMZN when price presented a head-and-shoulders shape followed by a cup-with-handle shape

Explanation:
1. Head-and-shoulders is a head-and-shoulders pattern, shaped as up->down->up->down->up->down, with the "head" (`trend_id=2`) being higher than the "shoulders" (`trend_id=0` and `trend_id=4`).
2. Cup-with-handle is a cup-and-handle pattern, shaped as down->down->up->up->down, with the "handle" (`trend_id=5`) being higher than the "cup" (`trend_id=3`).
3. The user's query is about a head-and-shoulders shape followed by a cup-with-handle shape, so it should be parsed as up->down->up->down->up->down->down->down->up->up->down.

Output:
{
  "original_text": "Find periods in AMZN when price presented a head-and-shoulders shape followed by a cup-with-handle shape",
  "text_sources": [
    {
      "text": "AMZN",
      "index": 0
    },
    {
      "text": "head-and-shoulders",
      "index": 0
    },
    {
      "text": "cup-with-handle",
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
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 2
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 2
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
        "category": "up",
        "text_source_id": 2
      }
    },
    {
      "category": {
        "category": "down",
        "text_source_id": 2
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
    },
    {
      "id1": 6,
      "id2": 7,
      "attribute": "relative_slope",
      "comparator": ">",
      "text_source_id": 2
    },
    {
      "id1": 8,
      "id2": 9,
      "attribute": "relative_slope",
      "comparator": "<",
      "text_source_id": 2
    },
    {
      "id1": 7,
      "id2": 10,
      "attribute": "end_value",
      "comparator": "<",
      "text_source_id": 2
    }
  ],
  "trend_groups": [],
  "group_relations": []
}
    """

    case5 = (
        """
Input:
Find periods in AMZN when price first presented a double-bottom shape with a duration of about two weeks and then presented a double-top shape with a duration higher than the first double-bottom's duration

Explanation:
1. The user's query is about a double-bottom shape, which means a downtrend followed by a rising trend repeated twice (down->up->down->up).
2. The user's query is also about a double-top shape, which means a rising trend followed by a falling trend repeated twice (up->down->up->down).
3. The user's query is about a duration of about two weeks, which means the duration of the first double-bottom shape(trend_id=0 to trend_id=3) is about two weeks.
4. The user's query is also about a duration higher than the first double-bottom's duration, which means the duration of the second double-top shape(trend_id=4 to trend_id=7) is higher than the first double-bottom shape(trend_id=0 to trend_id=3).

Output:
{
  "original_text": "Find periods in AMZN when price first presented a double-bottom shape with a duration of about two weeks and then presented a double-top shape with a duration higher than the first double-bottom's duration",
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
      "text": "with a duration of about two weeks",
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
  "group_relations": [
    {
      "group1": [0, 3],
      "group2": [4, 7],
      "attribute": "duration",
      "comparator": "<",
      "text_source_id": 4
    }
  ]
}
    """
    )

    case6 = (
        """
Input:
Find periods when price presented a high plateau shape with a slope of downtrend is about 20%/week, and totally the uptrend's start value is approximately equal to the end value of the downtrend

Explanation:
1. The user's query is about a high plateau shape, which means a rising trend followed by a flat trend followed by a downtrend (up->flat->down).
2. Trends need to be distinguished between rising and falling, and negative slopes should be used when falling. Because user didn't specify the slope, the slope should be set according to the fuzzy factor.
3. You can't find a valid trend of other trend_id(uptrend's previous id is equal to -1, and downtrend's next id is out of range), so you should set compare_between_start_end_value.

Output:
{
  "original_text": "Find periods when price presented a high plateau shape with a slope of downtrend is about 20%/week",
  "text_sources": [
    {
      "text": "a high plateau shape",
      "index": 0
    },
    {
      "text": "a slope of downtrend is about 20%/week",
      "index": 0
    },
    {
      "text": "totally the uptrend's start value is approximately equal to the end value of the downtrend",
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
        "text_source_id": 1
      }
    }
  ],
  "single_relations": [],
  "trend_groups": [],
  "group_relations": [],
  "comparator_between_start_end_value": {
    "comparator": "~=",
    "text_source_id": 2
  }
}
"""
    )
