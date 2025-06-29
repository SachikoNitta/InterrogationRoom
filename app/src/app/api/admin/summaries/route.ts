import { NextRequest, NextResponse } from 'next/server';
import { adminDB } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/admin-middleware';

export async function GET(request: NextRequest) {
  // 管理者権限チェック
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    // Get investigation scenarios from 'summaries' collection
    const summariesRef = adminDB.collection('summaries');
    const snapshot = await summariesRef.orderBy('generatedAt', 'desc').get();
    
    const summaries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ summaries });
  } catch (error) {
    console.error('Error fetching summaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summaries' }, 
      { status: 500 }
    );
  }
}