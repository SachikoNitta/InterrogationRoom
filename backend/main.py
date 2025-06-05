from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from firestore_client import create_case, get_case as fs_get_case, list_cases as fs_list_cases, add_chat_log

app = FastAPI()

@app.get("/health")
def healthz():
    return JSONResponse(content={"status": "ok"})

# --- Schemas ---
class LogEntry(BaseModel):
    role: str  # 'user' or 'suspect'
    message: str

class Case(BaseModel):
    caseId: str
    userId: str
    status: str  # 'in_progress', 'confessed', 'failed'
    createdAt: datetime
    lastUpdated: datetime
    logs: List[LogEntry]

class User(BaseModel):
    userId: str
    displayName: Optional[str]
    email: Optional[str]
    provider: Optional[str]
    createdAt: Optional[datetime]
    lastLoginAt: Optional[datetime]
    preferences: Optional[Dict[str, Any]]

# --- /api/cases ---
@app.post("/api/cases")
def create_case_api():
    case_data = {
        # "caseId"はここではセットしない（FirestoreのdocIDを使う）
        "userId": "dummy-user-id",  # 本来は認証情報から取得
        "status": "in_progress",
        "createdAt": datetime.now(),
        "lastUpdated": datetime.now(),
        "logs": []
    }
    case_id = create_case(case_data)  # docIDがcaseIdとして返る
    return {"caseId": case_id}

@app.get("/api/cases", response_model=List[Case])
def get_cases():
    user_id = "dummy-user-id"  # 本来は認証情報から取得
    cases_data = fs_list_cases(user_id)
    # Firestoreの値をPydanticモデルに変換
    cases = [Case(**c) for c in cases_data]
    return cases

# --- /api/cases/{caseId} ---
@app.get("/api/cases/{caseId}", response_model=Case)
def get_case(caseId: str):
    case_data = fs_get_case(caseId)
    if not case_data:
        return JSONResponse(status_code=404, content={"detail": "Case not found"})
    return Case(**case_data)

# --- /api/cases/{caseId}/chat ---
class ChatRequest(BaseModel):
    message: str

@app.post("/api/cases/{caseId}/chat")
def chat_with_suspect(caseId: str, req: ChatRequest):
    from datetime import datetime
    # 1. Firestoreにユーザーメッセージを保存
    user_log = {"role": "user", "message": req.message, "timestamp": datetime.now()}
    add_chat_log(caseId, user_log)
    # 2. ダミー返答を生成
    dummy_reply = "これはダミーの返答です。"
    suspect_log = {"role": "suspect", "message": dummy_reply, "timestamp": datetime.now()}
    # 3. Firestoreにダミー返答を保存
    add_chat_log(caseId, suspect_log)
    # 4. ダミー返答を返す
    return {"reply": dummy_reply, "status": "in_progress"}

# --- /api/auth/login ---
class LoginRequest(BaseModel):
    idToken: str

@app.post("/api/auth/login")
def login(req: LoginRequest):
    return {"userId": "dummy-user-id"}

# --- /api/auth/me ---
@app.get("/api/auth/me", response_model=User)
def get_me():
    return User(
        userId="dummy-user-id",
        displayName="ダミーユーザー",
        email="dummy@example.com",
        provider="google",
        createdAt=datetime.now(),
        lastLoginAt=datetime.now(),
        preferences={}
    )
