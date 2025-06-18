from pydantic import BaseModel
from typing import List, Optional, ClassVar
from datetime import datetime

class LogEntry(BaseModel):
    '''
    Case DTOのチャット1件を表すデータモデル。
    '''
    role: Optional[str] = None  # 'user', 'model'
    message: Optional[str] = None

class Case(BaseModel):
    '''
    Caseのレスポンスに使用するデータモデル。
    '''
    STATUS_IN_PROGRESS: ClassVar[str] = 'in_progress'
    STATUS_CONFESSED: ClassVar[str] = 'confessed'
    STATUS_FAILED: ClassVar[str] = 'failed'

    caseId: Optional[str] = None
    status: Optional[str] = None,  # 'in_progress', 'confessed', 'failed'
    createdAt: Optional[datetime] = None
    title: Optional[str] = None
    lastUpdated: Optional[datetime] = None
    summary: Optional[str] = None
    logs: Optional[List[LogEntry]] = None
