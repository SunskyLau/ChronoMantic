import os
from typeguard import typechecked
from openai import OpenAI, AzureOpenAI
from openai.types.chat import ChatCompletion
from typing import List, Dict, Optional
from .constant import (
    AZURE_OPENAI_KEY,
    OPENAI,
    AZURE,
    GPT_4O,
    GPT_4O_REALTIME,
)
from .debugger import debugger


@typechecked
class myAIClient:
    def __init__(self, model: str, platform: str):
        self.model: str = model
        self.chatHistory: List[Dict[str, str]] = []
        if platform == OPENAI:
            self.client = OpenAI(api_key="c1812815d31d45aa9b450a22fc875845")
        elif platform == AZURE:
            self.client = AzureOpenAI(
                api_key=AZURE_OPENAI_KEY,
                # api_version="2024-09-01-preview",
                api_version="2024-11-01-preview",
                azure_endpoint="https://idg-oai.openai.azure.com/",
            )
        else:
            raise ValueError("Invalid platform")

    def sendPrompt(self, system_prompt: str, user_prompt: str, keepHistory: bool, if_response_format: bool = True) -> str:
        debugger.info("--------send prompt---------\n" + user_prompt)

        if self.client is None:
            raise RuntimeError("No client")

        if keepHistory:
            self.chatHistory.append({"role": "user", "content": user_prompt})
        else:
            self.chatHistory = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]

        response: Optional[ChatCompletion] = None
        try:
            if self.model == [GPT_4O, GPT_4O_REALTIME]:
                response = self.client.chat.completions.create(
                    messages=self.chatHistory,
                    model=self.model,
                    temperature=0.3,
                    max_tokens=4096,
                    top_p=1,
                    frequency_penalty=0,
                    presence_penalty=0,
                    stop=None,
                    response_format={"type": "json_object"} if if_response_format else None,
                )
            else:
                response = self.client.chat.completions.create(messages=self.chatHistory, model=self.model)
        except Exception as e:
            debugger.error(f"[sendPrompt] {e}")
            return ""

        text = response.choices[0].message.content
        if text is None:
            raise RuntimeError("No text provided")

        if keepHistory:
            self.chatHistory.append({"role": "assistant", "content": text})

        debugger.info("--------response--------\n" + text)
        debugger.info("--------finished--------")

        return text


if __name__ == "__main__":
    client = myAIClient(GPT_4O, AZURE)
    response = client.sendPrompt("Hello", "How are you?", keepHistory=False, if_response_format=False)
