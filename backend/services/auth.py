from fastapi import Request, HTTPException, Depends
from firebase_admin import auth

def verify_token(request: Request) -> str:
    """リクエストからFirebase IDトークンを抽出し、検証する関数"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    # "Bearer xxxx" 形式 → トークンだけ抽出
    parts = auth_header.split()
    if parts[0].lower() != "bearer" or len(parts) != 2:
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")

    return parts[1]  # トークンだけ返す

def get_current_user_id(token: str = Depends(verify_token)) -> str:
    """Firebase IDトークンを検証し、ユーザーIDを取得する関数"""
    decoded = auth.verify_id_token(token)
    return decoded["uid"]