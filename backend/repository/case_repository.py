# Firestoreクライアントの初期化とCRUDユーティリティ
from google.cloud import firestore
from typing import Any, Dict, List, Optional
import models.case_model as case_model

# Firestoreクライアントの初期化
db = firestore.Client()

def create(case=case_model.Case) -> case_model.Case:
    """新しいケースを作成し、Firestoreに保存する"""
    try:
        doc_ref = db.collection('cases').document() 
        doc_ref.set(case.dict())
        case.caseId = doc_ref.id  # ドキュメントIDをcaseIdに設定
        doc_ref.update({"caseId": case.caseId})  # DBにcaseIdを保存
        return case
    except Exception as e:
        raise RuntimeError(f"Failed to create case: {e}")

def get_by_case_id_and_user_id(case_id: str, user_id: str) -> Optional[case_model.Case]:
    """指定されたcaseIdとuserIdのケースを取得する"""
    try:
        doc = db.collection('cases').document(case_id).get()
        if doc.exists and doc.to_dict().get("userId") == user_id:
            return case_model.Case(**doc.to_dict())
        return None
    except Exception as e:
        raise RuntimeError(f"Failed to get case by id: {e}")

def get_by_user_id(user_id: str) -> List[case_model.Case]:
    """指定されたuserIdのケースを取得する"""
    try:
        if not user_id:
            raise ValueError("User ID must be provided")

        docs = db.collection('cases').where(field_path="userId", op_string="==", value=user_id).stream()
        return [case_model.Case(**doc.to_dict()) for doc in docs]
    except Exception as e:
            raise RuntimeError(f"Failed to get case by id: {e}")

def append_log(case_id: str, user_id: str, log: case_model.LogEntry):
    """指定されたcaseIdとuserIdのケースにログを追加する"""
    doc = get_by_case_id_and_user_id(case_id, user_id)
    if not doc:
        raise ValueError(f"Case with ID {case_id} not found for user {user_id}")
    log_entry = {
        "role": log.role,
        "message": log.message,
        "createdAt": log.createdAt.isoformat() if log.createdAt else None
    }
    doc.update({
        "logs": firestore.ArrayUnion([log_entry])
    })

def delete_by_case_id_and_user_id(case_id: str, user_id: str):
    """指定されたcaseIdとuserIdのケースを削除する"""
    try:
        doc = get_by_case_id_and_user_id(case_id, user_id)
        if not doc:
            raise ValueError(f"Case with ID {case_id} not found for user {user_id}")
        db.collection('cases').document(case_id).delete()
    except Exception as e:
        raise RuntimeError(f"Failed to delete case: {e}")