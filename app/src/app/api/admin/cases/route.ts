import { NextRequest, NextResponse } from 'next/server';
import { adminDB } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/admin-middleware';

export async function GET(request: NextRequest) {
  // 管理者権限チェック
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    const casesRef = adminDB.collection('cases');
    const snapshot = await casesRef.orderBy('createdAt', 'desc').limit(100).get();
    
    const cases = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.summary || `Case ${doc.id.substring(0, 8)}`,
        createdAt: data.createdAt,
        userId: data.userId,
        summaryId: data.summaryId,
        messageCount: (data.logs?.length || 0) + (data.assistantLogs?.length || 0)
      };
    });

    return NextResponse.json({ cases });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases' }, 
      { status: 500 }
    );
  }
}