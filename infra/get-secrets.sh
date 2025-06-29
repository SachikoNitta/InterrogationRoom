#!/bin/bash

# プロジェクトIDを取得
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "Error: No project ID found. Please set your project with 'gcloud config set project YOUR_PROJECT_ID'"
    exit 1
fi

echo "Retrieving secrets from Google Cloud Secret Manager for project: $PROJECT_ID"

# シークレット値を取得する関数
get_secret() {
    local secret_name=$1
    gcloud secrets versions access latest --secret="$secret_name" 2>/dev/null
}

# すべてのFirebase設定シークレットを取得
FIREBASE_API_KEY=$(get_secret "firebase-api-key")
FIREBASE_AUTH_DOMAIN=$(get_secret "firebase-auth-domain")
FIREBASE_PROJECT_ID=$(get_secret "firebase-project-id")
FIREBASE_STORAGE_BUCKET=$(get_secret "firebase-storage-bucket")
FIREBASE_MESSAGING_SENDER_ID=$(get_secret "firebase-messaging-sender-id")
FIREBASE_APP_ID=$(get_secret "firebase-app-id")
FIREBASE_MEASUREMENT_ID=$(get_secret "firebase-measurement-id")

# 必要なシークレットが存在するかチェック
if [ -z "$FIREBASE_API_KEY" ] || [ -z "$FIREBASE_AUTH_DOMAIN" ] || [ -z "$FIREBASE_PROJECT_ID" ]; then
    echo "Error: Missing required Firebase secrets. Please run ./infra/setup-secrets.sh first."
    exit 1
fi

# Cloud Runデプロイメント用の環境変数を生成
cat > /tmp/env-vars.txt << EOF
NEXT_PUBLIC_FIREBASE_API_KEY=${FIREBASE_API_KEY}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID}
NEXT_PUBLIC_FIREBASE_APP_ID=${FIREBASE_APP_ID}
EOF

if [ -n "$FIREBASE_MEASUREMENT_ID" ]; then
    echo "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${FIREBASE_MEASUREMENT_ID}" >> /tmp/env-vars.txt
fi

echo "Environment variables prepared for deployment."
echo "File created: /tmp/env-vars.txt"