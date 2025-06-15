from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from typing import List
from datetime import datetime
from schemas.case import LogEntry, Case, ChatRequest
from repository.case_repository import *
from services.auth import verify_id_token
from services.gemini_client import generate_case_summary, generate_suspect_response

router = APIRouter()

@router.post("/api/cases")
def create_case(token: Dict = Depends(verify_id_token)):
    '''新しいCaseを作成するAPIエンドポイント。'''
    case = Case(
      userId=token["user_id"],
      status=Case.STATUS_IN_PROGRESS,
      createdAt=datetime.now(),
      lastUpdated=datetime.now(),
      summary="",
      logs=[]
    )

    return create(case)

@router.get("/api/cases", response_model=List[Case])
def get_my_cases(token: Dict = Depends(verify_id_token)):
    '''現在のユーザーのケース一覧を取得するAPIエンドポイント。'''
    return get_by_user_id(token["user_id"])

@router.get("/api/cases/all", response_model=List[Case])
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

@router.get('/api/cases/{caseId}/summary')
def get_case_summary(caseId: str):
    '''指定されたcaseIdのケースの概要を取得するAPIエンドポイント。'''
    case = get_by_case_id(caseId)
    if not case:
        return JSONResponse(status_code=404, content={"detail": "Case not found"})
    
    summary = case.summary
    if not summary:
        return JSONResponse(status_code=404, content={"detail": "Summary not found"})
    
    return {"summary": summary}

@router.post("/api/cases/{caseId}/summary")
def summary(caseId: str):
    '''指定されたcaseIdのケースの概要を生成するAPIエンドポイント。'''
    
    # 概要を保存するためのコールバック関数を定義
    def save_summary(summary: str):
        '''概要をDBに保存するコールバック関数。'''
        set_summary(caseId, summary)

    # ケースの概要を生成
    stream = generate_case_summary(save_summary)
    print(f"Generating summary for case {caseId}")
    print('stream', stream)

    # ストリーミング形式でレスポンスを返す
    return StreamingResponse(stream, media_type="text/plain")

@router.post("/api/cases/{caseId}/chat")
def chat(caseId: str, req: ChatRequest):
    '''指定されたcaseIdのケースに対してチャットを行うAPIエンドポイント。'''

    # ユーザーのメッセージをDBに保存.
    log = LogEntry(role="user", message=req.message, createdAt=datetime.now())
    append_log(caseId, log)

    # 同じCaseの既存のログを全て取得.
    case = get_by_case_id(caseId)
    if not case:
        return JSONResponse(status_code=404, content={"detail": "Case not found"})
    logs = case.logs if case.logs else []

    # AIの回答をDBに保存.
    def save_reply(full_text: str):
        log = LogEntry(role="model", message=full_text, createdAt=datetime.now())
        append_log(caseId, log)

    # Geminiにリクエストを送信.
    stream = generate_suspect_response(logs, save_reply)

    # ストリーム形式でレスポンスを返す.
    return StreamingResponse(stream, media_type="text/plain")

@router.delete("/api/cases/{caseId}")
def delete_case(caseId: str):
    '''指定されたcaseIdのケースを削除するAPIエンドポイント。'''
    delete(caseId)
    return {"detail": f"Case {caseId} deleted"}

