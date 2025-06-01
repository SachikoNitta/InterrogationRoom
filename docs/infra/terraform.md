# TerraformによるGCPインフラ構築手順

このプロジェクトのインフラ（Firestore, Cloud Run, Vertex AI, Firebase Auth, サービスアカウント等）はTerraformで管理します。

## 前提
- GCPプロジェクトが作成済みであること
- macOSで作業していること
- gcloud CLIとTerraformがインストール済みであること

## 手順

1. **GCP認証**
   ```sh
gcloud auth application-default login
```

2. **terraform.tfvarsの作成**
   `terraform/terraform.tfvars` に以下の内容を記載します。
   ```hcl
project_id  = "あなたのGCPプロジェクトID"
location_id = "asia-northeast1"
```

3. **Terraform初期化**
   ```sh
cd terraform
terraform init
```

4. **変更内容の確認**
   ```sh
terraform plan
```

5. **適用（リソース作成）**
   ```sh
terraform apply
```
   内容を確認し、`yes` と入力して実行します。

---

これでFirestore, Cloud Run, Vertex AI, Firebase Auth, サービスアカウント等が自動で構築されます。
