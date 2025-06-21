from typing import List, Optional, Dict, Any
from repository import keyword_repository
from models.keyword_model import Keyword

def create_keyword(word: str) -> Keyword:
    return keyword_repository.create_keyword(word)

def get_keywords() -> List[Keyword]:
    return keyword_repository.get_keywords()

def get_random_keyword() -> Optional[Keyword]:
    return keyword_repository.get_random_keyword()

def get_random_keywords(count: int) -> List[Keyword]:
    return keyword_repository.get_random_keywords(count)
