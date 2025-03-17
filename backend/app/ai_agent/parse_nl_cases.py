from .constant import FUZZY_FACTOR


class ParseNL_Cases:
    case1 = """
Input:
Find periods in AMZN when price first rose sharply then fell gradually and the price was higher than 100

Output:
{
  "original_text": "Find periods in AMZN when price first rose sharply then fell gradually and the price was higher than 100",
  "text_sources": [
    { "text": "AMZN" },
    { "text": "rose" },
    { "text": "sharply" },
    { "text": "fell" },
    { "text": "gradually" },
    { "text": "higher than 100" }
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
    { "text": "DPZ" },
    { "text": "double-bottom" },
    { "text": "first bottom's slope was steeper than the second bottom's slope" }
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
    { "text": "Amazon stock" },
    { "text": "three consecutive peaks" },
    { "text": "the first rising trend's end value is greater than the last falling trend's start value" },
    { "text": "each trend's slope should be steeper than 10 per month" }
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
    { "text": "AMZN" },
    { "text": "head-and-shoulders" },
    { "text": "cup-with-handle" }
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
    { "text": "AMZN" },
    { "text": "a double-bottom" },
    { "text": "with a duration of about two weeks" },
    { "text": "a double-top" },
    { "text": "with a duration higher than the first double-bottom's duration" }
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
    { "text": "a high plateau shape" },
    { "text": "a slope of downtrend is about 20%/week" },
    { "text": "totally the uptrend's start value is approximately equal to the end value of the downtrend" }
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

    case7 = (
        """
Input:
look for a pattern that rises, then rises again with a smaller relative slope and a smaller slope compared to the first rise, then rises once more with a duration approximately equal to the first rise, and the overall duration of the pattern is about 25 months, and the start value of this pattern is greater than the end value

Output:
{
  "original_text": "look for a pattern that rises, then rises again with a smaller relative slope and a smaller slope compared to the first rise, then rises once more with a duration approximately equal to the first rise, and the overall duration of the pattern is about 25 months, and the start value of this pattern is greater than the end value",
  "text_sources": [
    { "text": "rises" },
    { "text": "rises again with a smaller relative slope and a smaller slope compared to the first rise" },
    { "text": "rises once more with a duration approximately equal to the first rise" },
    { "text": "overall duration of the pattern is about 25 months" },
    { "text": "the start value of this pattern is greater than the end value" }
  ],
  "targets": [],
  "single_relations": [
    {
      "attribute": "relative_slope",
      "comparator": ">",
      "id1": 0,
      "id2": 1,
      "text_source_id": 1
    },
    {
      "attribute": "slope",
      "comparator": ">",
      "id1": 0,
      "id2": 1,
      "text_source_id": 1
    },
    {
      "attribute": "duration",
      "comparator": "~=",
      "id1": 0,
      "id2": 2,
      "text_source_id": 2
    }
  ],
  "trend_groups": [],
  "trends": [
    {
      "category": {
        "category": "up",
        "text_source_id": 0
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
        "text_source_id": 2
      }
    }
  ],
  "duration_condition": {
    "max": {
      "inclusive": true,
      "value": """
        + str(25 * (1 + FUZZY_FACTOR))
        + """
    },
    "min": {
      "inclusive": true,
      "value": """
        + str(25 * (1 - FUZZY_FACTOR))
        + """
    },
    "text_source_id": 3,
    "unit": "month"
  },
  "comparator_between_start_end_value": {
    "comparator": "<",
    "text_source_id": 4
  },
  "group_relations": []
}
"""
    )
