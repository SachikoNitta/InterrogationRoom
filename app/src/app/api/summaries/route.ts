import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-helpers';
import { getFirestoreClient } from '@/lib/firestore';
import { VertexAI } from '@google-cloud/vertexai';

// GET /api/summaries - 全てのサマリーを取得
export async function GET() {
  try {
    const db = getFirestoreClient();
    
    const summariesSnapshot = await db.collection('summaries').get();
    
    const summaries = summariesSnapshot.docs.map(doc => ({
      summaryId: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Get summaries error:', error);
    return NextResponse.json(
      { error: 'Failed to get summaries' },
      { status: 500 }
    );
  }
}

// POST /api/summaries - サマリーを生成
export async function POST(request: NextRequest) {
  try {
    await getUserIdFromRequest(request); // 認証チェック
    
    // Gemini APIを使ってサマリーを生成
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'interrogation-room';
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'asia-northeast1';
    
    const vertexAI = new VertexAI({ project: projectId, location });
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash-002',
    });
    
    const prompt = `架空の事件のデータを作成し、以下のJSON形式で出力してください。suspectInfoは必ず一人、取り調べできる具体的な人物の身元を挙げてください。

{
  "summaryName": "サンプル事件",
  "dateOfIncident": "2025-06-10",
  "overview": "2025年6月10日、東京都内で強盗事件が発生...",
  "category": "窃盗",
  "statements": [
    {
      "name": "山田太郎",
      "relation": "被害者",
      "statement": "午後10時ごろ、背後から突然男が現れて..."
    }
  ],
  "physicalEvidence": [
    {
      "evidenceNumber": "No.1",
      "type": "凶器（ナイフ）",
      "foundLocation": "現場のゴミ箱の中",
      "remarks": "指紋付き"
    }
  ],
  "inspectionRecord": {
    "scenePhotos": ["scene1.jpg", "scene2.jpg"],
    "memo": "被害者は入口付近で倒れていた。血痕が..."
  },
  "analysisResults": [
    {
      "type": "指紋鑑定",
      "result": "容疑者Aの指紋と一致"
    }
  ],
  "suspectInfo": [
    {
      "name": "田中五郎",
      "criminalRecord": "なし",
      "alibi": "自宅にいたと主張（確認中）"
    }
  ]
}

リアルで興味深い事件を作成してください。JSON以外の余分なテキストは出力しないでください。`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    let summaryData;
    try {
      // JSONパースを試行
      summaryData = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // パースに失敗した場合は基本的なサマリーを作成
      summaryData = {
        summaryName: '新しい事件',
        dateOfIncident: new Date().toISOString().split('T')[0],
        overview: 'AIによって生成された事件サマリーです。',
        category: '調査中',
        statements: [],
        physicalEvidence: [],
        inspectionRecord: { scenePhotos: [], memo: '' },
        analysisResults: [],
        suspectInfo: [{ name: '容疑者A', criminalRecord: '不明', alibi: '調査中' }]
      };
    }
    
    const db = getFirestoreClient();
    
    const summaryObj = {
      ...summaryData,
      generatedAt: new Date(),
    };
    
    const docRef = await db.collection('summaries').add(summaryObj);
    
    const newSummary = {
      summaryId: docRef.id,
      ...summaryObj
    };
    
    return NextResponse.json(newSummary);
  } catch (error) {
    console.error('Generate summary error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
