import { NextRequest, NextResponse } from 'next/server';

// GCP Gemini APIのエンドポイントとAPIキーを環境変数から取得
const GEMINI_API_URL = process.env.GEMINI_API_URL || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Gemini APIへリクエスト
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(error); // errorを利用してESLintエラーを回避
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
