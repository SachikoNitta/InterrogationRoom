from google.cloud import firestore
from typing import Optional
from schemas.user import User

# Firestoreクライアントの初期化
db = firestore.Client()

def get_user(user_id: str) -> Optional[User]:
    user_doc = db.collection("users").document(user_id).get()
    existing = user_doc.get()
    if existing.exists:
        return User(**existing.to_dict())
    return None

def save_user(user: User) -> User:
    user_id = user.userId
    user_doc = db.collection("users").document(user_id)
    existing = user_doc.get()
    user_data = user.dict()
    if existing.exists:
        prev = existing.to_dict()
        user_data["createdAt"] = prev.get("createdAt", user_data["createdAt"])
    user_doc.set(user_data)
    return user

