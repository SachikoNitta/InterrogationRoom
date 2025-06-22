# 技術仕様

---

## 構成概要
このアプリは、ユーザーが容疑者に尋問するゲームを実現するための構成です。
以下の技術で構成されています：
- フロントエンド: Next.js + ShadCN UI（App Router構成）をCloud Runでホスティング
- バックエンド/API: Fast APIアプリをCloud Runでホスティング
- データベース: Firestore
- 認証: Firebase Authentication（Google SSO）
- AI連携: Vertex AI（Gemini API）
- アプリケーションホスティング: Cloud Run（GCP）
- デプロイ: Cloud Build
- バージョン管理: GitHub

---

## 使用 GCP サービス
- Cloud Run（アプリケーションホスティング）
- Firebase Authentication（SSO 認証）
- Firestore（ゲーム状態とログの保存）
- Vertex AI（容疑者応答生成）
- Secret Manager（バックエンドのAPIキーやプロンプトを管理）

---

## ディレクトリ構成（一部）

interrogation_room/
├── app/                    # Next.js アプリ本体
│   ├── public/             # 静的ファイル
│   └── src/                # アプリケーションコード
│       └── app/            # ページ・APIルート
│ 
├── backend/                # バックエンド FastAPI サーバー
│   ├── models/             # データモデル
│   ├── prompts/            # プロンプト
│   ├── repository/         # DBロジック
│   ├── routers/            # APIエンドポイント
│   ├── services/           # ビジネスロジック
│   └── schemas/            # リクエスト/レスポンススキーマ
│ 
├── docs/                   # ドキュメント（仕様、設計など）
│   ├── setup/              # 各環境のセットアップ方法
│   ├── architecture.md     # 技術仕様
│   └── game_flow.md        # ゲームの流れ
│ 
├── infra/                  # CloudBuild設定ファイルとシェルスクリプト
│ 
└── README.md

---

## ステートレス構成について
このプロジェクトは、サーバーサイドのアプリ（Fast API）をCloud Runなどのステートレスなサーバーレス実行基盤上で動かせる構成としました。（デプロイのしやすさ、低コストなどの利点が大きいため）
- サーバーはユーザー情報や進捗についての情報を持ちません。
- API 認証はすべて Firebase JWT により、認証情報（JWT）はクライアント側で保持されます。
- 取り調べの進捗状態などの状態はすべて Firestore に保存されます。

---

## 認証について

### 認証フロー概要
1. クライアント側で Firebase にログイン（GoogleなどのSSO）
2. getIdToken() で IDトークン（JWT）取得
3. トークンを Authorization: Bearer <token> でAPIに送信
4. サーバーは Firebase Admin SDK で verifyIdToken() を実行しユーザーを検証

### 開発用メモ
- トークンは Bearerヘッダーで送信すること
- 認証失敗時は 401 Unauthorized を返却すること
- クライアント側でリクエストを行う際はgetIdToken()でトークンをリフレッシュすること

---

## AIを使用している箇所
- 概要の生成
- 取り調べにおける容疑者の返答生成

---

## データモデルについて
`backend/models`を参照

---

## APIルートについて
`backend/routers`を参照



