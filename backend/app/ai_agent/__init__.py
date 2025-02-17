import json
import os
from typeguard import typechecked
from openai import OpenAI, AzureOpenAI
from openai.types.chat import ChatCompletion
from typing import List, Dict, Optional

from .prompts import create_parse_nl_prompt, create_modify_nl_prompt
from .constant import (
    Azure,
    DeepSeek,
    SiliconFlow,
    Qwen,
    Platforms,
    Tencent,
)
from .debugger import debugger


@typechecked
class myAIClient:
    def __init__(self, model: str, platform: str):
        self.model: str = model
        self.chatHistory: List[Dict[str, str]] = []

        if platform == Platforms.AZURE:
            self.client = AzureOpenAI(
                api_key=Azure.API_KEY,
                api_version=Azure.API_VERSION,
                azure_endpoint=Azure.ENDPOINT,
            )
        elif platform == Platforms.DEEPSEEK:
            self.client = OpenAI(api_key=DeepSeek.API_KEY, base_url=DeepSeek.BASE_URL)
        elif platform == Platforms.SILIICONFLOW:
            self.client = OpenAI(api_key=SiliconFlow.API_KEY, base_url=SiliconFlow.BASE_URL)
        elif platform == Platforms.QWEN:
            self.client = OpenAI(api_key=Qwen.API_KEY, base_url=Qwen.BASE_URL)
        elif platform == Platforms.TENCENT:
            self.client = OpenAI(api_key=Tencent.API_KEY, base_url=Tencent.BASE_URL)
        else:
            raise ValueError("Invalid platform")

    def send_prompt(self, system_prompt: str, user_prompt: str, if_json_format: bool = True, keep_history: bool = False) -> str:
        debugger.info("--------send prompt---------\n" + user_prompt)

        if self.client is None:
            raise RuntimeError("No client")

        if keep_history:
            self.chatHistory.append({"role": "user", "content": user_prompt})
        else:
            self.chatHistory = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]

        response: Optional[ChatCompletion] = None
        try:
            response = self.client.chat.completions.create(
                messages=self.chatHistory,
                model=self.model,
                temperature=0,
                max_tokens=4096,
                top_p=1,
                frequency_penalty=0.1,
                presence_penalty=0.1,
                stop=None,
                response_format={"type": "json_object"} if if_json_format else None,
            )
        except Exception as e:
            debugger.error(f"[sendPrompt] {e}")
            return ""

        text = response.choices[0].message.content
        if text is None:
            raise RuntimeError("No text provided")

        if keep_history:
            self.chatHistory.append({"role": "assistant", "content": text})

        debugger.info("--------response--------\n" + text)
        debugger.info("--------finished--------")

        return text


def parse_nl_query(system_prompt: str, query: str) -> Dict:
    client = myAIClient(model=Qwen.MODELS.QWEN_MAX, platform=Platforms.QWEN)
    response = client.send_prompt(system_prompt, query, False)
    return json.loads(response)



def modify_nl_query(system_prompt: str, query: str) -> Dict:
    client = myAIClient(model=Qwen.MODELS.QWEN_MAX, platform=Platforms.QWEN)
    response = client.send_prompt(system_prompt, query, False)
    return json.loads(response)


def test_parse_nl_query():
    client = myAIClient(model=Qwen.MODELS.QWEN_MAX, platform=Platforms.QWEN)
    dataset_info = """{"time_column": "Date", "value_columns": ["AMZN", "DPZ", "BTC", "NFLX"]}"""
    system_prompt = create_parse_nl_prompt(dataset_info)
    # nl_query = "Find periods in AMZN when price first rose sharply then fell gradually"
    # nl_query = "Find periods in DPZ when price first fall sharply then rise gradually, and the whole duration is about 3 months"
    # nl_query = "Find periods in AMZN when price presented a head-and-shoulders shape"
    # nl_query = "Find periods in DPZ when price presented a triple-tops shape"
    # nl_query = "Find the time periods in Amazon stock when the price showed three consecutive peaks and the peaks got higher and higher"
    # nl_query = "Find periods in Amazon stock where prices rose slowly, then rose quickly"
    # nl_query = "Find periods in AMZN when price first fell sharply with a duration of about 3 days and then presented a double-bottom shape with a duration of about a week."
    nl_query = "In Amazon stock, look up two consecutive rises and the first rise is more gentle than the second rise"
    response = client.send_prompt(system_prompt, nl_query, False)
    print(response)


def test_modify_nl_query():
    client = myAIClient(model=Qwen.MODELS.QWEN_MAX, platform=Platforms.QWEN)
    system_prompt = create_modify_nl_prompt()
    modify_prompt = """
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
  "relations": [],
  "trend_time_span_composition_conditions": []
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
    {
      "id": 2,
      "single_choices":["daily_average_delta_percentage"]
    }
  ],
  "group_intentions": [],
  "relation_intentions": [
    {
      "id1": 0,
      "id2": 2,
      "relation_choice": "slope"
    }
  ]
}
```
    """
    response = client.send_prompt(system_prompt, modify_prompt, False)
    print(response)


if __name__ == "__main__":
    # test_parse_nl_query()
    test_modify_nl_query()
