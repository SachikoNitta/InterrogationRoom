from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

class CreateCaseRequest(BaseModel):
    summaryId: str