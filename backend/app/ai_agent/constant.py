from datetime import datetime


class Platforms:
    AZURE = "azure"
    DEEPSEEK = "deepseek"
    SILIICONFLOW = "siliconflow"
    QWEN = "qwen"


class Azure:
    API_KEY = "c1812815d31d45aa9b450a22fc875845"
    ENDPOINT = "https://idg-oai.openai.azure.com/"
    API_VERSION = "2024-11-01-preview"

    class MODELS:
        GPT_4O = "gpt-4o"
        GPT_4O_REALTIME = "gpt-4o-realtime-preview"


class DeepSeek:
    API_KEY = "sk-8afa35e69734436e88fec6fb5191e954"
    BASE_URL = "https://api.deepseek.com"

    class MODELS:
        CHAT = "deepseek-chat"
        REASONER = "deepseek-reasoner"


class SiliconFlow:
    API_KEY = "sk-vjgfhfunedghhljnnwfdpvnheuppfktpbxvczttcmygtukxh"
    BASE_URL = "https://api.siliconflow.cn/v1"

    class MODELS:
        DEEPSEEK_V3 = "deepseek-ai/DeepSeek-V3"


class Qwen:
    API_KEY = "sk-36a33471d5da4a468e5121c7273c133d"
    BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    class MODELS:
        QWEN_MAX = "qwen-max-2025-01-25"


PROMPT_SPLITTER = "\n\n"
NOW = datetime.now().strftime("%Y-%m-%d")


if __name__ == "__main__":
    pass
