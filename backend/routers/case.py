from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from typing import List
from datetime import datetime
from schemas.case import LogEntry, Case, ChatRequest
from repository.case_repository import *
from services.auth import get_current_user_id
from services.gemini_client import generate_chat_response

router = APIRouter()

@router.post("/api/cases")
def create_case():
    '''新しいCaseを作成するAPIエンドポイント。'''
    case = Case(
      userId='dummy-user-id',
      status=Case.STATUS_IN_PROGRESS,
      createdAt=datetime.now(),
      lastUpdated=datetime.now(),
      logs=[]
    )
    return create(case)

@router.get("/api/cases", response_model=List[Case])
def get_cases():
    '''全ケース一覧を取得するAPIエンドポイント。'''
    return get_all()

@router.get("/api/cases/{caseId}", response_model=Case)
def get_case(caseId: str):
    '''指定されたcaseIdのケースを取得するAPIエンドポイント。'''
    cases = get_by_case_id(caseId)
    if not cases:
        return JSONResponse(status_code=404, content={"detail": "Case not found"})
    return cases

@router.get("/api/users/{userId}/cases", response_model=List[Case])
def get_cases_by_user_id(userId: str):
    '''ユーザーごとのケース一覧を取得するAPIエンドポイント。'''
    cases = get_by_user_id(userId)
    if not cases:
        return JSONResponse(status_code=404, content={"detail": "No cases found for this user"})
    return cases

@router.get("/api/me/cases", response_model=List[Case])
def get_my_cases(current_user_id: str = Depends(get_current_user_id)):
    '''現在のユーザーのケース一覧を取得するAPIエンドポイント。'''
    return get_cases_by_user_id(current_user_id)

@router.post("/api/cases/{caseId}/chat")
def chat(caseId: str, req: ChatRequest):
    '''指定されたcaseIdのケースに対してチャットを行うAPIエンドポイント。'''

    # ユーザーのメッセージをDBに保存.
    log = LogEntry(role="user", message=req.message, timestamp=datetime.now())
    append_log(caseId, log)

    # 同じCaseの既存のログを全て取得.
    case = get_by_case_id(caseId)
    if not case:
        return JSONResponse(status_code=404, content={"detail": "Case not found"})
    logs = case.logs if case.logs else []

    # AIの回答をDBに保存.
    def save_reply(full_text: str):
        log = LogEntry(role="model", message=full_text, timestamp=datetime.now())
        append_log(caseId, log)

    # Geminiにリクエストを送信.
    stream = generate_chat_response(logs, save_reply)

    # ストリーム形式でレスポンスを返す.
    return StreamingResponse(stream, media_type="text/plain")

@router.delete("/api/cases/{caseId}")
def delete_case(caseId: str):
    '''指定されたcaseIdのケースを削除するAPIエンドポイント。'''
    delete(caseId)
    return {"detail": f"Case {caseId} deleted"}

