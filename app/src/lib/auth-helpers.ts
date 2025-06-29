import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { isDevelopment, verifyTokenOrMock } from '@/lib/dev-auth';

export async function getUserIdFromRequest(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid Authorization header');
  }
  
  const token = authHeader.split(' ')[1];
  
  // 開発環境での特別処理
  if (isDevelopment()) {
    try {
      const mockUser = await verifyTokenOrMock(token);
      return mockUser.uid;
    } catch {
      // モック認証に失敗した場合は通常の認証を試行
    }
  }
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Token verification error:', error);
    
    // 開発環境では認証エラーでもfallbackユーザーを返す
    if (isDevelopment()) {
      console.warn('Using development fallback user due to auth error');
      return 'dev-user-fallback';
    }
    
    throw new Error('Invalid token');
  }
}
