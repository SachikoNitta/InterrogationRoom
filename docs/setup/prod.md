# 本番環境構築・デプロイ手順

---

## 前提
- GCプロジェクトが作成済みであること
- macOSで作業していること
- gcloud CLIがインストール済みであること

---

## 構成概要
- インフラ初期構築: infra/setup.sh
- アプリビルド・デプロイ: infra/cloudbuild.yml（Cloud Build）
- Dockerイメージ管理: Google Container Registry (GCR)
- Cloud Run: Next.jsアプリとFast APIアプリをデプロイ
- プロンプト管理: Secret Manager

---

## 手順

### gcloudコマンドの設定
現在のプロジェクトIDを確認
```sh
gcloud config get-value project
```
プロジェクトIDを切り替えたい場合
```sh
gcloud config set project [YOUR_PROJECT_ID]
```
GCP認証を行う
```sh
gcloud auth application-default login
```
ログインできていることを確認
```sh
gcloud auth list
```

### setup.shの実行
Google Cloud上でこのアプリを動作させるために必要な環境の初期構築を行います
```sh
cd infra
bash setup.sh
```

###  Cloud Buildによるビルド＆デプロイ
フロントエンドをデプロイ
```sh
gcloud builds submit --config=cloudbuild-frontend.yml ..
```
バックエンドをデプロイ
```sh
gcloud builds submit --config=cloudbuild-backend.yml ..
```

### アプリの公開
- GCのCloud Runのプロダクトページに移動
- 「サービス」からこのプロジェクトを選択
- 「セキュリティ」タブの「認証」で「Allow unauthenticated invocations」にチェックをし、保存

### Firebase Authenticationの設定
- Firebaseでプロジェクトを選択
- サイドバーの歯車マーク > Project Settings
- Your Appsでアプリを新規作成
- firebaseConfigの値を`app/.env`にセット
```
FIREBASE_API_KEY=AIzaSyD-YGsKLwGLLOCRLZCRc1tO1jlVmeY9TQc
FIREBASE_AUTH_DOMAIN=interrogation-room.firebaseapp.com
FIREBASE_PROJECT_ID=interrogation-room
FIREBASE_STORAGE_BUCKET=interrogation-room.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=488803469381
FIREBASE_APP_ID=1:488803469381:web:e7687b4c35db39032c3b2c
FIREBASE_MEASUREMENT_ID=G-N8RVNDGL6G
```
- Authentication > Sign-in method
- Sign-in providersでGoogleをプロバイダとして有効化

### Secret Managerにシステムプロンプトを登録する

GCのSecret Managerに「system_prompt」というキーでシークレットを作成し、システムプロンプトの内容を保存してください。

1. GCコンソールで「Secret Manager」に移動
2. 「シークレットを作成」をクリック
3. 名前に `system_prompt` を入力
4. シークレットの値にシステムプロンプトの内容（例: あなたは事件の容疑者です。...）を入力
5. 作成を完了

- このシークレットはアプリケーションから自動的に取得されます。

