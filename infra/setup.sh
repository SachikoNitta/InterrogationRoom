#!/bin/bash
set -e

# プロジェクトIDとプロジェクト番号を取得
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")

# 必要なAPIの有効化
gcloud services enable firestore.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable firebase.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Firestoreデータベース作成（すでに存在する場合はスキップされます）
gcloud firestore databases create --region=asia-northeast1 || true

# サービスアカウント作成（すでに存在する場合はスキップされます）
gcloud iam service-accounts create interrogation-app-sa \
  --display-name="Interrogation Room App Service Account" || true

# サービスアカウントにロール付与
for ROLE in roles/datastore.user roles/run.admin roles/aiplatform.user roles/secretmanager.secretAccessor; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:interrogation-app-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="$ROLE"
done

# Cloud Buildサービスアカウントに必要なロール付与
for ROLE in roles/run.admin roles/iam.serviceAccountUser roles/resourcemanager.projectIamAdmin roles/storage.admin roles/firebase.admin roles/datastore.user roles/aiplatform.user; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
    --role="$ROLE"
done

echo "GCPインフラのセットアップが完了しました。"