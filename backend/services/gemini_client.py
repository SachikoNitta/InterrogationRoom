# Gemini APIクライアント（Vertex AI公式推奨方式）
import os
import vertexai
from vertexai.generative_models import GenerativeModel, Content, Part
from typing import List, Callable
from schemas.case import LogEntry
from services.secret_manager import getsecret

project_id = os.getenv("GOOGLE_CLOUD_PROJECT", 'interrogation-room')
location = os.getenv("GOOGLE_CLOUD_LOCATION", 'asia-northeast1')

vertexai.init(project=project_id, location=location)    

def get_model() -> GenerativeModel:
    system_instruction = getsecret('system_prompt')
    return GenerativeModel("gemini-1.5-flash-002", system_instruction=system_instruction)

def build_contents_from_logs(logs = [LogEntry]) -> List[Content]:
    """
    LogEntry型のリストからContent型のリストを生成する
    Args:
        pairs (List[LogEntry]): ログエントリのリスト。各エントリはロールとテキストを持つ。
    Returns:
        List[Content]
    """
    contents = []
    for log in logs:
        message = log.message.strip()
        if not message:
            continue
        
        part = Part.from_text(message)
        content = Content(role=log.role, parts=[part])
        contents.append(content)

    return contents

def generate_chat_response(logs: List[LogEntry], on_complete: Callable[[str], None]) :
    """
    Generate a chat response based on the provided prompt using the Gemini model.
    Args:
        contents (list[Content]): A list of Content objects representing the chat history.
    Returns:
        str: The generated chat response.
    
    参考: Vertex AI Gemini APIの詳細仕様
    https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference?hl=ja
    """
    model = get_model()
    contents = build_contents_from_logs(logs)

    # 全文ためておくバッファー
    buffer = "" 
    
    # ストリーミングレスポンスを逐次処理
    response = model.generate_content(stream=True, contents=contents)
    for res in response:
      if res.candidates and res.candidates[0].text:
        buffer += res.candidates[0].text.strip()
        yield res.candidates[0].text.strip()
    
    on_complete(buffer)