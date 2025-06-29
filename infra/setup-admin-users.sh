#!/bin/bash

# 管理者ユーザーをSecret Managerに設定するスクリプト

# プロジェクトIDを取得
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "エラー: プロジェクトIDが見つかりません。'gcloud config set project YOUR_PROJECT_ID'でプロジェクトを設定してください"
    exit 1
fi

echo "管理者ユーザーをSecret Managerに設定中: $PROJECT_ID"

# Secret Manager APIを有効化
echo "Secret Manager APIを有効化中..."
gcloud services enable secretmanager.googleapis.com

# 管理者メールアドレスの入力を求める
echo ""
echo "管理者として設定するメールアドレスを入力してください。"
echo "複数のメールアドレスはカンマ区切りで入力できます。"
echo "例: admin@example.com,manager@example.com"
echo ""
read -p "管理者メールアドレス: " ADMIN_EMAILS

if [ -z "$ADMIN_EMAILS" ]; then
    echo "エラー: メールアドレスが入力されていません。"
    exit 1
fi

# シークレットを作成または更新する関数
create_or_update_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if gcloud secrets describe "$secret_name" >/dev/null 2>&1; then
        echo "既存のシークレットを更新中: $secret_name"
        echo -n "$secret_value" | gcloud secrets versions add "$secret_name" --data-file=-
    else
        echo "新しいシークレットを作成中: $secret_name"
        echo -n "$secret_value" | gcloud secrets create "$secret_name" --data-file=-
    fi
}

# 管理者メールアドレスをSecret Managerに保存
create_or_update_secret "admin-emails" "$ADMIN_EMAILS"

# Cloud Runサービスアカウントにアクセス権限を付与
SERVICE_ACCOUNT_EMAIL="interrogation-app@${PROJECT_ID}.iam.gserviceaccount.com"

echo ""
echo "Cloud Runサービスアカウントにアクセス権限を付与中..."
gcloud secrets add-iam-policy-binding admin-emails \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/secretmanager.secretAccessor"

# Cloud Buildサービスアカウントにもアクセス権限を付与（デプロイ時に必要）
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding admin-emails \
    --member="serviceAccount:$CLOUDBUILD_SA" \
    --role="roles/secretmanager.secretAccessor" >/dev/null 2>&1

gcloud secrets add-iam-policy-binding admin-emails \
    --member="serviceAccount:$COMPUTE_SA" \
    --role="roles/secretmanager.secretAccessor" >/dev/null 2>&1

echo ""
echo "✅ 管理者ユーザーの設定が完了しました！"
echo ""
echo "設定された管理者メールアドレス:"
echo "$ADMIN_EMAILS"
echo ""
echo "次のステップ:"
echo "1. アプリケーションをデプロイして設定を反映: gcloud builds submit --config=infra/cloudbuild-frontend.yml"
echo "2. 管理者ユーザーでログインして /admin ページにアクセス"
echo ""
echo "注意: 新しい管理者権限は、ユーザーが次回ログインした時に有効になります。"