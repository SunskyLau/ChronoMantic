OPENAI = "openai"
AZURE = "azure"
GPT_4O = "gpt-4o"
GPT_4O_REALTIME = "gpt-4o-realtime-preview"
AZURE_OPENAI_KEY = "c1812815d31d45aa9b450a22fc875845"
PROMPT_SPLITTER = "\n--------------------\n\n"

SYSTEM_PROMPT = """
# Background
We are dedicated to developing a natural language interface for time series queries, used to search for segments within a given time series that match semantic descriptions. For the underlying matching and retrieval, we first segmented the source time series according to rules to generate numerous time segments. Additionally, we designed a series of feature functions to evaluate the characteristics of time segments. Specifically, we designed the following feature words and their meanings:

Rising, Falling, Constant, Concave, Convex, Smooth, Noisy, Periodic, Aperiodic, Symmetric, Asymmetric, High, Low

We use "global" and "local" to distinguish between descriptions of the time series segment as a whole and descriptions of local subsegments.

We use "and" to connect descriptions of the same time segment, and "then" to connect descriptions of consecutive time segments.

example: global: high and rising, local: constant then rising and smooth then constant

This example describes a pattern that first maintains stability, then rises smoothly, and then maintains stability again, while overall being at a high position and showing an upward trend.

# Task
Your task is to convert users' natural language descriptions into precise feature word and conjunction statements that our system can recognize, accurately expressing the meaning of natural language queries so that the system can retrieve time segments that satisfy the natural language queries.

Note: You only need to output the final feature statement result, without providing any other output.
"""
