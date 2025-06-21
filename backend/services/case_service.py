from datetime import datetime
from typing import List, Dict, Optional
from fastapi.responses import StreamingResponse
import models.case_model as case_model
import schemas.case_request as case_request
import repository.case_repository as case_repo
import services.gemini_client as gemini_client
import services.secret_manager as secret_manager
import services.keyword_manager as keyword_manager
import services.prompt_service as prompt_service

def create_my_case(summary_id: str, user_id: str)-> case_model.Case:
    try:
        # Caseを作成する
        case = case_model.Case(
            userId=user_id,
            status=case_model.Case.STATUS_IN_PROGRESS,
            createdAt=datetime.now(),
            lastUpdated=datetime.now(),
            summaryId = summary_id,
            logs=[]
        )

        # Firestoreに保存する
        case = case_repo.create(case)

        return case
    except Exception as e:
        raise RuntimeError(f"Unexpected error in services.create_case: {e}")

def get_my_cases(user_id: str) -> List[case_model.Case]:
    try:
        # ユーザーIDからケースを取得する
        cases = case_repo.get_by_user_id(user_id)
        return cases
    except Exception as e:
        raise RuntimeError(f"Unexpected error in services.get_my_cases: {e}")

def get_my_case_by_id(case_id: str, user_id: str)-> case_model.Case:
    try:
        case = case_repo.get_by_case_id_and_user_id(case_id, user_id)

        if not case:
            raise Exception("Case not found")
        return case
    except Exception as e:
        raise RuntimeError(f"Unexpected error in services.get_case_by_id: {e}")
    
def get_my_case_by_summary_id(summary_id: str, user_id: str) -> Optional[case_model.Case]:
    try:
        return case_repo.get_by_summary_id_and_user_id(summary_id, user_id)
    except Exception as e:
        raise RuntimeError(f"Unexpected error in services.get_case_by_summary_id: {e}")

def generate_my_suspect_response(case_id: str, message: str, user_id: str) -> StreamingResponse:
    # todo: Userのメッセージを最後に保存する.
    try:
        def save_reply(full_text: str):
            log = case_model.LogEntry(role="model", message=full_text, createdAt=datetime.now())
            case_repo.append_log(case_id, user_id, log)

        # Userのメッセージをログに保存
        log = case_model.LogEntry(role="user", message=message, createdAt=datetime.now())
        case_repo.append_log(case_id, user_id, log)

        # Caseを取得
        case = case_repo.get_by_case_id_and_user_id(case_id, user_id)
        if not case:
            raise Exception("Case not found")

        logs = case.logs if case.logs else []
        model = gemini_client.get_model("gemini-1.5-pro-002", system_instruction = secret_manager.getsecret('system_prompt_suspect'))
        stream = gemini_client.generate_stream_response(
            model,
            contents=build_gemini_contents(logs=logs),
            on_complete=save_reply
        )
        return StreamingResponse(stream, media_type="text/plain")
    except Exception as e:
        raise RuntimeError(f"Unexpected error in services.generate_suspect_response: {e}")

def delete_my_case(case_id: str, user_id: str):
    try:
        case_repo.delete_by_case_id_and_user_id(case_id, user_id)
    except Exception as e:
        raise RuntimeError(f"Failed to delete case: {e}")

def build_gemini_contents(summary: str = "", logs: List[case_model.LogEntry] = None, extra: str = "") -> List[gemini_client.Content]:
    """
    LogEntry型のリストからContent型のリストを生成する
    """
    try:
        contents = []

        # 概要が空でない場合は、最初のコンテンツとして追加
        if summary:
            part = gemini_client.Part.from_text(summary)
            content = gemini_client.Content(role='model', parts=[part])
            contents.append(content)

        # ログエントリからコンテンツを生成
        if logs:
            for log in logs:
                message = log.message
                if not message:
                    continue
                
                part = gemini_client.Part.from_text(message)
                content = gemini_client.Content(role=log.role, parts=[part])
                contents.append(content)

        # 追加のテキストがある場合は、最後のコンテンツとして追加
        if extra:
            part = gemini_client.Part.from_text(extra)
            content = gemini_client.Content(role='model', parts=[part])
            contents.append(content)
    except Exception as e:
        raise RuntimeError(f"Failed to build Gemini contents: {e}")

    return contents