import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserFromRequest } from '@/lib/admin-middleware';

export async function GET(request: NextRequest) {
  try {
    const { userId, isAdmin } = await getAdminUserFromRequest(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' }, 
        { status: 403 }
      );
    }

    return NextResponse.json({ 
      userId, 
      isAdmin: true,
      message: 'Admin access confirmed' 
    });

  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' }, 
      { status: 401 }
    );
  }
}