from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
import services.auth_service as auth_service
import services.case_service as case_service
import models.case_model as case_model
import schemas.case_request as case_request

router = APIRouter()

@router.post("/api/cases")
def create_my_case(user_id: str = Depends(auth_service.get_user_id)) -> case_model.Case:
    '''新しいCaseを作成するAPIエンドポイント。'''
    try:
        return case_service.create_my_case(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/cases/{caseId}", response_model=case_model.Case)
def get_my_case_by_case_id(case_id: str, user_id: str = Depends(auth_service.get_user_id)) -> case_model.Case:
    '''指定されたcaseIdのケースを取得するAPIエンドポイント。'''
    try:
        return case_service.get_my_case_by_case_id(user_id, case_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/cases", response_model=List[case_model.Case])
def get_my_cases(user_id: str = Depends(auth_service.get_user_id)) -> List[case_model.Case]:
    '''現在のユーザーのケース一覧を取得するAPIエンドポイント。'''
    try:
        return case_service.get_my_cases(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/cases/{caseId}/chat")
def generate_my_suspect_response(case_id: str, req: case_request.ChatRequest, user_id: str = Depends(auth_service.get_user_id)) -> StreamingResponse:
    '''指定されたcaseIdのケースに対してチャットの応答を生成するAPIエンドポイント。'''
    try:
        if not req.message:
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        return case_service.generate_my_suspect_response(case_id, req.message, user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/cases/{caseId}")
def delete_my_case(case_id: str, user_id: str = Depends(auth_service.get_user_id)): 
    '''指定されたcaseIdのケースを削除するAPIエンドポイント。'''
    try:
        return case_service.delete_my_case(case_id, user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")