# Firestoreクライアントの初期化とCRUDユーティリティ
import os
from google.cloud import firestore
from google.oauth2 import service_account
from typing import Any, Dict, List, Optional

# サービスアカウントキーのパスを環境変数から取得（ローカル開発用）
CREDENTIALS_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

if CREDENTIALS_PATH:
    credentials = service_account.Credentials.from_service_account_file(CREDENTIALS_PATH)
    db = firestore.Client(credentials=credentials)
else:
    db = firestore.Client()  # Cloud Run等ではデフォルト認証

# --- ケース関連 ---
def create_case(case: Dict[str, Any]) -> str:
    doc_ref = db.collection("cases").document()  # Firestoreの自動生成ID
    case["caseId"] = doc_ref.id                  # docIDをcaseIdにセット
    doc_ref.set(case)
    return doc_ref.id

def get_case(case_id: str) -> Optional[Dict[str, Any]]:
    doc = db.collection("cases").document(case_id).get()
    if doc.exists:
        return doc.to_dict()
    return None

def list_cases(user_id: str) -> List[Dict[str, Any]]:
    docs = db.collection("cases").where("userId", "==", user_id).stream()
    return [doc.to_dict() for doc in docs]

# --- チャットログ追加 ---
def add_chat_log(case_id: str, log: Dict[str, Any]):
    db.collection("cases").document(case_id).update({
        "logs": firestore.ArrayUnion([log])
    })

# --- ユーザー関連 ---
def get_user(user_id: str) -> Optional[Dict[str, Any]]:
    doc = db.collection("users").document(user_id).get()
    if doc.exists:
        return doc.to_dict()
    return None

def create_or_update_user(user_id: str, user: Dict[str, Any]):
    db.collection("users").document(user_id).set(user, merge=True)
