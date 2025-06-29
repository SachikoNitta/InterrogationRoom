import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreClient } from '@/lib/firestore';

// GET /api/summaries/[summaryId] - 指定されたサマリーを取得
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ summaryId: string }> }
) {
  try {
    const { summaryId } = await context.params;
    const db = getFirestoreClient();
    
    const summaryDoc = await db.collection('summaries').doc(summaryId).get();
    
    if (!summaryDoc.exists) {
      return NextResponse.json(
        { error: 'Summary not found' },
        { status: 404 }
      );
    }
    
    const summaryInfo = {
      summaryId: summaryDoc.id,
      ...summaryDoc.data()
    };
    
    return NextResponse.json(summaryInfo);
  } catch (error) {
    console.error('Get summary error:', error);
    return NextResponse.json(
      { error: 'Failed to get summary' },
      { status: 500 }
    );
  }
}
