# 🚀 完全セットアップチェックリスト

取り調べ室アプリケーションの完全なセットアップと運用開始のためのチェックリストです。

## 📋 事前準備

### Google Cloud Platform
- [ ] **Google Cloud Project作成済み**
  - プロジェクト名: `interrogation-room` (推奨)
  - 課金アカウント設定済み
  - 必要なAPIが有効化可能な状態

- [ ] **gcloud CLI設定済み**
  ```bash
  gcloud auth login
  gcloud config set project YOUR_PROJECT_ID
  gcloud auth application-default login
  ```

### Firebase Setup
- [ ] **Firebaseプロジェクト作成済み**
  - Google Cloudプロジェクトと連携済み
  - Authentication機能有効化済み
  - Firestore Database作成済み
  - Google OAuth設定済み

- [ ] **Firebase Console設定確認**
  - Project Settings → General → Web apps設定
  - Service Accounts → Admin SDK設定
  - Authentication → Sign-in method → Google有効化

---

## 🔧 インフラストラクチャ設定

### 1. サービスアカウント作成
- [ ] **実行**: `./infra/setup-service-account.sh`
- [ ] **確認**: 以下のサービスアカウントが作成されている
  ```bash
  gcloud iam service-accounts list --filter="email:interrogation-app@*"
  ```
- [ ] **権限確認**: Firebase Admin, Firestore, Vertex AI, Secret Manager権限付与済み

### 2. Firebase設定シークレット
- [ ] **実行**: `./infra/setup-secrets.sh`
- [ ] **入力項目**:
  - Firebase API Key
  - Firebase Auth Domain
  - Firebase Project ID
  - Firebase Storage Bucket
  - Firebase Messaging Sender ID
  - Firebase App ID
  - Firebase Measurement ID (オプション)
- [ ] **確認**: Secret Managerにシークレット作成済み
  ```bash
  gcloud secrets list --filter="name:firebase-"
  ```

### 3. Firebase Admin SDK認証
- [ ] **実行**: `./infra/setup-firebase-auth-secrets.sh`
- [ ] **選択した認証方式**:
  - [ ] オプション1: 完全なサービスアカウントJSON
  - [ ] オプション2: 個別認証情報
  - [ ] オプション3: Application Default Credentials
- [ ] **確認**: 認証設定がSecret Managerに保存済み

### 4. 管理者ユーザー設定
- [ ] **実行**: `./infra/setup-admin-users.sh`
- [ ] **管理者メールアドレス入力済み**:
  - メールアドレス1: `____________________`
  - メールアドレス2: `____________________`
  - メールアドレス3: `____________________`
- [ ] **確認**: `admin-emails` シークレット作成済み
  ```bash
  gcloud secrets describe admin-emails
  ```

### 5. Cloud Build権限設定
- [ ] **実行**: `./infra/setup-cloudbuild-permissions.sh`
- [ ] **確認**: Cloud BuildとCompute SAにSecret Manager権限付与済み
- [ ] **確認**: すべてのFirebaseシークレットにアクセス権限設定済み

---

## 🚀 アプリケーションデプロイ

### 初回デプロイ
- [ ] **実行**: `gcloud builds submit --config=infra/cloudbuild-frontend.yml`
- [ ] **ビルド成功確認**: Cloud Build コンソールでビルドログ確認
- [ ] **デプロイ成功確認**: Cloud Runサービス起動確認
- [ ] **アプリケーションURL取得**:
  ```bash
  gcloud run services describe interrogation-app --region=asia-northeast1 --format="value(status.url)"
  ```

### 管理者権限初期化
- [ ] **実行**: `./init-admin.sh`
- [ ] **成功確認**: 管理者権限が正常に初期化された
- [ ] **ログイン確認**: 管理者ユーザーでアプリにログイン可能

---

## ✅ 動作確認

### 基本機能テスト
- [ ] **ユーザー認証**:
  - [ ] `/login` ページでGoogleログイン成功
  - [ ] ダッシュボードページ表示成功
  - [ ] ログアウト機能正常動作

- [ ] **ユーザー機能**:
  - [ ] 新規ケース作成可能
  - [ ] チャット機能正常動作
  - [ ] ケース一覧表示正常
  - [ ] ケース削除可能

### 管理者機能テスト
- [ ] **管理者アクセス**:
  - [ ] `/admin` ページアクセス成功（管理者ユーザー）
  - [ ] `/admin` ページアクセス拒否（一般ユーザー）

- [ ] **キーワード管理**:
  - [ ] 新規キーワード作成成功
  - [ ] キーワード編集成功
  - [ ] キーワード有効/無効切り替え成功
  - [ ] キーワード削除成功

- [ ] **サマリー管理**:
  - [ ] ケース一覧表示成功
  - [ ] サマリー生成成功
  - [ ] 生成されたサマリー表示成功
  - [ ] サマリー検索機能動作確認

---

## 🔒 セキュリティ確認

### 権限設定確認
- [ ] **Firebase Custom Claims**:
  ```bash
  # 管理者ユーザーのcustom claims確認
  # Firebase Admin SDKを使用して確認
  ```

- [ ] **Secret Manager権限**:
  - [ ] サービスアカウントに適切な権限のみ付与
  - [ ] 不要な権限が付与されていない
  - [ ] IAMポリシーの最小権限原則遵守

- [ ] **API エンドポイント保護**:
  - [ ] `/api/admin/*` へのアクセスが管理者のみに制限
  - [ ] 認証なしでのAPIアクセスが適切に拒否
  - [ ] ユーザーデータが適切にスコープされている

### データ保護確認
- [ ] **Firestore Rules**:
  - [ ] ユーザーは自分のデータのみアクセス可能
  - [ ] 管理者は必要なデータのみアクセス可能
  - [ ] 認証なしユーザーのアクセス拒否

- [ ] **Secret管理**:
  - [ ] すべての機密情報がSecret Managerに保存
  - [ ] 環境変数やコードに機密情報なし
  - [ ] ログに機密情報が出力されていない

---

## 📊 監視・運用設定

### ログ設定
- [ ] **Cloud Logging設定**:
  ```bash
  # ログ確認コマンドテスト
  gcloud logs read --limit=10 --filter='resource.type=cloud_run_revision'
  ```

- [ ] **エラー監視**:
  ```bash
  # エラーログ確認
  gcloud logs read --limit=10 --filter='resource.type=cloud_run_revision AND severity>=ERROR'
  ```

### アラート設定（オプション）
- [ ] **Cloud Monitoring設定**:
  - [ ] アプリケーションエラー率アラート
  - [ ] レスポンス時間アラート
  - [ ] リソース使用率アラート

- [ ] **通知設定**:
  - [ ] 管理者向けメール通知
  - [ ] Slack通知（設定している場合）

---

## 🧪 本番運用開始前最終確認

### パフォーマンステスト
- [ ] **負荷テスト**:
  - [ ] 複数ユーザー同時アクセステスト
  - [ ] 長時間会話セッションテスト
  - [ ] 大量データ処理テスト

- [ ] **レスポンス確認**:
  - [ ] ページ読み込み時間acceptable
  - [ ] API レスポンス時間acceptable
  - [ ] サマリー生成時間reasonable

### バックアップ確認
- [ ] **Firestore バックアップ**:
  - [ ] 自動バックアップ設定済み
  - [ ] バックアップ復元テスト実施

- [ ] **Secret Manager**:
  - [ ] すべてのシークレットが適切に保存
  - [ ] シークレットの定期ローテーション計画策定

### ドキュメント整備
- [ ] **運用ドキュメント**:
  - [ ] [管理者マニュアル](../manual/admin.md) 確認済み
  - [ ] トラブルシューティングガイド整備
  - [ ] 連絡先・エスカレーション手順明確化

- [ ] **ユーザーガイド**:
  - [ ] ユーザー向け使用方法ドキュメント作成
  - [ ] FAQ作成
  - [ ] サポート連絡先明示
