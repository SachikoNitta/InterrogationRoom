import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-helpers';
import { getFirestoreClient } from '@/lib/firestore';

// GET /api/cases/[caseId] - 指定されたケースを取得
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    const { caseId } = await context.params;
    const db = getFirestoreClient();
    
    const caseDoc = await db.collection('cases').doc(caseId).get();
    
    if (!caseDoc.exists) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }
    
    const caseData = caseDoc.data();
    
    // ユーザーのケースかチェック
    if (caseData?.userId !== userId) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }
    
    const caseInfo = {
      caseId: caseDoc.id,
      ...caseData
    };
    
    return NextResponse.json(caseInfo);
  } catch (error) {
    console.error('Get case error:', error);
    return NextResponse.json(
      { error: 'Failed to get case' },
      { status: 500 }
    );
  }
}

// DELETE /api/cases/[caseId] - ケースを削除
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    const { caseId } = await context.params;
    const db = getFirestoreClient();
    
    const caseDoc = await db.collection('cases').doc(caseId).get();
    
    if (!caseDoc.exists) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }
    
    const caseData = caseDoc.data();
    
    // ユーザーのケースかチェック
    if (caseData?.userId !== userId) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }
    
    await db.collection('cases').doc(caseId).delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete case error:', error);
    return NextResponse.json(
      { error: 'Failed to delete case' },
      { status: 500 }
    );
  }
}
