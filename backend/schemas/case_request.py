from pydantic import BaseModel

class ChatRequest(BaseModel):
    """チャットリクエストのスキーマ"""
    message: str

class CreateCaseRequest(BaseModel):
    """ケース作成リクエストのスキーマ"""
    summaryId: str