export interface Statement {
  name?: string;
  relation?: string;
  statement?: string;
}

export interface Evidence {
  evidenceNumber?: string;
  type?: string;
  foundLocation?: string;
  remarks?: string;
}

export interface InspectionRecord {
  scenePhotos?: string[];
  memo?: string;
}

export interface AnalysisResult {
  type?: string;
  result?: string;
}

export interface SuspectInfo {
  name?: string;
  criminalRecord?: string;
  alibi?: string;
}

export interface Summary {
  summaryId?: string;
  summaryName?: string;
  dateOfIncident?: string;
  overview?: string;
  category?: string;
  statements?: Statement[];
  physicalEvidence?: Evidence[];
  inspectionRecord?: InspectionRecord;
  analysisResults?: AnalysisResult[];
  suspectInfo?: SuspectInfo[];
}