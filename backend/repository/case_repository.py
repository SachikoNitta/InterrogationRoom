# Firestoreクライアントの初期化とCRUDユーティリティ
from google.cloud import firestore
from google.oauth2 import service_account
from typing import Any, Dict, List, Optional
from schemas.case import Case, LogEntry

# Firestoreクライアントの初期化
db = firestore.Client()
COLLECTION = "cases"

def create(case=Case) -> Case:
    """新しいケースを作成し、Firestoreに保存する"""
    doc_ref = db.collection(COLLECTION).document() 
    doc_ref.set(case.dict())
    return case

def get_all() -> List[Case]:
    """全ケース一覧を取得する"""
    docs = db.collection(COLLECTION).stream()
    return [Case(**doc.to_dict()) for doc in docs]

def get_by_case_id(case_id: str) -> Optional[Case]:
    """指定されたcaseIdのケースを取得する"""
    doc = db.collection(COLLECTION).document(case_id).get()
    if doc.exists:
        return Case(**doc.to_dict())
    return None

def get_by_user_id(user_id: str) -> List[Dict[str, Any]]:
    """指定されたユーザーIDに関連するケースのリストを取得する"""
    docs = db.collection(COLLECTION).where("userId", "==", user_id).stream()
    return [Case(**doc.to_dict()) for doc in docs]

def update(case_id: str, case: Case) -> Case:
    """指定されたcaseIdのケースを更新する"""
    db.collection(COLLECTION).document(case_id).set(case.dict(), merge=True)
    return case

def delete(case_id: str):
    """指定されたcaseIdのケースを削除する"""
    db.collection(COLLECTION).document(case_id).delete()

def append_log(case_id: str, log: LogEntry):
    """指定されたcaseIdのケースにチャットログを追加する"""
    log_entry = {
        "role": log.role,
        "message": log.message,
        "timestamp": log.createdAt.isoformat() if log.createdAt else None
    }
    db.collection("cases").document(case_id).update({
        "logs": firestore.ArrayUnion([log_entry])
    })

    # --- ユーザー関連 ---
    # def get_user(user_id: str) -> Optional[Dict[str, Any]]:
    #     """指定されたユーザーIDのユーザーデータを取得する"""
    #     doc = db.collection("users").document(user_id).get()
    #     if doc.exists:
    #         return doc.to_dict()
    #     return None

    # def create_or_update_user(user_id: str, user: Dict[str, Any]):
    #     """指定されたユーザーIDのユーザーデータを作成または更新する"""
    #     db.collection("users").document(user_id).set(user, merge=True)
