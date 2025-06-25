export interface LogEntry {
  role: string;
  message: string;
}

export interface Case {
  caseId: string;
  status: string;
  createdAt: string;
  lastUpdated: string;
  summary: string;
  logs: LogEntry[];
  assistantLogs: LogEntry[];
}
