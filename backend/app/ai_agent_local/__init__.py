import requests
import json
from typing import List, Dict, Optional

class ChatAgent:
    def __init__(self, model_name: str, temperature: float = 0, max_tokens: int = 4096, system_prompt: str = None):
        """
        初始化聊天代理
        
        Args:
            model_name (str): 模型名称
            temperature (float, optional): 温度参数，控制随机性。默认为 0
            max_tokens (int, optional): 最大生成的 token 数量。默认为 1024
            system_prompt (str, optional): 系统提示词。默认为 None
        """
        self.model_name = model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.conversation_history: List[Dict[str, str]] = []
        self.api_url = "http://localhost:11434/api/chat"
        
        # 如果提供了系统提示词，则添加到对话历史中
        if system_prompt:
            self.add_message("system", system_prompt)

    def add_message(self, role: str, content: str) -> None:
        """
        添加消息到对话历史
        
        Args:
            role (str): 消息角色 ('system', 'user' 或 'assistant')
            content (str): 消息内容
        """
        self.conversation_history.append({
            "role": role,
            "content": content
        })

    def set_system_prompt(self, system_prompt: str) -> None:
        """
        设置或更新系统提示词
        
        Args:
            system_prompt (str): 新的系统提示词
        """
        # 移除现有的系统提示词（如果存在）
        self.conversation_history = [msg for msg in self.conversation_history if msg["role"] != "system"]
        # 添加新的系统提示词
        self.add_message("system", system_prompt)

    def chat(self, user_input: str, stream: bool = False) -> Dict:
        """
        发送聊天请求并更新对话历史
        
        Args:
            user_input (str): 用户输入的文本
            stream (bool, optional): 是否使用流式响应。默认为 False
            
        Returns:
            dict: API 的响应结果
        """
        # 添加用户输入到历史记录
        self.add_message("user", user_input)
        print(self.conversation_history)
        
        # 构建请求数据
        payload = {
            "model": self.model_name,
            "messages": self.conversation_history,
            "stream": stream,
            "options": {
                "temperature": self.temperature,
                "max_tokens": self.max_tokens
            }
        }
        
        # 发送 POST 请求
        response = requests.post(self.api_url, json=payload)
        
        # 处理响应
        if response.status_code == 200:
            result = response.json()
            # 如果响应成功，将助手的回复添加到历史记录
            if "message" in result and "content" in result["message"]:
                self.add_message("assistant", result["message"]["content"])
            return result
        else:
            error_response = {
                "error": f"请求失败，状态码: {response.status_code}",
                "details": response.text
            }
            return error_response

    def clear_history(self) -> None:
        """
        清除对话历史
        """
        self.conversation_history = []

    def parse_nl_query(self, dataset_info: str, nl_query: str) -> Dict:
        """
        解析自然语言查询
        
        Args:
            dataset_info (str): 数据集信息的JSON字符串
            nl_query (str): 自然语言查询
            
        Returns:
            dict: 解析结果
        """
        # 导入提示词生成函数
        from .prompts import create_parse_nl_prompt
        
        # 使用提示词生成函数构建系统提示词
        system_prompt = create_parse_nl_prompt(dataset_info)
        print("系统提示词内容:", system_prompt)
        
        # 设置系统提示词
        self.set_system_prompt(system_prompt)
        
        # 检查对话历史中是否包含系统提示词
        system_messages = [msg for msg in self.conversation_history if msg["role"] == "system"]
        print("对话历史中的系统消息数量:", len(system_messages))
        if system_messages:
            print("系统消息内容:", system_messages[0]["content"][:100] + "...")
        
        # 发送查询请求
        return self.chat(nl_query)

    def modify_nl_query(self, old_queryspec: str, segments: str, intentions: str) -> Dict:
        """
        修改自然语言查询
        
        Args:
            old_queryspec (str): 原始查询规范
            segments (str): 时间段信息
            intentions (str): 意图信息
            
        Returns:
            dict: 修改结果
        """
        # 导入提示词生成函数
        from .prompts import create_modify_nl_prompt
        
        # 使用提示词生成函数构建系统提示词
        system_prompt = create_modify_nl_prompt()
        
        # 设置系统提示词
        self.set_system_prompt(system_prompt)
        
        # 构建修改请求
        modify_prompt = f"""原始查询规范：
        {old_queryspec}
        
        时间段信息：
        {segments}
        
        意图信息：
        {intentions}
        """
        
        # 发送修改请求
        return self.chat(modify_prompt)

# 测试用例
def test_parse_nl_query():
    dataset_info = '{"time_column": "Date", "value_columns": ["AMZN", "DPZ", "BTC", "NFLX"]}'
    agent = ChatAgent(model_name="qwen2.5:32b")
    
    # 测试不同的查询场景
    # queries = [
    #     "Find periods when price rose sharply with a duration of about 4 days",
    #     "Find periods when price rose sharply with a duration of about 4 days, then fell gradually",
    #     "Find periods when price present a head-and-shoulders shape",
    #     "Find periods when price first rise then present a head-and-shoulders shape then fell"
    # ]
    query_nl = "Find periods when price rose sharply with a duration of about 4 days"

    result = agent.parse_nl_query(dataset_info, query_nl)
    print(result['message']['content'])
    
    # for query in queries:
    #     result = agent.parse_nl_query(dataset_info, query)
    #     if "message" in result and "content" in result["message"]:
    #         print(f"Query: {query}\nResult: {result['message']['content']}\n")

def test_modify_nl_query():
    agent = ChatAgent(model_name="qwen2.5")
    
    # 测试数据
    old_queryspec = """{...}"""
    segments = """{...}"""
    intentions = """{...}"""
    
    result = agent.modify_nl_query(old_queryspec, segments, intentions)
    if "message" in result and "content" in result["message"]:
        print(f"Modification Result: {result['message']['content']}")

if __name__ == "__main__":
    test_parse_nl_query()
    # test_modify_nl_query()
    