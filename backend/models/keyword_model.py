from pydantic import BaseModel
from typing import Optional

class Keyword(BaseModel):
    """
    キーワードのデータモデル。
    """
    keywordId: Optional[str] = None
    word: str