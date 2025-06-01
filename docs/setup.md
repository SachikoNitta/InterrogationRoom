# GCPインフラ構築・デプロイ手順（Cloud Build + Terraform）

このプロジェクトのインフラ（Firestore, Cloud Run, Vertex AI, Firebase Auth, サービスアカウント等）はTerraformで管理し、アプリのビルド・デプロイはCloud Buildで自動化します。

## 前提
- GCPプロジェクトが作成済みであること
- macOSで作業していること
- gcloud CLIとTerraformがインストール済みであること

## 構成概要
- インフラ管理: infra/terraformディレクトリ（Terraform）
- アプリビルド・デプロイ: infra/cloudbuild.yml（Cloud Build）
- Dockerイメージ管理: Google Container Registry (GCR)
- Cloud Run: Next.jsアプリをデプロイ

## 手順

1. gcloudのデフォルトプロジェクト確認・切り替え

Cloud BuildやTerraformを実行する前に、gcloud CLIのデフォルトプロジェクトが正しいか確認・設定してください。

-  現在のプロジェクトIDを確認
   ```sh
   gcloud config get-value project
   ```
-  プロジェクトIDを切り替えたい場合
   ```sh
   gcloud config set project あなたのGCPプロジェクトID
   ```


1. GCP認証
```sh
gcloud auth application-default login
```

2. infra/terraform.tfvarsの作成
`infra/terraform/terraform.tfvars` に以下の内容を記載します。
```hcl
project_id  = "あなたのGCPプロジェクトID"
location_id = "asia-northeast1"
image_url   = "gcr.io/あなたのGCPプロジェクトID/next-app"
```

3. Cloud Buildサービスアカウントに権限を付与
このプロジェクトではTerraformでGCP上の権限も付与しますが、Cloud Buildのみ初回は手動で権限設定が必要です。（Terraform自体をCloud Buildから実行するため）。以下の手順で権限を付与してください。

1. GCPコンソールにアクセスし、対象プロジェクトを選択します。
2. 左メニューから「Cloud Build」→「設定」を開きます。
3. Cloud Buildのサービスアカウント（例: `[PROJECT_NUMBER]@cloudbuild.gserviceaccount.com`）が選択されていることを確認します。
4. 「Cloud Run管理者」「Firebase 管理者」「サービス アカウント ユーザー」を有効化します。（TODO：いずれかでも大丈夫かも


5. Cloud Buildによるビルド＆デプロイ
infraディレクトリで以下を実行します。
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

