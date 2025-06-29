# 本番環境構築・デプロイ手順

---

## 前提
- GCプロジェクトが作成済みであること
- macOSで作業していること
- gcloud CLIがインストール済みであること

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
フロントエンド（Next.jsアプリ：すべてのAPIロジックを含む）をデプロイ
```sh
gcloud builds submit --config=cloudbuild-frontend.yml ..
```

注意：バックエンドはNext.js API routesに統合されたため、別途デプロイは不要です。

### アプリの公開
- GCのCloud Runのプロダクトページに移動
- 「サービス」からこのプロジェクトを選択
- 「セキュリティ」タブの「認証」で「Allow unauthenticated invocations」にチェックをし、保存

### Firebase AuthenticationでGoogleのSSOを有効化
- Firebaseでプロジェクトを選択
- サイドバーの歯車マーク > Project settings
- Your Appsでアプリを新規作成
- サイドバーのAuthentication > Sign-in method
- Sign-in providersでGoogleをプロバイダとして有効化

### Firebase Authenticationの秘密鍵をSecret Managerにアップロード
- サイドバーの歯車マーク > Project settings > Service accounts
- 「Generate new private key」をクリック
- 秘密鍵をダウンロード
- 秘密鍵をSecret Managerに保存
```sh
gcloud secrets create firebase-service-account --data-file=/path/to/serviceAccountKey.json
```

### 環境変数の設定
Next.js APIで使用する環境変数をCloud Runサービスに設定：
```sh
# Firebase認証情報（Secret Managerから取得）
gcloud run services update interrogation-room-frontend \
  --set-env-vars GOOGLE_CLOUD_PROJECT=interrogation-room \
  --region asia-northeast1
```

### Firestoreのインデックスを作成
- `(default)`データベースを開く
- 以下のインデックスを作成
    - `cases`コレクションの、`userId`と`summaryId`の複合インデックス
    - `cases`コレクションの、`userId`の単一インデックス