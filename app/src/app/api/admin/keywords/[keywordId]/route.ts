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
    const { word } = await request.json();
    
    if (!word) {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      );
    }
    
    const keywordRef = adminDB.collection('keywords').doc(keywordId);
    const doc = await keywordRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Keyword not found' },
        { status: 404 }
      );
    }

    const updateData = {
      word: word.trim()
    };

    await keywordRef.update(updateData);

    const updatedDoc = await keywordRef.get();
    return NextResponse.json({
      keywordId: updatedDoc.id,
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