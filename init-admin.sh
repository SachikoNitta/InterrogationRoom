#!/bin/bash

# 管理者ユーザーを初期化するスクリプト
# Secret Managerから管理者メールアドレスを読み込み、Firebase Custom Claimsを設定

PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "エラー: プロジェクトIDが見つかりません。'gcloud config set project YOUR_PROJECT_ID'でプロジェクトを設定してください"
    exit 1
fi

# デプロイされたアプリケーションのURL
APP_URL="https://interrogation-app-488803469381.asia-northeast1.run.app"

# 管理者初期化トークン（シンプルなセキュリティ）
INIT_TOKEN=${ADMIN_INIT_TOKEN:-"init-admin-2024"}

echo "🚀 管理者ユーザーを初期化中..."
echo "プロジェクト: $PROJECT_ID"
echo "アプリケーションURL: $APP_URL"

# 管理者初期化APIを呼び出し
response=$(curl -s -X POST "$APP_URL/api/admin/init" \
  -H "Content-Type: application/json" \
  -H "x-admin-init-token: $INIT_TOKEN" \
  -w "\n%{http_code}")

# レスポンスとステータスコードを分離
http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo "✅ 管理者ユーザーの初期化が完了しました！"
    echo "レスポンス: $response_body"
else
    echo "❌ 管理者ユーザーの初期化に失敗しました。"
    echo "HTTPステータス: $http_code"
    echo "レスポンス: $response_body"
    echo ""
    echo "トラブルシューティング:"
    echo "1. アプリケーションがデプロイされていることを確認"
    echo "2. Secret Managerに 'admin-emails' が設定されていることを確認"
    echo "3. アプリケーションログを確認: gcloud logs read --limit=50 --filter='resource.type=cloud_run_revision'"
fi