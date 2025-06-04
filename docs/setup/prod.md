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
gcloud builds submit --config=cloudbuild.yml ..
```
このコマンドにより以下が実行されます。

1. `./app`ディレクトリのNext.jsアプリをDockerイメージ（gcr.io/$PROJECT_ID/next-app）としてビルドします。
2. ビルドしたDockerイメージをGoogle Container Registry（GCR）にpushします。
3. `infra/terraform`ディレクトリに移動し、Terraformの初期化（terraform init）を行います。
4. Terraformの構成ファイル（main.tf等）をもとに、以下の処理を自動で行います。
   - Firestore、Cloud Run、Vertex AI、Firebase Auth、サービスアカウントなど、GCP上の必要なリソースを作成・更新・削除します。
   - Cloud Runには、直前でビルド・pushされたDockerイメージ（image_urlで指定）をデプロイします。
   - サービスアカウントへのロール付与や、各種APIの有効化も自動で行います。
   - 既存リソースとの差分を検出し、必要な変更のみを適用します（インフラの状態をコードで一元管理）。

---

### アプリの公開
- GCのCloud Runのプロダクトページに移動
- 「サービス」からこのプロジェクトを選択
- 「セキュリティ」タブの「認証」で「Allow unauthenticated invocations」にチェックをし、保存
（TODO：この操作をTerraformに含む）

---

## Cloud Buildによる本番運用フロー（2025年6月更新）

本番運用では、Cloud Buildの構成ファイルを用途ごとに分離し、以下のように運用します。

### 1. アプリのデプロイ（ソースコード変更時）

アプリのコード（app/ または backend/）を変更した場合は、下記コマンドでデプロイします。

```sh
cd infra
# cloudbuild.yml または cloudbuild-app.yml どちらでもOK
# cloudbuild.ymlはNext.js/fast-api両方のデプロイを行う

gcloud builds submit --config=cloudbuild.yml ..
```
- Next.js（app/）とFastAPI（backend/）のDockerイメージをビルド＆GCRにpush
- Cloud Runサービスを直接更新
- **Terraformは実行されません**

### 2. インフラの変更（Terraform管理リソースの追加・変更時）

インフラ構成（infra/terraform/*.tfやterraform.tfvars）を変更した場合は、下記コマンドでTerraformを実行します。

```sh
cd infra
# cloudbuild-infra.ymlを指定

gcloud builds submit --config=cloudbuild-infra.yml ..
```
- TerraformでGCPリソースの作成・更新・削除を実行
- アプリのDockerイメージやCloud Runサービスは変更されません

TODO: 2度目以降fast APIのデプロイが終わらないので調査

---

## 補足
- アプリのデプロイとインフラの変更は、**用途ごとにコマンドを分けて実行**してください。
- どちらのCloud Buildも、GCPコンソールのCloud Build画面で進捗やログを確認できます。
- 必要に応じて、cloudbuild-app.yml（アプリのみデプロイ）も利用可能です。
- インフラ変更時は、事前に`terraform plan`で差分を確認することを推奨します。
