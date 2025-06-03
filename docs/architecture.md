# システムアーキテクチャ

## 構成概要
このアプリは、ユーザーが容疑者に尋問するゲームを実現するための構成です。
以下の技術で構成されています：
- フロントエンド: Next.js + ShadCN UI（App Router構成）
- バックエンド/API: Next.jsアプリ（UI+API）をCloud Runでホスト
- データベース: Firestore（NoSQLドキュメントストア）
- 認証: Firebase Authentication（Google SSO）
- AI連携: Vertex AI（Gemini API）
- インフラ管理: Terraform
- アプリケーションホスティング: Cloud Run（GCP）

## 使用 GCP サービス
- Cloud Run（アプリケーションホスティング）
- Firebase Authentication（SSO 認証）
- Firestore（ゲーム状態とログの保存）
- Vertex AI（容疑者応答生成）

## ディレクトリ構成（一部）

interrogation_room/
├── app/                # Next.js アプリ本体
│   ├── public/         # 静的ファイル
│   └── src/            # アプリケーションコード
│       └── app/        # ページ・APIルート
├── docs/               # ドキュメント（仕様、設計など）
│   ├── api/
│   ├── auth/
│   ├── db/
│   └── game/
├── infra/          # GCP用インフラ設定
└── README.md

## ステートレス構成について
このプロジェクトは、アプリ（Next.js）をCloud Runなどのステートレスなサーバーレス実行基盤上で動かせる構成としました。（プロイのしやすさ、低コストなどの利点が大きいため）
ステートレスにするため、以下のように工夫しています。
- サーバーはユーザー情報や進捗についての情報を持ちません。
- API 認証はすべて Firebase JWT により、認証情報（JWT）はクライアント側で保持されます。
- 取り調べの進捗状態などの状態はすべて Firestore に保存されます。
- ユーザーの画面状態は React の State と Firestore によって再構築できるようにしました。