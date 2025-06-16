from pydantic import BaseModel
from typing import List, Optional, ClassVar
from datetime import datetime

class Keyword(BaseModel):
    """
    キーワードのデータモデル。
    """
    keywordId: Optional[str] = None
    word: str