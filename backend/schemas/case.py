from pydantic import BaseModel
from typing import List, Optional, ClassVar
from datetime import datetime

class LogEntry(BaseModel):
    '''
    Caseのチャット1件を表すデータモデル。
    '''
    role: Optional[str] = None  # 'user', 'model'
    message: Optional[str] = None
    createdAt: Optional[datetime] = None

class Case(BaseModel):
    '''
    Caseのデータモデル。
    '''
    STATUS_IN_PROGRESS: ClassVar[str] = 'in_progress'
    STATUS_CONFESSED: ClassVar[str] = 'confessed'
    STATUS_FAILED: ClassVar[str] = 'failed'

    caseId: Optional[str] = None
    userId: Optional[str] = None
    status: Optional[str] = None,  # 'in_progress', 'confessed', 'failed'
    createdAt: Optional[datetime] = None
    lastUpdated: Optional[datetime] = None
    summary: Optional[str] = None
    logs: Optional[List[LogEntry]] = None

class ChatRequest(BaseModel):
    message: str
