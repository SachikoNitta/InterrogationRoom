from typing import List, Optional
from pydantic import BaseModel

class Statement(BaseModel):
    name: Optional[str] = None
    relation: Optional[str] = None
    statement: Optional[str] = None

class Evidence(BaseModel):
    evidenceNumber: Optional[str] = None
    type: Optional[str] = None
    foundLocation: Optional[str] = None
    remarks: Optional[str] = None

class InspectionRecord(BaseModel):
    scenePhotos: Optional[List[str]] = None
    memo: Optional[str] = None

class AnalysisResult(BaseModel):
    type: Optional[str] = None
    result: Optional[str] = None

class SuspectInfo(BaseModel):
    name: Optional[str] = None
    criminalRecord: Optional[str] = None
    alibi: Optional[str] = None

class Summary(BaseModel):
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
