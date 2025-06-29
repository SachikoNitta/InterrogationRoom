import { NextRequest, NextResponse } from 'next/server';
import { isTokenAdmin } from './admin-utils';

/**
 * 管理者専用ルートの保護ミドルウェア
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authentication required' }, 
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];
  const isAdmin = await isTokenAdmin(token);
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Admin access required' }, 
      { status: 403 }
    );
  }

  return null; // Allow request to continue
}

/**
 * ユーザーIDと管理者権限を取得するヘルパー
 */
export async function getAdminUserFromRequest(request: NextRequest): Promise<{ userId: string; isAdmin: boolean }> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Authentication required');
  }

  const token = authHeader.split(' ')[1];
  const { adminAuth } = await import('./firebase-admin');
  const decodedToken = await adminAuth.verifyIdToken(token);
  
  return {
    userId: decodedToken.uid,
    isAdmin: decodedToken.admin === true
  };
}