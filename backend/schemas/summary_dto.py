from typing import List, Optional
from pydantic import BaseModel

class Statement(BaseModel):
    name: str
    relation: str
    statement: str

class Evidence(BaseModel):
    evidence_number: str
    type: str
    found_location: str
    remarks: str

class InspectionRecord(BaseModel):
    scene_photos: List[str]
    memo: str

class AnalysisResult(BaseModel):
    type: str
    result: str

class SuspectInfo(BaseModel):
    name: str
    criminal_record: str
    alibi: str

class Summary(BaseModel):
    case_name: str
    date_of_incident: str
    overview: str
    statements: List[Statement] = []
    physical_evidence: List[Evidence] = []
    inspection_record: Optional[InspectionRecord] = None
    analysis_results: List[AnalysisResult] = []
    suspect_info: List[SuspectInfo] = []
