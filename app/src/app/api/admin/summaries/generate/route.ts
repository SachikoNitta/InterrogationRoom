import { NextRequest, NextResponse } from 'next/server';
import { adminDB } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/admin-middleware';
import { VertexAI } from '@google-cloud/vertexai';

export async function POST(request: NextRequest) {
  // 管理者権限チェック
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    const { keywordCount = 3 } = await request.json();

    // ランダムなキーワードを取得
    const selectedKeywords = await getRandomKeywords(keywordCount);
    
    // AI を使用してサマリー（事件シナリオ）を生成
    const summaryData = await generateInvestigationScenario(selectedKeywords);

    // summaries コレクションに保存（事件シナリオとして）
    const summaryRef = await adminDB.collection('summaries').add({
      ...summaryData,
      generatedAt: new Date()
    });

    return NextResponse.json({
      id: summaryRef.id,
      ...summaryData
    }, { status: 201 });

  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate summary', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// ランダムなキーワードを取得（Python backend の keyword_manager.get_random_keywords と同じ）
async function getRandomKeywords(count: number): Promise<string[]> {
  const keywordsSnapshot = await adminDB
    .collection('keywords')
    .where('active', '==', true)
    .get();
  
  const allKeywords = keywordsSnapshot.docs.map(doc => doc.data().keyword);
  
  // Fisher-Yates シャッフルアルゴリズムでランダムに選択
  const shuffled = [...allKeywords];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// AI を使用して事件シナリオを生成（Python backend の generate_summary と同じ）
async function generateInvestigationScenario(keywords: string[]): Promise<any> {
  const vertex_ai = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT_ID!,
    location: 'us-central1'
  });

  const model = vertex_ai.preview.getGenerativeModel({
    model: 'gemini-1.5-pro-002'
  });

  // Python backend と同じプロンプト
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
    },
    {
      "name": "佐藤花子",
      "relation": "目撃者",
      "statement": "犯人は黒いパーカーとジーンズを着ており..."
    }
  ],
  "physicalEvidence": [
    {
      "evidenceNumber": "No.1",
      "type": "凶器（ナイフ）",
      "foundLocation": "現場のゴミ箱の中",
      "remarks": "指紋付き"
    },
    {
      "evidenceNumber": "No.2",
      "type": "防犯カメラ映像",
      "foundLocation": "コンビニ店内",
      "remarks": "犯行時刻と一致"
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
    },
    {
      "type": "DNA鑑定",
      "result": "血液DNAは被害者と一致"
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

キーワード: ${keywords.join(', ')}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // JSON ブロックを抽出（Python backend の text_utils.extract_json_block と同じ）
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('No JSON block found in the AI response');
  }

  try {
    const summaryData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    
    if (!summaryData.summaryName) {
      throw new Error("Invalid summary response format: 'summaryName' not found");
    }

    // summaryId を生成
    summaryData.summaryId = generateSummaryId();
    
    return summaryData;
    
  } catch (parseError) {
    throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Parse error'}`);
  }
}

// サマリーID を生成
function generateSummaryId(): string {
  return 'summary_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}