import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { getFirestoreClient } from '@/lib/firestore';

async function getUserIdFromRequest(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid Authorization header');
  }
  
  const token = authHeader.split(' ')[1];
  const decodedToken = await adminAuth.verifyIdToken(token);
  return decodedToken.uid;
}

// GET /api/cases/summary/[summaryId] - サマリーIDによるケース取得
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ summaryId: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    const { summaryId } = await context.params;
    const db = getFirestoreClient();
    
    const casesSnapshot = await db.collection('cases')
      .where('userId', '==', userId)
      .where('summaryId', '==', summaryId)
      .limit(1)
      .get();
    
    if (casesSnapshot.empty) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }
    
    const caseDoc = casesSnapshot.docs[0];
    const caseInfo = {
      caseId: caseDoc.id,
      ...caseDoc.data()
    };
    
    return NextResponse.json(caseInfo);
  } catch (error) {
    console.error('Get case by summary error:', error);
    return NextResponse.json(
      { error: 'Failed to get case' },
      { status: 500 }
    );
  }
}
