from pydantic import BaseModel
from typing import List, Optional, ClassVar
from datetime import datetime

class TokenUsage(BaseModel):
    """トークン使用量のデータモデル。"""
    totalTokens: Optional[int] = None
    inputTokens: Optional[int] = None
    outputTokens: Optional[int] = None

class LogEntry(BaseModel):
    """ログエントリのデータモデル。"""
    role: Optional[str] = None  # 'user', 'model'
    message: Optional[str] = None
    createdAt: Optional[datetime] = None
    tokenUsage: Optional[TokenUsage] = None

class Case(BaseModel):
    """ケースのデータモデル。"""
    STATUS_IN_PROGRESS: ClassVar[str] = 'in_progress'
    STATUS_CONFESSED: ClassVar[str] = 'confessed'
    STATUS_FAILED: ClassVar[str] = 'failed'

    caseId: Optional[str] = None
    userId: Optional[str] = None
    status: Optional[str] = None,  # 'in_progress', 'confessed', 'failed'
    createdAt: Optional[datetime] = None
    lastUpdated: Optional[datetime] = None
    summaryId: Optional[str] = None
    logs: Optional[List[LogEntry]] = None
