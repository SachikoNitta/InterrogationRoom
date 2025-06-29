import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-helpers';
import { getFirestoreClient } from '@/lib/firestore';

// GET /api/cases - ユーザーのケース一覧を取得
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    const db = getFirestoreClient();
    
    const casesSnapshot = await db.collection('cases')
      .where('userId', '==', userId)
      .get();
    
    const cases = casesSnapshot.docs.map(doc => ({
      caseId: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json(cases);
  } catch (error) {
    console.error('Get cases error:', error);
    return NextResponse.json(
      { error: 'Failed to get cases' },
      { status: 500 }
    );
  }
}

// POST /api/cases - 新しいケースを作成
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    const body = await request.json();
    const { summaryId } = body;
    
    if (!summaryId) {
      return NextResponse.json(
        { error: 'Summary ID is required' },
        { status: 400 }
      );
    }
    
    const db = getFirestoreClient();
    
    const caseObj = {
      userId,
      summaryId,
      createdAt: new Date(),
      updatedAt: new Date(),
      logs: [],
      assistantLogs: [],
    };
    
    const docRef = await db.collection('cases').add(caseObj);
    
    const newCase = {
      caseId: docRef.id,
      ...caseObj
    };
    
    return NextResponse.json(newCase);
  } catch (error) {
    console.error('Create case error:', error);
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    );
  }
}
