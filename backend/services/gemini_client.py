# Gemini APIクライアント（Vertex AI公式推奨方式）
import os
import vertexai
from vertexai.generative_models import GenerativeModel, Content, Part
from typing import List, Callable

project_id = os.getenv("GOOGLE_CLOUD_PROJECT", 'interrogation-room')
location = os.getenv("GOOGLE_CLOUD_LOCATION", 'asia-northeast1')

vertexai.init(project=project_id, location=location)

def get_model(model_name: str, system_instruction=str) -> GenerativeModel:
    """
    指定されたモデル名とシステムインストラクションでGenerativeModelを取得する。
    """
    return GenerativeModel(model_name, system_instruction=system_instruction)

def generate_stream_response(model: GenerativeModel, contents: List[Content], on_complete: Callable[[str], None] = None) -> str:
    """
    指定されたモデルとコンテンツに基づいて、ストリーミングレスポンスを生成するジェネレータ関数。
    on_completeコールバックは、全てのレスポンスが完了した後に呼び出される。
    """
    buffer = ""  # 全文ためておくバッファー

    # ストリーミングレスポンスを逐次処理
    response = model.generate_content(stream=True, contents=contents)
    for res in response:
        if res.candidates and res.candidates[0].text:
            buffer += res.candidates[0].text.rstrip("\n")
            yield res.candidates[0].text.rstrip("\n")

    if on_complete:
        on_complete(buffer.rstrip("\n"))
