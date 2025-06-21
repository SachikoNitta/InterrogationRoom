from datetime import datetime
from typing import List, Dict
from fastapi.responses import StreamingResponse
import models.case_model as case_model
import schemas.case_dto as case_dto
import schemas.case_request as case_request
import repository.case_repository as case_repo
import services.gemini_client as gemini_client
import services.secret_manager as secret_manager
import services.keyword_manager as keyword_manager
import services.prompt_service as prompt_service

def create_case(token: Dict)-> case_dto.Case:
    try:
        # Caseを作成する
        case = case_model.Case(
            userId=token["user_id"],
            status=case_model.Case.STATUS_IN_PROGRESS,
            createdAt=datetime.now(),
            lastUpdated=datetime.now(),
            summary="",
            logs=[]
        )

        # Firestoreに保存する
        case = case_repo.create(case)

        # CaseDtoに変換する
        case_dto = to_case_dto(case)
        return case_dto
    
    except Exception as e:
        raise RuntimeError(f"Unexpected error in services.create_case: {e}")

def get_my_cases(token: Dict) -> List[case_dto.Case]:
    try:
        # ユーザーIDからケースを取得する
        cases = case_repo.get_by_user_id(token["user_id"])

        # CaseDtoに変換する
        case_dtos = [to_case_dto(case) for case in cases]

        return case_dtos
    except Exception as e:
        raise RuntimeError(f"Unexpected error in services.get_my_cases: {e}")

def get_case_by_id(caseId: str)-> case_dto.Case:
    try:
        print(f"get_case_by_id: {caseId}")
        case = case_repo.get_by_case_id(caseId)
        print(f"get_case_by_id: {caseId}, case: {case}")

        if not case:
            raise Exception("Case not found")
        
        # CaseDtoに変換する
        case_dto = to_case_dto(case)

        return case_dto
    except Exception as e:
        raise RuntimeError(f"Unexpected error in services.get_case_by_id: {e}")

def generate_suspect_response(caseId: str, req: case_request.ChatRequest) -> StreamingResponse:
    try:
        def save_reply(full_text: str):
            log = case_model.LogEntry(role="model", message=full_text, createdAt=datetime.now())
            case_repo.append_log(caseId, log)

        # Userのメッセージをログに追加
        log = case_model.LogEntry(role="user", message=req.message, createdAt=datetime.now())
        case_repo.append_log(caseId, log)

        # Caseを取得
        case = case_repo.get_by_case_id(caseId)
        if not case:
            raise Exception("Case not found")
                
        summary = case.summary if case.summary else ""
        logs = case.logs if case.logs else []
        model = gemini_client.get_model("gemini-1.5-pro-002", system_instruction = secret_manager.getsecret('system_prompt_suspect'))
        stream = gemini_client.generate_stream_response(
            model,
            contents=build_gemini_contents(summary, logs),
            on_complete=save_reply
        )
        return StreamingResponse(stream, media_type="text/plain")
    except Exception as e:
        raise RuntimeError(f"Unexpected error in services.generate_suspect_response: {e}")

def delete_case(caseId: str):
    try:
        case_repo.delete(caseId)
    except Exception as e:
        raise RuntimeError(f"Failed to delete case: {e}")

def to_case_dto(case: case_model.Case) -> case_dto.Case:
    return case_dto.Case(
        caseId=case.caseId,
        status=case.status,
        createdAt=case.createdAt,
        lastUpdated=case.lastUpdated,
        summary=case.summary,
        title=case.title,
        logs=[case_dto.LogEntry(**log.dict()) for log in case.logs]
    )

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