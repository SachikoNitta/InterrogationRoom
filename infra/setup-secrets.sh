#!/bin/bash

# プロジェクトIDを取得
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "Error: No project ID found. Please set your project with 'gcloud config set project YOUR_PROJECT_ID'"
    exit 1
fi

echo "Setting up secrets for project: $PROJECT_ID"

# Secret Manager APIを有効化
echo "Enabling Secret Manager API..."
gcloud services enable secretmanager.googleapis.com

# Firebase設定シークレットを作成
echo "Creating Firebase configuration secrets..."

# これらを実際のFirebase設定値に置き換えてください
# Firebase Console -> Project Settings -> General -> Web appsで確認できます
read -p "Enter Firebase API Key: " FIREBASE_API_KEY
read -p "Enter Firebase Auth Domain (e.g., your-project.firebaseapp.com): " FIREBASE_AUTH_DOMAIN
read -p "Enter Firebase Project ID: " FIREBASE_PROJECT_ID
read -p "Enter Firebase Storage Bucket (e.g., your-project.firebasestorage.app): " FIREBASE_STORAGE_BUCKET
read -p "Enter Firebase Messaging Sender ID: " FIREBASE_MESSAGING_SENDER_ID
read -p "Enter Firebase App ID: " FIREBASE_APP_ID
read -p "Enter Firebase Measurement ID (optional, press enter to skip): " FIREBASE_MEASUREMENT_ID

# シークレットを作成または更新する関数
create_or_update_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if gcloud secrets describe "$secret_name" >/dev/null 2>&1; then
        echo "Updating existing secret: $secret_name"
        echo -n "$secret_value" | gcloud secrets versions add "$secret_name" --data-file=-
    else
        echo "Creating new secret: $secret_name"
        echo -n "$secret_value" | gcloud secrets create "$secret_name" --data-file=-
    fi
}

# Secret Managerでシークレットを作成または更新
echo "Creating/updating secrets in Google Cloud Secret Manager..."

create_or_update_secret "firebase-api-key" "$FIREBASE_API_KEY"
create_or_update_secret "firebase-auth-domain" "$FIREBASE_AUTH_DOMAIN"
create_or_update_secret "firebase-project-id" "$FIREBASE_PROJECT_ID"
create_or_update_secret "firebase-storage-bucket" "$FIREBASE_STORAGE_BUCKET"
create_or_update_secret "firebase-messaging-sender-id" "$FIREBASE_MESSAGING_SENDER_ID"
create_or_update_secret "firebase-app-id" "$FIREBASE_APP_ID"

if [ -n "$FIREBASE_MEASUREMENT_ID" ]; then
    create_or_update_secret "firebase-measurement-id" "$FIREBASE_MEASUREMENT_ID"
fi

# 注意: Firebase Admin SDKサービスアカウントはsetup-firebase-auth-secrets.shで処理されます

# Cloud Runサービスアカウントにアクセス権限を付与
SERVICE_ACCOUNT_EMAIL="interrogation-app@${PROJECT_ID}.iam.gserviceaccount.com"

echo ""
echo "Granting Secret Manager access to Cloud Run service account..."
gcloud secrets add-iam-policy-binding firebase-api-key \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding firebase-auth-domain \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding firebase-project-id \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding firebase-storage-bucket \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding firebase-messaging-sender-id \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding firebase-app-id \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/secretmanager.secretAccessor"

if [ -n "$FIREBASE_MEASUREMENT_ID" ]; then
    gcloud secrets add-iam-policy-binding firebase-measurement-id \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="roles/secretmanager.secretAccessor"
fi

# 注意: Firebaseサービスアカウントの権限はsetup-firebase-auth-secrets.shで処理されます

echo ""
echo "✅ Secrets setup completed!"
echo ""
echo "Created secrets:"
echo "- firebase-api-key"
echo "- firebase-auth-domain"
echo "- firebase-project-id"
echo "- firebase-storage-bucket"
echo "- firebase-messaging-sender-id"
echo "- firebase-app-id"
if [ -n "$FIREBASE_MEASUREMENT_ID" ]; then
    echo "- firebase-measurement-id"
fi
# firebase-service-accountはsetup-firebase-auth-secrets.shで作成されます
echo ""
echo "Next steps:"
echo "1. Setup Firebase Admin SDK authentication: ./infra/setup-firebase-auth-secrets.sh"
echo "2. Setup Cloud Build permissions: ./infra/setup-cloudbuild-permissions.sh"
echo "3. Update your local development environment with .env.local"
echo "4. Deploy your application with: gcloud builds submit --config=infra/cloudbuild-frontend.yml"