# Gemini APIクライアント（Vertex AI公式推奨方式）
import os
import vertexai
from vertexai.generative_models import GenerativeModel, Content, Part
from typing import List, Callable

project_id = os.getenv("GOOGLE_CLOUD_PROJECT", 'interrogation-room')
location = os.getenv("GOOGLE_CLOUD_LOCATION", 'asia-northeast1')

vertexai.init(project=project_id, location=location)

def get_model(model_name: str, system_instruction=None) -> GenerativeModel:
    """
    指定されたモデル名とシステムインストラクションでGenerativeModelを取得する。
    system_instructionは省略可能。
    """
    if system_instruction is not None:
        return GenerativeModel(model_name, system_instruction=system_instruction)
    else:
        return GenerativeModel(model_name)

def generate_stream_response(model: GenerativeModel, contents: List[Content], on_complete: Callable[[str], None] = None) -> str:
    """
    指定されたモデルとコンテンツに基づいて、ストリーミングレスポンスを生成するジェネレータ関数。
    on_completeコールバックは、全てのレスポンスが完了した後に呼び出される。
    """
    # 全文ためておくバッファー
    buffer = ""

    # トークン使用量の初期化
    token_usage_input = 0
    token_usage_output = 0
    token_usage_total = 0

    # ストリーミングレスポンスを逐次処理
    response = model.generate_content(stream=True, contents=contents)
    for res in response:
        token_usage_input += res.usage_metadata.prompt_token_count if res.usage_metadata else 0
        token_usage_output += res.usage_metadata.candidates_token_count if res.usage_metadata else 0
        token_usage_total += res.usage_metadata.total_token_count if res.usage_metadata else 0
        if res.candidates and res.candidates[0].text:
            buffer += res.candidates[0].text.rstrip("\n")
            yield res.candidates[0].text.rstrip("\n")

    if on_complete:
        on_complete(buffer.rstrip("\n"), token_usage_input, token_usage_output, token_usage_total)

def generate_response(model: GenerativeModel, contents: List[Content]) -> dict:
    """
    指定されたモデルとコンテンツに基づいて、レスポンスを生成する。
    """
    response = model.generate_content(contents=contents)

    if not response.candidates or len(response.candidates) == 0:
        return {}
    candidate = response.candidates[0]
    if not candidate.content or not candidate.content.parts or len(candidate.content.parts) == 0:
        return {}
    part = candidate.content.parts[0]
    if not part.text:
        return {}
    return part.text

def get_part_from_text(text: str) -> Part:
    """
    文字列からPartオブジェクトを生成して返す
    """
    return Part.from_text(text)

def get_content_from_role_parts(role: str, parts: list) -> Content:
    """
    roleとpartsからContentオブジェクトを生成して返す
    """
    return Content(role=role, parts=parts)