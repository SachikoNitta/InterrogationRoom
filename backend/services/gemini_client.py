# Gemini APIクライアント（Vertex AI公式推奨方式）
import os
import random
import vertexai
from vertexai.generative_models import GenerativeModel, Content, Part
from typing import List, Callable
from schemas.case import LogEntry
from services.secret_manager import getsecret
from services.keyword_manager import get_random_keywords

project_id = os.getenv("GOOGLE_CLOUD_PROJECT", 'interrogation-room')
location = os.getenv("GOOGLE_CLOUD_LOCATION", 'asia-northeast1')

vertexai.init(project=project_id, location=location)

def get_case_generator_model() -> GenerativeModel:
    return GenerativeModel("gemini-1.5-pro-002", system_instruction = getsecret('system_prompt_case_generator'))

def get_suspect_model() -> GenerativeModel:
    return GenerativeModel("gemini-1.5-pro-002", system_instruction = getsecret('system_prompt_suspect'))

def get_assistant_model() -> GenerativeModel:
    return GenerativeModel("gemini-1.5-pro-002", system_instruction = getsecret('system_prompt_assistant'))

def build_contents_from_summary_logs(summary=str, logs = [LogEntry]) -> List[Content]:
    """
    LogEntry型のリストからContent型のリストを生成する
    """
    contents = []

    # 概要が空でない場合は、最初のコンテンツとして追加
    part = Part.from_text(summary.strip())
    content = Content(role='model', parts=[part])
    contents.append(content)

    # ログエントリからコンテンツを生成
    for log in logs:
        message = log.message.strip()
        if not message:
            continue
        
        part = Part.from_text(message)
        content = Content(role=log.role, parts=[part])
        contents.append(content)

    return contents

def generate_case_summary(on_complete: Callable[[str], None]):
    """ 事件の概要を生成する関数。"""
    model = get_case_generator_model()
    keywords = get_random_keywords(3)
    print(f"Generating case summary with keywords: {[keyword.word for keyword in keywords]}")
    part = Part.from_text('事件の概要を生成してください。以下のキーワードを含んでください。\n' + ', '.join([keyword.word for keyword in keywords]))
    content = Content(role='model', parts=[part])

    # 全文ためておくバッファー
    buffer = "" 

    # ストリーミングレスポンスを逐次処理
    response = model.generate_content(
        stream=True,
        contents=[content],
        generation_config={"temperature": 2.0}
    )
    for res in response:
        if res.candidates and res.candidates[0].text:
            buffer += res.candidates[0].text.strip()
            yield res.candidates[0].text.strip()
    
    on_complete(buffer)

def generate_model_response(model: GenerativeModel, summary: str, logs: List[LogEntry], on_complete: Callable[[str], None] = None):
    """ 指定されたログに基づいて、modelからの応答を生成するジェネレータ関数。"""
    contents = build_contents_from_summary_logs(summary, logs)
    print(f"Generating response for summary: {summary}")
    print(f"Number of logs: {len(logs)}")
    print(f"Generating response with {len(contents)} contents")

    # 全文ためておくバッファー
    buffer = "" 
    
    # ストリーミングレスポンスを逐次処理
    response = model.generate_content(stream=True, contents=contents)
    for res in response:
        if res.candidates and res.candidates[0].text:
            buffer += res.candidates[0].text.strip()
            print(f"Yielding response: {res.candidates[0].text.strip()}")
            yield res.candidates[0].text.strip()
    
    if on_complete:
        on_complete(buffer)
