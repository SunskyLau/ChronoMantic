import json
import os
from typeguard import typechecked
from openai import OpenAI, AzureOpenAI
from openai.types.chat import ChatCompletion
from typing import List, Dict, Optional

from .prompts import create_parse_nl_prompt
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
                temperature=0.1,
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


def get_query_spec(system_prompt: str, query: str) -> Dict:
    client = myAIClient(model=Qwen.MODELS.QWEN_MAX, platform=Platforms.QWEN)
    response = client.send_prompt(system_prompt, query, keep_history=False, if_json_format=True)
    return json.loads(response)["output"]


if __name__ == "__main__":
    client = myAIClient(model=Qwen.MODELS.QWEN_MAX, platform=Platforms.QWEN)
    # client = myAIClient(model=Azure.MODELS.GPT_4O, platform=Platforms.AZURE)
    # client = myAIClient(model=SiliconFlow.MODELS.DEEPSEEK_V3, platform=Platforms.SILIICONFLOW)
    # client = myAIClient(model=Tencent.MODELS.DEEPSEEK_V3, platform=Platforms.TENCENT)

    dataset_info = """{"time_column": "Date", "value_columns": ["AMZN", "DPZ", "BTC", "NFLX"]}"""
    system_prompt = create_parse_nl_prompt(dataset_info)
    print(system_prompt)
    nl_query = "Find periods in DPZ when price first rose sharply then fell gradually, and the whole duration is about 3 months"
    response = client.send_prompt(system_prompt, nl_query, False)
