import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { getFirestoreClient } from '@/lib/firestore';
import { VertexAI } from '@google-cloud/vertexai';

const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'interrogation-room';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'asia-northeast1';

async function getUserIdFromRequest(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid Authorization header');
  }
  
  const token = authHeader.split(' ')[1];
  const decodedToken = await adminAuth.verifyIdToken(token);
  return decodedToken.uid;
}

// Vertex AI クライアントの初期化
const vertexAI = new VertexAI({ project: projectId, location });

// POST /api/cases/[caseId]/chat/assistant - アシスタント（新米刑事）とのチャット
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    const { caseId } = await context.params;
    const body = await request.json();
    const { message } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    const db = getFirestoreClient();
    
    // ケースの存在確認
    const caseDoc = await db.collection('cases').doc(caseId).get();
    if (!caseDoc.exists) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }
    
    const caseData = caseDoc.data();
    if (caseData?.userId !== userId) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }
    
    // サマリー情報を取得
    const summaryDoc = await db.collection('summaries').doc(caseData.summaryId).get();
    const summaryData = summaryDoc.data();
    
    // Gemini モデルの設定（アシスタント用）
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash-002',
      systemInstruction: `あなたは新米刑事です。先輩刑事（ユーザー）と事件について相談しています。

事件概要: ${summaryData?.overview || '詳細不明の事件'}
証拠情報: ${JSON.stringify(summaryData?.physicalEvidence || [])}
供述情報: ${JSON.stringify(summaryData?.statements || [])}

重要な指示:
- 事件概要と矛盾する回答はしないでください。
- さらなる調査や確認を頼まれた場合は、しかるべき機関に連絡してください。
- 調査の結果は、必ずしも容疑者の犯行を裏付けるものである必要はありません。
- ルーキーらしく元気いっぱいに答えてください。
- 一回の返答は200文字程度に収めてください。`,
    });
    
    // チャット履歴を取得
    const existingLogs = caseData.assistantLogs || [];
    
    // Gemini用のチャット履歴を構築
    const chatHistory = existingLogs.map((log: any) => ({
      role: log.role === 'user' ? 'user' : 'model',
      parts: [{ text: log.message }]
    }));
    
    // Gemini APIでストリーミングレスポンス生成
    const chat = model.startChat({
      history: chatHistory,
    });
    
    // ユーザーメッセージをログに保存
    const logEntry = {
      timestamp: new Date(),
      role: 'user',
      message: message
    };
    
    // ストリーミングレスポンスの作成
    const encoder = new TextEncoder();
    let fullResponseText = '';
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(message);
          
          for await (const chunk of result.stream) {
            const chunkText = chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (chunkText) {
              fullResponseText += chunkText;
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          
          // ストリーミング完了後にFirestoreにログを保存
          const responseEntry = {
            timestamp: new Date(),
            role: 'model',
            message: fullResponseText || 'レスポンスを生成できませんでした。'
          };
          
          await db.collection('cases').doc(caseId).update({
            assistantLogs: [...existingLogs, logEntry, responseEntry],
            updatedAt: new Date()
          });
          
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          const errorMessage = 'レスポンスの生成中にエラーが発生しました。';
          controller.enqueue(encoder.encode(errorMessage));
          
          // エラー時もログを保存
          const responseEntry = {
            timestamp: new Date(),
            role: 'model',
            message: errorMessage
          };
          
          await db.collection('cases').doc(caseId).update({
            assistantLogs: [...existingLogs, logEntry, responseEntry],
            updatedAt: new Date()
          });
          
          controller.close();
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
    
  } catch (error) {
    console.error('Assistant chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process assistant chat' },
      { status: 500 }
    );
  }
}
