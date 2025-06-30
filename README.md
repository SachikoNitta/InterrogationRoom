# 取り調べ室 (Interrogation Room)

AI を活用した刑事事件取り調べシミュレーションゲーム

## 📋 プロジェクト概要

このアプリケーションは、プレイヤーが刑事となって容疑者を取り調べる体験型ゲームです。Google Vertex AI (Gemini) を使用して、リアルな容疑者の応答を生成し、本格的な取り調べ体験を提供します。

### 主な機能
- **事件シナリオ自動生成**: AI が架空の事件を作成
- **容疑者との対話**: AI が容疑者役として応答
- **取り調べアシスタント**: AI が新米刑事として助言
- **管理者機能**: 事件データ・キーワード管理

## 🏗️ 技術構成

### フロントエンド
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Firebase Authentication** (Google SSO)

### バックエンド・API
- **Next.js API Routes** (TypeScript)
- **Google Cloud Firestore** (データベース)
- **Google Vertex AI** (Gemini-1.5-pro)

### インフラストラクチャ
- **Google Cloud Run** (ホスティング)
- **Google Cloud Build** (CI/CD)
- **Firebase** (認証・データベース)
- **Google Cloud Secret Manager** (機密情報管理)

## 🚀 セットアップ

### 前提条件
- Node.js 20.x 以上
- Google Cloud Project
- Firebase Project
- gcloud CLI

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd interrogation_room
```

### 2. 依存関係のインストール
```bash
cd app
npm install
```

### 3. 環境変数の設定
```bash
cp .env.example .env.local
```

`.env.local` を編集して以下の値を設定:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=asia-northeast1

# Firebase Admin (Base64 encoded service account key)
FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

### 4. 開発サーバーの起動
```bash
npm run dev
```

アプリケーションは http://localhost:3000 で利用可能になります。

## 📁 プロジェクト構造

```
interrogation_room/
├── app/                      # Next.js アプリケーション
│   ├── src/
│   │   ├── app/             # App Router ページ・APIルート
│   │   │   ├── api/         # API エンドポイント
│   │   │   │   ├── admin/   # 管理者用 API
│   │   │   │   └── cases/   # ケース管理 API
│   │   │   ├── admin/       # 管理者画面
│   │   │   └── cases/       # ゲーム画面
│   │   ├── components/      # React コンポーネント
│   │   └── lib/            # ユーティリティ・設定
│   └── public/             # 静的ファイル
├── docs/                   # ドキュメント
│   ├── setup/             # セットアップガイド
│   └── manual/            # 操作マニュアル
└── infra/                 # インフラ設定・デプロイスクリプト
```

## 🎮 使用方法

### プレイヤー向け

1. **Google アカウントでログイン**
2. **事件を選択**: 利用可能な事件一覧から選択
3. **取り調べ開始**: 容疑者と対話して真実を探る
4. **アシスタント相談**: 新米刑事 AI に助言を求める

### 管理者向け

1. **管理者権限でログイン**
2. **事件管理**: `/admin` で事件データを管理
3. **キーワード管理**: 事件生成用キーワードを管理
4. **新規事件生成**: AI を使用して新しい事件を作成

## 🔧 開発情報

### AI モデル設定
- **事件生成**: `gemini-1.5-pro` (asia-northeast1)
- **容疑者応答**: `gemini-1.5-pro-002` (asia-northeast1)
- **アシスタント**: `gemini-1.5-pro-002` (asia-northeast1)

### API エンドポイント
- `POST /api/admin/summaries/generate` - 事件シナリオ生成
- `POST /api/cases/[caseId]/chat` - 容疑者との対話
- `POST /api/cases/[caseId]/chat/assistant` - アシスタントとの対話

### データベース構造
- `summaries` - 事件データ
- `cases` - ユーザーの進行状況
- `chat_sessions` - 対話履歴
- `keywords` - 事件生成用キーワード

## 🚀 デプロイ

### Google Cloud Run へのデプロイ
```bash
# Cloud Build を使用
gcloud builds submit --config=infra/cloudbuild-frontend.yml

# または手動デプロイ
gcloud run deploy interrogation-room-frontend \
  --source=app \
  --platform=managed \
  --allow-unauthenticated
```

詳細なデプロイ手順は [docs/setup/prod.md](docs/setup/prod.md) を参照してください。

## 📚 ドキュメント

- [セットアップガイド](docs/setup/README.md)
- [アーキテクチャ概要](docs/architecture.md)
- [ユーザーマニュアル](docs/manual/user.md)
- [管理者マニュアル](docs/manual/admin.md)

## 🔒 セキュリティ

- Firebase Authentication による認証
- Google Cloud IAM による権限管理
- 管理者権限の厳格な制御
- 機密情報は Secret Manager で管理

## 🤝 貢献

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 ライセンス

This project is licensed under the MIT License.

## 🆘 トラブルシューティング

### よくある問題

**Vertex AI エラー (404 Not Found)**
```
モデルが見つからない場合は、以下を確認:
- Google Cloud Project で Vertex AI API が有効化されているか
- 適切なリージョン (asia-northeast1) を使用しているか
- サービスアカウントに適切な権限があるか
```

**Firebase 認証エラー**
```
認証に失敗する場合は、以下を確認:
- Firebase プロジェクト設定が正しいか
- .env.local の設定値が正しいか
- サービスアカウントキーが有効か
```

より詳細な情報は [docs/setup/](docs/setup/) のガイドを参照してください。