from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class User(BaseModel):
    userId: str
    displayName: Optional[str]
    email: Optional[str]
    provider: Optional[str]
    createdAt: Optional[datetime]
    lastLoginAt: Optional[datetime]
    preferences: Optional[Dict[str, Any]]

class LoginRequest(BaseModel):
    idToken: str
