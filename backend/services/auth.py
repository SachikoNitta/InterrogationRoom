from fastapi import Request, HTTPException, Depends
from firebase_admin import auth, credentials, initialize_app
from services.secret_manager import getsecret
import json

secret_json = getsecret('firebase-service-account')
cred_dict = json.loads(secret_json)
cred = credentials.Certificate(cred_dict)
initialize_app(cred)

def extract_token_from_request(request: Request) -> str:
    """リクエストからFirebase IDトークンを抽出する関数"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    
    token = auth_header.split(" ")[1]
    return token

def verify_id_token(request: Request) -> dict:
    """Firebase IDトークンを検証する関数"""
    token = extract_token_from_request(request)
    if not token:
        raise HTTPException(status_code=401, detail="Token not found")
    try:
        # 🔥 Firebase Admin SDKで検証！
        print(f"Verifying token: {token}")
        decoded_token = auth.verify_id_token(token)
        print(f"Decoded token: {decoded_token}")    
        return decoded_token  # uid, email などが含まれてるよ
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user_id(token: str = Depends(verify_id_token)) -> str:
    """Firebase IDトークンを検証し、ユーザーIDを取得する関数"""
    decoded = auth.verify_id_token(token)
    return decoded["uid"]