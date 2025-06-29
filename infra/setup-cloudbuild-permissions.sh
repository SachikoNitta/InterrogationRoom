#!/bin/bash

# プロジェクトIDを取得
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "Error: No project ID found. Please set your project with 'gcloud config set project YOUR_PROJECT_ID'"
    exit 1
fi

echo "Setting up Cloud Build permissions for project: $PROJECT_ID"

# プロジェクト番号を取得（Cloud Buildサービスアカウントに必要）
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
if [ -z "$PROJECT_NUMBER" ]; then
    echo "Error: Could not get project number for $PROJECT_ID"
    exit 1
fi

# Cloud Buildサービスアカウント
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Cloud Build service account: $CLOUDBUILD_SA"
echo "Compute service account: $COMPUTE_SA"

# Cloud BuildサービスアカウントにSecret Managerアクセスを付与（プロジェクトレベル）
echo "Granting Secret Manager permissions to Cloud Build..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$CLOUDBUILD_SA" \
    --role="roles/secretmanager.secretAccessor"

# コンピュートサービスアカウントに個別のFirebaseシークレットへのアクセスを付与
echo "Granting Firebase secret access to compute service account..."
for secret in firebase-api-key firebase-auth-domain firebase-project-id firebase-storage-bucket firebase-messaging-sender-id firebase-app-id firebase-measurement-id; do
  echo "  - Granting access to secret: $secret"
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:$COMPUTE_SA" \
    --role="roles/secretmanager.secretAccessor" >/dev/null 2>&1
done

echo "✅ Cloud Build permissions setup completed!"
echo ""
echo "Service accounts with Secret Manager access:"
echo "  - Cloud Build: $CLOUDBUILD_SA (project-level)"
echo "  - Compute: $COMPUTE_SA (Firebase secrets)"
echo ""
echo "You can now run: gcloud builds submit --config=infra/cloudbuild-frontend.yml"