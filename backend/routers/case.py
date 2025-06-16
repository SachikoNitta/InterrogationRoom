from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from typing import List
from datetime import datetime
from schemas.case import LogEntry, Case, ChatRequest
from repository.case_repository import *
from services.auth import verify_id_token
from services.gemini_client import *

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

    # AIの回答をDBに保存する関数.
    def save_reply(full_text: str):
        log = LogEntry(role="model", message=full_text, createdAt=datetime.now())
        append_log(caseId, log)

    # ユーザーのメッセージをDBに保存.
    log = LogEntry(role="user", message=req.message, createdAt=datetime.now())
    append_log(caseId, log)
    
    # 指定されたcaseIdのケースを取得.
    case = get_by_case_id(caseId)
    if not case:
        return JSONResponse(status_code=404, content={"detail": "Case not found"})

    # 同じCaseの概要を取得.
    summary = case.summary if case.summary else ""

    # 同じCaseの既存のログを全て取得.
    logs = case.logs if case.logs else []

    # Geminiにリクエストを送信.
    model = get_suspect_model()
    stream = generate_model_response(model, summary, logs, save_reply)

    # ストリーム形式でレスポンスを返す.
    return StreamingResponse(stream, media_type="text/plain")

@router.get("/api/cases/{caseId}/assistance")
def assistance(caseId: str):
    '''指定されたcaseIdのケースに対してアシスタンスを行うAPIエンドポイント。'''
    # 指定されたcaseIdのケースを取得.
    case = get_by_case_id(caseId)
    if not case:
        return JSONResponse(status_code=404, content={"detail": "Case not found"})

    # 同じCaseの概要を取得.
    summary = case.summary if case.summary else ""

    # 同じCaseの既存のログを全て取得.
    logs = case.logs if case.logs else []

    # ログの末尾にアシスタンス用のメッセージを追加.
    logs.append(LogEntry(role="assistant", message="尋問方法について、ユーザーに助言してください。", createdAt=datetime.now()))

    # Geminiにリクエストを送信.
    model = get_assistant_model()
    stream = generate_model_response(model, summary, logs)

    # ストリーム形式でレスポンスを返す.
    return StreamingResponse(stream, media_type="text/plain")

@router.delete("/api/cases/{caseId}")
def delete_case(caseId: str):
    '''指定されたcaseIdのケースを削除するAPIエンドポイント。'''
    delete(caseId)
    return {"detail": f"Case {caseId} deleted"}

