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
    console.log('🚀 Starting summary generation with keywordCount:', keywordCount);

    // 環境変数チェック
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error('Google Cloud Project ID environment variable is not set. Please set GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_PROJECT, or NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    }

    // ランダムなキーワードを取得
    console.log('📝 Getting random keywords...');
    const selectedKeywords = await getRandomKeywords(keywordCount);
    console.log('🔑 Selected keywords:', selectedKeywords);
    
    if (selectedKeywords.length === 0) {
      throw new Error('No keywords available in database. Please add keywords first.');
    }
    
    // AI を使用してサマリー（事件シナリオ）を生成
    console.log('🤖 Generating AI scenario...');
    const summaryData = await generateInvestigationScenario(selectedKeywords);
    console.log('✅ AI generation completed');

    // summaries コレクションに保存（Python backend と同じ構造）
    console.log('💾 Saving to database...');
    const docRef = await adminDB.collection('summaries').add(summaryData);
    
    // Python backend と同様に summaryId をドキュメント ID に設定して更新
    summaryData.summaryId = docRef.id;
    await docRef.update({ summaryId: summaryData.summaryId });
    
    console.log('✅ Summary generation completed successfully:', summaryData.summaryId);

    return NextResponse.json({
      ...summaryData
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error generating summary:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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
    .get();
  
  const allKeywords = keywordsSnapshot.docs.map(doc => doc.data().word);
  
  if (!allKeywords.length) {
    return [];
  }
  
  if (count >= allKeywords.length) {
    // Fisher-Yates シャッフル
    const shuffled = [...allKeywords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // ランダムサンプル
  const shuffled = [...allKeywords];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, count);
}

// AI を使用して事件シナリオを生成（Python backend の generate_summary と同じ）
async function generateInvestigationScenario(keywords: string[]): Promise<any> {
  try {
    console.log('🔧 Initializing Vertex AI...');
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const vertex_ai = new VertexAI({
      project: projectId!,
      location: 'us-central1'
    });

    console.log('🔧 Getting generative model...');
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

    console.log('📤 Sending prompt to AI...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('📥 AI response received, length:', text.length);

    // JSON ブロックを抽出（Python backend の text_utils.extract_json_block と同じ）
    console.log('🔍 Extracting JSON from AI response...');
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('❌ No JSON block found in AI response:', text);
      throw new Error('No JSON block found in the AI response');
    }

    try {
      const jsonText = jsonMatch[1] || jsonMatch[0];
      console.log('🔧 Parsing JSON:', jsonText.substring(0, 200) + '...');
      const summaryData = JSON.parse(jsonText);
      
      if (!summaryData.summaryName) {
        throw new Error("Invalid summary response format: 'summaryName' not found");
      }

      console.log('✅ Successfully parsed summary data:', summaryData.summaryName);
      return summaryData;
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Parse error'}`);
    }
    
  } catch (error) {
    console.error('❌ Error in generateInvestigationScenario:', error);
    throw error;
  }
}

