# Firestoreクライアントの初期化とCRUDユーティリティ
from google.cloud import firestore
from typing import Any, Dict, List, Optional
from schemas.case import Case, LogEntry

# Firestoreクライアントの初期化
db = firestore.Client()

def create(case=Case) -> Case:
    """新しいケースを作成し、Firestoreに保存する"""
    doc_ref = db.collection('cases').document() 
    doc_ref.set(case.dict())
    case.caseId = doc_ref.id  # ドキュメントIDをcaseIdに設定
    doc_ref.update({"caseId": case.caseId})  # DBにcaseIdを保存
    return case

def get_all() -> List[Case]:
    """全ケース一覧を取得する"""
    docs = db.collection('cases').stream()
    return [Case(**doc.to_dict()) for doc in docs]

def get_by_case_id(case_id: str) -> Optional[Case]:
    """指定されたcaseIdのケースを取得する"""
    doc = db.collection('cases').document(case_id).get()
    if doc.exists:
        return Case(**doc.to_dict())
    return None

def get_by_user_id(user_id: str) -> List[Dict[str, Any]]:
    """指定されたユーザーIDに関連するケースのリストを取得する"""
    docs = db.collection('cases').where("userId", "==", user_id).stream()
    return [Case(**doc.to_dict()) for doc in docs]

def update(case_id: str, case: Case) -> Case:
    """指定されたcaseIdのケースを更新する"""
    db.collection('cases').document(case_id).set(case.dict(), merge=True)
    return case

def delete(case_id: str):
    """指定されたcaseIdのケースを削除する"""
    db.collection('cases').document(case_id).delete()

def set_summary(case_id: str, summary: str):
    """指定されたcaseIdのケースの概要を設定する"""
    print(f"Setting summary for case {case_id}: {summary}")
    db.collection("cases").document(case_id).update({
        "summary": summary,
        "lastUpdated": firestore.SERVER_TIMESTAMP 
    })

def append_log(case_id: str, log: LogEntry):
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