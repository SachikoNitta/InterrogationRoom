# Interrogation Room

このリポジトリは、Next.jsを用いた尋問ゲームアプリ「Interrogation Room」のソースコードおよびドキュメントを管理しています。

## 概要

ユーザーが容疑者を尋問し、事件の真相を解明するWebアプリケーションです。

## ドキュメント

詳細な仕様や設計資料は [docs/](./docs/) ディレクトリにまとめています。

- [仕様書（spec.md）](./docs/spec.md)
- [API仕様（OpenAPI）](./docs/api/openapi.yml)
- [データベース仕様](./docs/db/firestore.md)
- [ゲームシステム仕様](./docs/game/game_system.md)
- [プロンプト例](./docs/game/prompts/system.md)

## GCPセットアップ

1. **GCPプロジェクトの作成**
   - [Google Cloud Console](https://console.cloud.google.com/) で新しいプロジェクトを作成します。

2. **サービスアカウントとAPIキーの作成**
   - IAMと管理 > サービスアカウント から新規サービスアカウントを作成し、必要なロール（Firestore管理者、Vertex AIユーザーなど）を付与します。
   - サービスアカウントの鍵（JSON）を作成・ダウンロードします。
   - 必要に応じてAPIキーも作成します。

3. **Firestoreの有効化**
   - コンソールの「Firestore」からデータベースを作成し、ネイティブモードを選択します。

4. **Vertex AIの有効化**
   - 「APIとサービス」>「ライブラリ」から「Vertex AI API」を検索し有効化します。

## セットアップ

```bash
cd terraform

# 認証（さっき作ったサービスアカウントキー使用）
export GOOGLE_APPLICATION_CREDENTIALS="your-service-account-key.json"

# Terraform初期化
terraform init

# 実際に作成されるリソース確認
terraform plan

# 実行！
terraform apply
```

## ディレクトリ構成

- `app/` … Next.jsアプリ本体
- `docs/` … ドキュメント
- `terraform/` … インフラ構成管理

## ライセンス

MIT
