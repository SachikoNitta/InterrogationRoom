# Firestoreクライアントの初期化とCRUDユーティリティ
from google.cloud import firestore
from typing import Any, Dict, List, Optional
import models.case_model as case_model

# Firestoreクライアントの初期化
db = firestore.Client()

def create(case=case_model.Case) -> case_model.Case:
    """新しいケースを作成し、Firestoreに保存する（エラーハンドリング付き）"""
    try:
        doc_ref = db.collection('cases').document() 
        doc_ref.set(case.dict())
        case.caseId = doc_ref.id  # ドキュメントIDをcaseIdに設定
        doc_ref.update({"caseId": case.caseId})  # DBにcaseIdを保存
        return case
    except Exception as e:
        raise RuntimeError(f"Failed to create case: {e}")

# def get_all() -> List[Case]:
#     """全ケース一覧を取得する"""
#     docs = db.collection('cases').stream()
#     return [Case(**doc.to_dict()) for doc in docs]

def get_by_case_id(case_id: str) -> Optional[case_model.Case]:
    """指定されたcaseIdのケースを取得する（エラーハンドリング付き）"""
    try:
        doc = db.collection('cases').document(case_id).get()
        if doc.exists:
            return case_model.Case(**doc.to_dict())
        return None
    except Exception as e:
        raise RuntimeError(f"Failed to get case by id: {e}")

def get_by_user_id(user_id: str) -> List[case_model.Case]:
    """指定されたユーザーIDに関連するケースのリストを取得する"""
    try:
        if not user_id:
            raise ValueError("User ID must be provided")
        docs = db.collection('cases').where(field_path="userId", op_string="==", value=user_id).stream()
        return [case_model.Case(**doc.to_dict()) for doc in docs]
    except Exception as e:
            raise RuntimeError(f"Failed to get case by id: {e}")

# def update(case_id: str, case: Case) -> Case:
#     """指定されたcaseIdのケースを更新する"""
#     db.collection('cases').document(case_id).set(case.dict(), merge=True)
#     return case

def set_summary_id(case_id: str, summary_id: str):
    """指定されたcaseIdのケースのsummary_idを設定する"""
    print(f"Setting summary_id for case {case_id}")
    db.collection("cases").document(case_id).update({
        "summary_id": summary_id,
        "lastUpdated": firestore.SERVER_TIMESTAMP
    })

def append_log(case_id: str, log: case_model.LogEntry):
    print(f"Appending log to case {case_id}: {log}")
    """指定されたcaseIdのケースにチャットログを追加する"""
    log_entry = {
        "role": log.role,
        "message": log.message,
        "createdAt": log.createdAt.isoformat() if log.createdAt else None
    }
    db.collection("cases").document(case_id).update({
        "logs": firestore.ArrayUnion([log_entry])
    })

def delete(case_id: str):
    """指定されたcaseIdのケースを削除する（エラーハンドリング付き）"""
    try:
        db.collection('cases').document(case_id).delete()
    except Exception as e:
        raise RuntimeError(f"Failed to delete case: {e}")