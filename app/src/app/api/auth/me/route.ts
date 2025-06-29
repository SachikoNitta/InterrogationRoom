import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    // TODO: Firestoreからユーザー情報を取得する
    // 現在は基本的なユーザー情報のみ返す
    const user = {
      userId: userId,
      displayName: 'Development User',
      email: 'dev@example.com',
      provider: 'google',
    };

    return NextResponse.json(user);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
