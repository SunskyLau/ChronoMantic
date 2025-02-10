import json
import os
from typeguard import typechecked
from openai import OpenAI, AzureOpenAI
from openai.types.chat import ChatCompletion
from typing import List, Dict, Optional
from .constant import (
    AZURE_OPENAI_KEY,
    DEEPSEEK,
    DEEPSEEK_AI_DEEPSEEK_V3,
    DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL,
    AZURE,
    DEEPSEEK_CHAT,
    GPT_4O,
    QWEN,
    SILIICONFLOW,
    SILIICONFLOW_API_KEY,
)
from .debugger import debugger


@typechecked
class myAIClient:
    def __init__(self, model: str, platform: str):
        self.model: str = model
        self.chatHistory: List[Dict[str, str]] = []
        if platform == DEEPSEEK:
            self.client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)
        elif platform == AZURE:
            self.client = AzureOpenAI(
                api_key=AZURE_OPENAI_KEY,
                api_version="2024-11-01-preview",
                azure_endpoint="https://idg-oai.openai.azure.com/",
            )
        elif platform == SILIICONFLOW:
            self.client = OpenAI(api_key=SILIICONFLOW_API_KEY, base_url="https://api.siliconflow.cn/v1")
        else:
            raise ValueError("Invalid platform")

    def send_prompt(self, system_prompt: str, user_prompt: str, keep_history: bool, if_json_format: bool = True) -> str:
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
                frequency_penalty=0,
                presence_penalty=0,
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
    # client = myAIClient(GPT_4O, AZURE)
    # client = myAIClient(DEEPSEEK_CHAT, DEEPSEEK)
    client = myAIClient(DEEPSEEK_AI_DEEPSEEK_V3, SILIICONFLOW)
    # client = myAIClient(QWEN, SILIICONFLOW)

    response = client.send_prompt(system_prompt, query, keep_history=False, if_json_format=False)
    return json.loads(response)["output"]


if __name__ == "__main__":
    client = myAIClient(DEEPSEEK_AI_DEEPSEEK_V3, SILIICONFLOW)
    response = client.send_prompt("You are a helpful assistant!", "你是谁？", keep_history=False, if_json_format=True)
