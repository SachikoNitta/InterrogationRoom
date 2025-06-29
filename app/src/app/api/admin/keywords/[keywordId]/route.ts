import { NextRequest, NextResponse } from 'next/server';
import { adminDB } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/admin-middleware';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ keywordId: string }> }
) {
  // 管理者権限チェック
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    const { keywordId } = await params;
    const body = await request.json();
    
    const keywordRef = adminDB.collection('keywords').doc(keywordId);
    const doc = await keywordRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Keyword not found' },
        { status: 404 }
      );
    }

    // 更新データを準備（undefinedのフィールドは除外）
    const updateData: any = {
      updatedAt: new Date()
    };

    if (body.keyword !== undefined) updateData.keyword = body.keyword.trim();
    if (body.category !== undefined) updateData.category = body.category;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.active !== undefined) updateData.active = body.active;

    await keywordRef.update(updateData);

    const updatedDoc = await keywordRef.get();
    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });

  } catch (error) {
    console.error('Error updating keyword:', error);
    return NextResponse.json(
      { error: 'Failed to update keyword' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ keywordId: string }> }
) {
  // 管理者権限チェック
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    const { keywordId } = await params;
    const keywordRef = adminDB.collection('keywords').doc(keywordId);
    
    const doc = await keywordRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Keyword not found' },
        { status: 404 }
      );
    }

    await keywordRef.delete();

    return NextResponse.json({
      message: 'Keyword deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting keyword:', error);
    return NextResponse.json(
      { error: 'Failed to delete keyword' },
      { status: 500 }
    );
  }
}