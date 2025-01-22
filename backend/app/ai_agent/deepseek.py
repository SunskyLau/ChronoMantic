import json
from typing import List, Dict, Optional
from openai import OpenAI
from openai.types.chat import ChatCompletion
from typeguard import typechecked
from .debugger import debugger
from .constant import SYSTEM_PROMPT

# Constants
DEEPSEEK_API_KEY = "sk-8afa35e69734436e88fec6fb5191e954"
DEEPSEEK_BASE_URL = "https://api.deepseek.com"
DEEPSEEK_MODEL = "deepseek-chat" # deepseek-v3模型
# DEEPSEEK_MODEL = "deepseek-reasoner" # 最新推理模型，速度慢，效果好


@typechecked
class DeepSeekClient:
    def __init__(self):
        self.client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)
        self.chat_history: List[Dict[str, str]] = []

    def send_prompt(self, system_prompt: str, user_prompt: str, keep_history: bool = False, if_response_format: bool = True) -> str:
        debugger.info("--------send prompt---------\n" + user_prompt)

        if self.client is None:
            raise RuntimeError("No client")

        if keep_history:
            self.chat_history.append({"role": "user", "content": user_prompt})
        else:
            self.chat_history = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]

        response: Optional[ChatCompletion] = None
        try:
            response = self.client.chat.completions.create(
                messages=self.chat_history,
                model=DEEPSEEK_MODEL,
                temperature=0.2,
                max_tokens=4096,
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0,
                stop=None,
                response_format={"type": "json_object"} if if_response_format else None,
            )
        except Exception as e:
            debugger.error(f"[sendPrompt] {e}")
            return ""

        text = response.choices[0].message.content
        if text is None:
            raise RuntimeError("No text provided")

        if keep_history:
            self.chat_history.append({"role": "assistant", "content": text})

        debugger.info("--------response--------\n" + text)
        debugger.info("--------finished--------")

        return text


def get_query_spec(query: str) -> Dict:
    client = DeepSeekClient()
    response = client.send_prompt(SYSTEM_PROMPT, query, keep_history=False, if_response_format=False)
    return json.loads(response)


def adjust_query(query: str) -> str:
    client = DeepSeekClient()
    response = client.send_prompt(
        """You are a text processing expert. I will provide you with the original text and some modification suggestions, and you need to give the modified result without any punctuation marks. Here is an example: "AMZN", "{target: "BTC"}", you need to output BTC; "from 2021 to 2023","time_scope_condition:{min:{value:2021},max:{value:2022}}", you need to output from 2021 to 2022.""",
        query,
        keep_history=False,
        if_response_format=False,
    )
    return response


if __name__ == "__main__":
    query_spec = get_query_spec("Show me periods when price appear a head-and-shoulder shape")
