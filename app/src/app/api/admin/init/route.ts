import { NextRequest, NextResponse } from 'next/server';
import { initializeAdminUsers } from '@/lib/admin-utils';

/**
 * 管理者ユーザーを初期化するAPI
 * Secret Managerから管理者メールアドレスを読み込み、Firebase Custom Claimsを設定
 */
export async function POST(request: NextRequest) {
  try {
    // 簡単なセキュリティチェック（本番環境では署名付きヘッダーなどを使用）
    const authHeader = request.headers.get('x-admin-init-token');
    const expectedToken = process.env.ADMIN_INIT_TOKEN || 'init-admin-2024';
    
    if (authHeader !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    console.log('🚀 Starting admin user initialization...');
    await initializeAdminUsers();
    
    return NextResponse.json({ 
      message: 'Admin users initialized successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Admin initialization failed:', error);
    return NextResponse.json(
      { 
        error: 'Admin initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

/**
 * 管理者初期化の状態確認
 */
export async function GET() {
  return NextResponse.json({
    message: 'Admin initialization endpoint is available',
    usage: 'POST with x-admin-init-token header to initialize admin users',
    timestamp: new Date().toISOString()
  });
}