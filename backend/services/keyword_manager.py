from typing import List, Optional, Dict, Any
from repository import keyword_repository
from models.keyword_model import Keyword

def create_keyword(word: str) -> Keyword:
    """新しいキーワードを作成し、Firestoreに保存する"""
    return keyword_repository.create_keyword(word)

def get_keywords() -> List[Keyword]:
    """全てのキーワードを取得し、Keyword型のリストで返す"""
    return keyword_repository.get_keywords()

def get_random_keyword() -> Optional[Keyword]:
    """ランダムなキーワードを取得し、Keyword型で返す"""
    return keyword_repository.get_random_keyword()

def get_random_keywords(count: int) -> List[Keyword]:
    """指定された数のランダムなキーワードを取得し、Keyword型のリストで返す"""
    return keyword_repository.get_random_keywords(count)
