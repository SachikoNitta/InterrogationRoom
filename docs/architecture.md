# 技術仕様・アーキテクチャ

---

## 構成概要
このアプリケーションは、ユーザーが刑事として容疑者に取り調べを行うAIゲームを実現するための構成です。
以下の技術で構成されています：

### 現在の構成 (2025年6月30日更新)
- **フロントエンド**: Next.js 15 + shadcn/ui（App Router構成）
- **バックエンド/API**: Next.js API Routes（TypeScript）
- **データベース**: Google Cloud Firestore
- **認証**: Firebase Authentication（Google SSO）
- **AI連携**: Google Vertex AI（Gemini-1.5-pro）
- **ホスティング**: Google Cloud Run
- **デプロイ**: Google Cloud Build
- **バージョン管理**: GitHub

### 旧構成（参考）
- バックエンド/API: FastAPI（Python）→ **Next.js API Routes に移行済み**

---

## 使用 GCP サービス
- **Cloud Run**（アプリケーションホスティング）
- **Firebase Authentication**（Google SSO 認証）
- **Cloud Firestore**（ゲーム状態とログの保存）
- **Vertex AI**（容疑者・アシスタントの応答生成）
- **Secret Manager**（Firebase認証情報等の管理）
- **Cloud Build**（CI/CD パイプライン）

---

## ディレクトリ構成

```
interrogation_room/
├── app/                    # Next.js アプリケーション本体
│   ├── src/
│   │   ├── app/           # App Router ページ・APIルート
│   │   │   ├── api/       # API エンドポイント
│   │   │   │   ├── admin/ # 管理者用API（事件生成など）
│   │   │   │   └── cases/ # ケース管理API（チャット等）
│   │   │   ├── admin/     # 管理者画面
│   │   │   ├── cases/     # ゲーム画面
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/    # 共通UIコンポーネント
│   │   │   ├── ui/        # shadcn/ui コンポーネント
│   │   │   └── ...
│   │   └── lib/          # ユーティリティ・設定
│   │       ├── firebase-admin.ts
│   │       ├── firebase.ts
│   │       └── firestore.ts
│   ├── public/           # 静的ファイル
│   ├── package.json
│   └── .env.example
│ 
├── backend/              # 旧FastAPI（参考用・非使用）
│   ├── models/           # データモデル
│   ├── services/         # ビジネスロジック
│   └── ...
│ 
├── docs/                 # ドキュメント
│   ├── setup/           # セットアップガイド
│   ├── manual/          # 操作マニュアル
│   └── architecture.md  # 本ファイル
│ 
├── infra/               # デプロイ設定
│   ├── cloudbuild-frontend.yml
│   └── setup-scripts/
│ 
└── README.md
```

---

## アプリケーション構成

### ステートレス設計
このプロジェクトは、Next.js をCloud Runなどのステートレスなサーバーレス実行基盤上で動かせる構成です。

**特徴:**
- サーバーはユーザー情報や進捗についての状態を持ちません
- API 認証はすべて Firebase JWT により、認証情報（JWT）はクライアント側で保持
- 取り調べの進捗状態などはすべて Firestore に保存
- スケーラビリティと低コストを実現

### データフロー
```
[ユーザー] ←→ [Next.js Frontend] ←→ [Next.js API Routes] ←→ [Firestore]
                                            ↓
                                    [Vertex AI (Gemini)]
```

---

## 認証システム

### 認証フロー
1. **クライアント認証**: Firebase Authentication で Google SSO ログイン
2. **トークン取得**: `getIdToken()` で IDトークン（JWT）を取得
3. **API認証**: `Authorization: Bearer <token>` ヘッダーでAPI送信
4. **サーバー検証**: Firebase Admin SDK で `verifyIdToken()` 実行

### 管理者権限
- 特定のユーザーのみ管理者として設定
- 管理者用APIは権限チェック後にアクセス可能
- 事件生成・キーワード管理等の機能を提供

---

## AI統合

### 使用モデル・リージョン
- **事件生成**: `gemini-1.5-pro` (asia-northeast1)
- **容疑者応答**: `gemini-1.5-pro-002` (asia-northeast1)
- **アシスタント**: `gemini-1.5-pro-002` (asia-northeast1)

### AI機能
1. **事件シナリオ自動生成**
   - キーワードベースで架空の事件を作成
   - 容疑者情報・証拠・供述等を含む構造化データ生成

2. **容疑者ロールプレイ**
   - 事件情報に基づいた容疑者として応答
   - 最初は否認、証拠突きつけで感情的反応、最終的に自白

3. **新米刑事アシスタント**
   - 証拠・供述情報を元にした助言
   - 取り調べ戦略の提案

---

## データモデル

### Firestore コレクション
```typescript
// summaries - 事件データ
{
  summaryId: string;
  summaryName: string;
  dateOfIncident: string;
  overview: string;
  category: string;
  statements: Array<{
    name: string;
    relation: string;
    statement: string;
  }>;
  physicalEvidence: Array<{
    evidenceNumber: string;
    type: string;
    foundLocation: string;
    remarks: string;
  }>;
  suspectInfo: Array<{
    name: string;
    criminalRecord: string;
    alibi: string;
  }>;
}

// cases - ユーザーの進行状況
{
  caseId: string;
  userId: string;
  summaryId: string;
  status: 'active' | 'completed';
  createdAt: Timestamp;
}

// chat_sessions - 対話履歴
{
  sessionId: string;
  caseId: string;
  type: 'suspect' | 'assistant';
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Timestamp;
  }>;
}

// keywords - 事件生成用キーワード
{
  keywordId: string;
  word: string;
  category?: string;
}
```

---

## API エンドポイント

### 管理者用 API
- `POST /api/admin/summaries/generate` - 事件シナリオ生成
- `GET /api/admin/summaries` - 事件一覧取得
- `POST /api/admin/keywords` - キーワード管理

### プレイヤー用 API
- `GET /api/cases` - 利用可能事件一覧
- `POST /api/cases` - 新規ケース作成
- `POST /api/cases/[caseId]/chat` - 容疑者との対話
- `POST /api/cases/[caseId]/chat/assistant` - アシスタントとの対話

---

## セキュリティ

### 認証・認可
- Firebase Authentication による厳格な認証
- JWT トークンによる API アクセス制御
- 管理者権限の分離

### データ保護
- Firestore セキュリティルールによるデータアクセス制御
- Google Cloud IAM による権限管理
- 機密情報は Secret Manager で管理

---

## パフォーマンス

### 最適化施策
- Next.js の静的生成・サーバーサイドレンダリング活用
- Firestore のインデックス最適化
- Cloud Run の自動スケーリング
- CDN による静的ファイル配信

### 監視・ログ
- Cloud Logging による包括的ログ管理
- エラー監視とアラート設定
- パフォーマンスメトリクス計測

---

## 将来の拡張予定

### 機能拡張
- 複数容疑者の同時取り調べ
- 証拠提示システム
- スコアリング・ランキング機能
- マルチプレイヤー対応

### 技術改善
- リアルタイム通信（WebSocket）
- 音声認識・合成機能
- より高度なAI推論エンジン
- モバイルアプリ対応



