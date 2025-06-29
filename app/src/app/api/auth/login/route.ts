import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-helpers';
import { getFirestoreClient } from '@/lib/firestore';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    const db = getFirestoreClient();
    
    const userObj = {
      userId: userId,
      displayName: 'Development User',
      email: 'dev@example.com',
      provider: 'google',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      preferences: {}
    };
    
    // Firestoreにユーザー情報を保存
    await db.collection('users').doc(userId).set(userObj, { merge: true });
    
    return NextResponse.json({ userId });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
