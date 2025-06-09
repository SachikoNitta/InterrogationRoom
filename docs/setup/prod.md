# 本番環境構築・デプロイ手順

---

## 前提
- GCPプロジェクトが作成済みであること
- macOSで作業していること
- gcloud CLIとTerraformがインストール済みであること

---

## 構成概要
- インフラ管理: infra/terraformディレクトリ（Terraform）
- アプリビルド・デプロイ: infra/cloudbuild.yml（Cloud Build）
- Dockerイメージ管理: Google Container Registry (GCR)
- Cloud Run: Next.jsアプリをデプロイ

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
Google Cloud上でこのアプリを動作させるために必要な環境を構築します
```sh
cd infra
bash setup.sh
```

###  Cloud Buildによるビルド＆デプロイ
アプリ(/appもしくは/backend以下)をデプロイ
```sh
gcloud builds submit --config=cloudbuild-app.yml ..
```

### アプリの公開
- GCのCloud Runのプロダクトページに移動
- 「サービス」からこのプロジェクトを選択
- 「セキュリティ」タブの「認証」で「Allow unauthenticated invocations」にチェックをし、保存

### Secret Managerにシステムプロンプトを登録する

GCPのSecret Managerに「system_prompt」というキーでシークレットを作成し、システムプロンプトの内容を保存してください。

1. GCPコンソールで「Secret Manager」に移動
2. 「シークレットを作成」をクリック
3. 名前に `system_prompt` を入力
4. シークレットの値にシステムプロンプトの内容（例: あなたは事件の容疑者です。...）を入力
5. 作成を完了

- このシークレットはアプリケーションから自動的に取得されます。

---

## 補足
- アプリのデプロイとインフラの変更は、**用途ごとにコマンドを分けて実行**してください。
- どちらのCloud Buildも、GCPコンソールのCloud Build画面で進捗やログを確認できます。
- 必要に応じて、cloudbuild-app.yml（アプリのみデプロイ）も利用可能です。
- インフラ変更時は、事前に`terraform plan`で差分を確認することを推奨します。
- Cloud Buildのサービスアカウントを作る理由：`gcloud builds submit`でデプロイする場合、実行アカウントにCloud Buildのデフォルトのサービスアカウントを指定することができないため。デフォルトで指定されるCompute Engineのサービスアカウントを使用することもできるが、Cloud Build関連の権限を付与することを考慮すると、ユーザー管理のサービスアカウントを作成する方がわかりやすいため。
