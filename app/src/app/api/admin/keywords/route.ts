import { NextRequest, NextResponse } from 'next/server';
import { adminDB } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/admin-middleware';

export async function GET(request: NextRequest) {
  // 管理者権限チェック
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    const keywordsRef = adminDB.collection('keywords');
    const snapshot = await keywordsRef.orderBy('createdAt', 'desc').get();
    
    const keywords = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ keywords });
  } catch (error) {
    console.error('Error fetching keywords:', error);
    return NextResponse.json(
      { error: 'Failed to fetch keywords' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // 管理者権限チェック
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    const { keyword, category, description } = await request.json();

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' }, 
        { status: 400 }
      );
    }

    const keywordData = {
      keyword: keyword.trim(),
      category: category || 'general',
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true
    };

    const docRef = await adminDB.collection('keywords').add(keywordData);

    return NextResponse.json({
      id: docRef.id,
      ...keywordData
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating keyword:', error);
    return NextResponse.json(
      { error: 'Failed to create keyword' }, 
      { status: 500 }
    );
  }
}