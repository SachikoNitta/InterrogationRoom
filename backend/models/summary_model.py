from typing import List, Optional
from pydantic import BaseModel

class Statement(BaseModel):
    """証言を表すデータモデル。"""
    name: Optional[str] = None
    relation: Optional[str] = None
    statement: Optional[str] = None

class Evidence(BaseModel):
    """物理的証拠を表すデータモデル。"""
    evidenceNumber: Optional[str] = None
    type: Optional[str] = None
    foundLocation: Optional[str] = None
    remarks: Optional[str] = None

class InspectionRecord(BaseModel):
    """検証記録を表すデータモデル。"""
    scenePhotos: Optional[List[str]] = None
    memo: Optional[str] = None

class AnalysisResult(BaseModel):
    """分析結果を表すデータモデル。"""
    type: Optional[str] = None
    result: Optional[str] = None

class SuspectInfo(BaseModel):
    """容疑者の情報を表すデータモデル。"""
    name: Optional[str] = None
    criminalRecord: Optional[str] = None
    alibi: Optional[str] = None

class Summary(BaseModel):
    """事件の概要を表すデータモデル。"""
    summaryId: Optional[str] = None
    summaryName: Optional[str] = None
    dateOfIncident: Optional[str] = None
    overview: Optional[str] = None
    category: Optional[str] = None
    statements: Optional[List[Statement]] = None
    physicalEvidence: Optional[List[Evidence]] = None
    inspectionRecord: Optional[InspectionRecord] = None
    analysisResults: Optional[List[AnalysisResult]] = None
    suspectInfo: Optional[List[SuspectInfo]] = None
