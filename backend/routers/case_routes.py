from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
import services.auth_service as auth_service
import services.case_service as case_service
import models.case_model as case_model
import schemas.case_request as case_request

router = APIRouter()

@router.post("/api/cases")
def create_case(token: dict = Depends(auth_service.verify_id_token)) -> case_model.Case:
    '''新しいCaseを作成するAPIエンドポイント。'''
    try:
        return case_service.create_case(token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/cases/{caseId}", response_model=case_model.Case)
def get_case_by_id(caseId: str) -> case_model.Case:
    '''指定されたcaseIdのケースを取得するAPIエンドポイント。'''
    try:
        return case_service.get_case_by_id(caseId)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/cases", response_model=List[case_model.Case])
def get_cases(token: dict = Depends(auth_service.verify_id_token)) -> List[case_model.Case]:
    '''現在のユーザーのケース一覧を取得するAPIエンドポイント。'''
    try:
        print(f"get_cases: token={token}")
        return case_service.get_my_cases(token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/cases/{caseId}/chat")
def generate_suspect_response(caseId: str, req: case_request.ChatRequest):
    '''指定されたcaseIdのケースに対してチャットの応答を生成するAPIエンドポイント。'''
    try:
        return case_service.generate_suspect_response(caseId, req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/cases/{caseId}")
def delete_case(caseId: str):
    '''指定されたcaseIdのケースを削除するAPIエンドポイント。'''
    try:
        return case_service.delete_case(caseId)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")