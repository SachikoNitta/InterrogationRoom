# GCPインフラ構築・デプロイ手順（Cloud Build + Terraform）

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

---

## 各種変数の確認方法
このアプリのセットアップに使用する変数はそれぞれ以下の方法でご確認ください。
- [YOUR_PROJECT_ID]: コンソール上部でプロジェクトを切り替え > IAMと管理 > 設定 > プロジェクトID
- [YOUR_PROJECT_NO]: コンソール上部でプロジェクトを切り替え > IAMと管理 > 設定 > プロジェクト番号

---

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

---

### infra/terraform.tfvarsの作成
`infra/terraform/terraform.tfvars` に以下の内容を記載します。
```hcl
project_id  = "[YOUR_PROJECT_ID]"
location_id = "asia-northeast1"
image_url   = "gcr.io/[YOUR_PROJECT_ID]/next-app"
fast_image_url = "gcr.io/[YOUR_PROJECT_ID]/fast-api"
```

---

### Cloud Buildサービスアカウントにロールを付与
```sh
PROJECT_ID=[YOUR_PROJECT_ID]
SA=[YOUR_PROJECT_NO]@cloudbuild.gserviceaccount.com

for ROLE in
  roles/run.admin
  roles/iam.serviceAccountUser
  roles/resourcemanager.projectIamAdmin
  roles/storage.admin
  roles/firebase.admin
  roles/datastore.user
  roles/aiplatform.user
do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA" \
    --role="$ROLE"
done
```
付与できているロールを確認
```
gcloud projects get-iam-policy [YOUR_PROJECT_ID] \
  --flatten="bindings[].members" \
  --format='table(bindings.role)' \
  --filter="bindings.members:[YOUR_PROJECT_NO]@cloudbuild.gserviceaccount.com"
```

---

###  Cloud Buildによるビルド＆デプロイ
```sh
cd infra
gcloud builds submit --config=cloudbuild-infra.yml ..
gcloud builds submit --config=cloudbuild-app.yml ..
```

アプリ(/appもしくは/backend以下)のみを更新したい場合
```sh
cd infra
gcloud builds submit --config=cloudbuild-app.yml ..
```

インフラ（/infra以下）のみを更新したい場合
```sh
cd infra
gcloud builds submit --config=cloudbuild-infra.yml ..
```

### アプリの公開
- GCのCloud Runのプロダクトページに移動
- 「サービス」からこのプロジェクトを選択
- 「セキュリティ」タブの「認証」で「Allow unauthenticated invocations」にチェックをし、保存
（TODO：この操作をTerraformに含む）

---

## Secret Managerにシステムプロンプトを登録する

GCPのSecret Managerに「system_prompt」というキーでシークレットを作成し、システムプロンプトの内容を保存してください。

1. GCPコンソールで「Secret Manager」に移動
2. 「シークレットを作成」をクリック
3. 名前に `system_prompt` を入力
4. シークレットの値にシステムプロンプトの内容（例: あなたは事件の容疑者です。...）を入力
5. 作成を完了

- このシークレットはアプリケーションから自動的に取得されます。
- Terraformで管理する場合は、`google_secret_manager_secret` と `google_secret_manager_secret_version` リソースを利用してください。

---

## 補足
- アプリのデプロイとインフラの変更は、**用途ごとにコマンドを分けて実行**してください。
- どちらのCloud Buildも、GCPコンソールのCloud Build画面で進捗やログを確認できます。
- 必要に応じて、cloudbuild-app.yml（アプリのみデプロイ）も利用可能です。
- インフラ変更時は、事前に`terraform plan`で差分を確認することを推奨します。
