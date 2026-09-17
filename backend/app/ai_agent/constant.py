import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[3] / ".env", override=False, interpolate=False)

FUZZY_FACTOR = 0.1


class Platforms:
    AZURE = "azure"
    DEEPSEEK = "deepseek"
    SILIICONFLOW = "siliconflow"
    QWEN = "qwen"
    TENCENT = "tencent"
    GROQ = "groq"
    OLLAMA = "ollama"
    AICHINA = "aichina"
    VAPI = "vapi"


class Azure:
    API_KEY = os.getenv("CHRONOMANTIC_AZURE_API_KEY", "")
    ENDPOINT = "https://idg-oai.openai.azure.com/"
    API_VERSION = "2024-11-01-preview"

    class MODELS:
        GPT_4O = "gpt-4o"
        GPT_4O_REALTIME = "gpt-4o-realtime-preview"


class DeepSeek:
    API_KEY = os.getenv("CHRONOMANTIC_DEEPSEEK_API_KEY", "")
    BASE_URL = "https://api.deepseek.com"

    class MODELS:
        CHAT = "deepseek-chat"
        REASONER = "deepseek-reasoner"


class SiliconFlow:
    API_KEY = os.getenv("CHRONOMANTIC_SILICONFLOW_API_KEY", "")
    BASE_URL = "https://api.siliconflow.cn/v1"

    class MODELS:
        DEEPSEEK_V3 = "deepseek-ai/DeepSeek-V3"


class Qwen:
    API_KEY = os.getenv("CHRONOMANTIC_QWEN_API_KEY", "")
    BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    class MODELS:
        QWEN_MAX = "qwen-max-2025-01-25"
        QWEN_TURBO = "qwen-turbo-latest"
        QWEN_2_5_32B = "qwen2.5-32b"
        QWEN_2_5_32B_INSTRUCT = "qwen2.5-32b-instruct"


class Tencent:
    API_KEY = os.getenv("CHRONOMANTIC_TENCENT_API_KEY", "")
    BASE_URL = "https://api.lkeap.cloud.tencent.com/v1"

    class MODELS:
        DEEPSEEK_V3 = "deepseek-v3"


class GroqPlatform:
    API_KEY = os.getenv("CHRONOMANTIC_GROQ_API_KEY", "")
    BASE_URL = "https://api.groq.com/v1"

    class MODELS:
        LLAMA3_3 = "llama-3.3-70b-versatile"
        QWEN2_5_32B = "qwen-2.5-32b"


class Ollama:
    BASE_URL = "http://localhost:11434/v1"
    API_KEY = os.getenv("CHRONOMANTIC_OLLAMA_API_KEY", "ollama")

    class MODELS:
        LLAMA3_3 = "llama3.3:70b-it-8192"
        QWEN2_5_32B = "qwen2.5:32b-instruct-fp16"
        GEMMA3_12B = "gemma3:12b-it-fp16"


class Aichina:
    API_KEY = os.getenv("CHRONOMANTIC_AICHINA_API_KEY", "")
    BASE_URL = "https://ai.api.xn--fiqs8s/v1"

    class MODELS:
        QWEN2_5 = "qwen2.5-32b-instruct"
        CLAUDE3_5 = "claude-3-5-sonnet-latest"
        GEMINI2_0 = "gemini-2.0-flash"
        GEMINI2_5 = "gemini-2.5-flash-lite-preview-06-17"

class VAPI:
    API_KEY = os.getenv("CHRONOMANTIC_VAPI_API_KEY", "")
    BASE_URL = "https://api.v36.cm/v1/"

    class MODELS:
        GEMINI_3_5_FLASH = "gemini-3.5-flash"

PROMPT_SPLITTER = "\n\n"
NOW = datetime.now().strftime("%Y-%m-%d")

if __name__ == "__main__":
    pass
