from google.cloud import firestore
from typing import Optional
from schemas.user import User

# Firestoreクライアントの初期化
db = firestore.Client()

def save_user(user: User):
    user_id = user.userId
    user_doc = db.collection("users").document(user_id)
    existing = user_doc.get()
    user_data = user.dict()
    if existing.exists:
        prev = existing.to_dict()
        user_data["createdAt"] = prev.get("createdAt", user_data["createdAt"])
    user_doc.set(user_data)


def get_user(user_id: str) -> Optional[dict]:
    user_doc = db.collection("users").document(user_id).get()
    if user_doc.exists:
        return user_doc.to_dict()
    return None
