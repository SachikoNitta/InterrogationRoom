/**
 * Types for case analysis summaries generated from user chat sessions
 * This is different from investigation scenario summaries
 */

export interface CaseAnalysis {
  id: string;
  caseId: string;
  summary: string;
  keywords: string[];
  generatedAt: any;  // Firestore Timestamp
  generatedBy: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface CaseForAnalysis {
  id: string;
  title: string;
  createdAt: any;  // Firestore Timestamp
  userId: string;
  summaryId?: string;
  messageCount?: number;
}