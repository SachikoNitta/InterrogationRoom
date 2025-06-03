# Interrogation Room

このリポジトリは、Next.jsを用いた尋問ゲームアプリ「Interrogation Room」のソースコードおよびドキュメントを管理しています。

## 概要

ユーザーが容疑者を尋問し、事件の真相を解明するWebアプリケーションです。

## ドキュメント

詳細な仕様や設計資料は [docs/](./docs/) ディレクトリにまとめています。

- [システム構成](./docs/architecture.md)
- [セットアップ手順](./docs/setup.md)
- [API仕様（OpenAPI）](./docs/api/openapi.yml)
- [認証仕様](./docs/auth/auth.md)
- [データベース仕様](./docs/db/firestore.md)
- [ゲームシステム仕様](./docs/game/flow.md)
- [プロンプト例](./docs/game/system_prompt.md)

## ローカル開発

1. 必要なツールをインストール  
   - Node.js（v18以上推奨）
   - npm または yarn

2. 依存パッケージのインストール  
   ```sh
   cd app
   npm install
   ```

3. 開発サーバーの起動  
   ```sh
   npm run dev
   ```

4. ブラウザで [http://localhost:3000](http://localhost:3000) にアクセス

※GCP連携やAPIをローカルで動かす場合は、必要に応じて`.env.local`などで環境変数や認証情報を設定してください。

## ライセンス

MIT
