from google.cloud import firestore
from typing import List, Dict, Any, Optional
from models.keyword_model import Keyword
import random

db = firestore.Client()

# キーワードを作成し、Keyword型で返す
def create_keyword(word: str) -> Keyword:
    """新しいキーワードを作成し、Firestoreに保存する"""
    data = {"word": word}
    doc_ref = db.collection("keywords").document()
    doc_ref.set(data)
    keyword = Keyword(keywordId=doc_ref.id, word=word)
    return keyword

# 全キーワードをKeyword型で返す
def get_keywords() -> List[Keyword]:
    """全てのキーワードを取得し、Keyword型のリストで返す"""
    docs = db.collection("keywords").stream()
    return [Keyword(keywordId=doc.id, **doc.to_dict()) for doc in docs]

# ランダムなキーワードをKeyword型で返す
def get_random_keyword() -> Optional[Keyword]:
    """ランダムなキーワードを取得し、Keyword型で返す"""
    keywords = get_keywords()
    if not keywords:
        return None
    return random.choice(keywords)

# 指定数だけランダムにKeywordを返す
def get_random_keywords(count: int) -> List[Keyword]:
    """指定された数のランダムなキーワードを取得し、Keyword型のリストで返す"""
    keywords = get_keywords()
    if not keywords:
        return []
    if count >= len(keywords):
        random.shuffle(keywords)
        return keywords
    return random.sample(keywords, count)