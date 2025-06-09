# Gemini APIクライアント（Vertex AI公式推奨方式）
import os
import vertexai
from vertexai.generative_models import GenerativeModel, Content, Part
from google.cloud import secretmanager
from services.gemini_client import *
from typing import List, Callable
from schemas.case import LogEntry

project_id = os.getenv("GOOGLE_CLOUD_PROJECT", 'interrogation-room')
if not project_id:
    raise RuntimeError("環境変数 GOOGLE_CLOUD_PROJECT または PROJECT_ID が設定されていません。Cloud Run上では自動でセットされますが、ローカル開発時はシェルで export GOOGLE_CLOUD_PROJECT=your-project-id で指定してください。")

location = os.getenv("GOOGLE_CLOUD_LOCATION", 'asia-northeast1')

vertexai.init(project=project_id, location=location)    

def get_system_prompt() -> str:
    client = secretmanager.SecretManagerServiceClient()
    secret_name = f"projects/{project_id}/secrets/system_prompt/versions/latest"
    response = client.access_secret_version(request={"name": secret_name})
    return response.payload.data.decode("UTF-8")

def get_model() -> GenerativeModel:
    system_instruction = get_system_prompt()
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