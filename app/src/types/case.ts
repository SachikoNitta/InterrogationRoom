export interface LogEntryDto {
  role: string;
  message: string;
  createdAt: string;
}

export interface CaseDto {
  caseId: string;
  status: string;
  createdAt: string;
  lastUpdated: string;
  summary: string;
  title?: string;
  logs: LogEntryDto[];
}
