#!/bin/bash

# プロジェクトIDを取得
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "Error: No project ID found. Please set your project with 'gcloud config set project YOUR_PROJECT_ID'"
    exit 1
fi

echo "Setting up service account for project: $PROJECT_ID"

# アプリケーション用のサービスアカウントを作成
SERVICE_ACCOUNT_NAME="interrogation-app"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Creating service account: $SERVICE_ACCOUNT_EMAIL"
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --display-name="Interrogation App Service Account" \
    --description="Service account for Interrogation Room app running on Cloud Run"

# 必要なIAMロールを付与
echo "Granting Firebase Admin SDK permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/firebase.admin"

echo "Granting Firestore permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/datastore.user"

echo "Granting Vertex AI permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/aiplatform.user"

echo "Granting Secret Manager permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/secretmanager.secretAccessor"

echo "Service account setup completed!"
echo "Service Account Email: $SERVICE_ACCOUNT_EMAIL"
echo ""
echo "Next steps:"
echo "1. Run the deployment: gcloud builds submit --config=infra/cloudbuild-frontend.yml"
echo "2. The Cloud Run service will use this service account automatically"