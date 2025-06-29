#!/bin/bash

# プロジェクトIDを取得
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "Error: No project ID found. Please set your project with 'gcloud config set project YOUR_PROJECT_ID'"
    exit 1
fi

echo "Setting up Firebase authentication secrets for project: $PROJECT_ID"

# Secret Manager APIを有効化
echo "Enabling Secret Manager API..."
gcloud services enable secretmanager.googleapis.com

echo ""
echo "Choose how to store Firebase Admin SDK credentials:"
echo "1. Store complete service account JSON file (Recommended)"
echo "2. Store individual credentials (client email and private key)"
echo "3. Skip - use Application Default Credentials"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "=== Option 1: Complete Service Account JSON ==="
        echo "1. Go to Firebase Console → Project Settings → Service Accounts"
        echo "2. Click 'Generate new private key'"
        echo "3. Download the JSON file"
        echo ""
        read -p "Enter the path to your service account JSON file: " json_path
        
        if [ -f "$json_path" ]; then
            # JSONを検証
            if jq empty "$json_path" 2>/dev/null; then
                gcloud secrets create firebase-service-account --data-file="$json_path"
                echo "✅ Firebase service account JSON stored in Secret Manager"
            else
                echo "❌ Invalid JSON file. Please check the file format."
                exit 1
            fi
        else
            echo "❌ File not found: $json_path"
            exit 1
        fi
        ;;
    
    2)
        echo ""
        echo "=== Option 2: Individual Credentials ==="
        echo "1. Go to Firebase Console → Project Settings → Service Accounts"
        echo "2. Click 'Generate new private key' and download the JSON"
        echo "3. Extract the client_email and private_key from the JSON"
        echo ""
        
        read -p "Enter Firebase client email: " client_email
        echo "Enter Firebase private key (paste the entire key including BEGIN/END lines):"
        echo "Press Ctrl+D when finished:"
        private_key=$(cat)
        
        if [ -n "$client_email" ] && [ -n "$private_key" ]; then
            echo -n "$client_email" | gcloud secrets create firebase-client-email --data-file=-
            echo -n "$private_key" | gcloud secrets create firebase-private-key --data-file=-
            echo "✅ Firebase individual credentials stored in Secret Manager"
        else
            echo "❌ Missing credentials. Please provide both client email and private key."
            exit 1
        fi
        ;;
    
    3)
        echo ""
        echo "=== Option 3: Application Default Credentials ==="
        echo "Using Cloud Run's built-in service account authentication."
        echo "No additional secrets needed."
        ;;
    
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

# Cloud Runサービスアカウントにアクセス権限を付与
SERVICE_ACCOUNT_EMAIL="interrogation-app@${PROJECT_ID}.iam.gserviceaccount.com"

echo ""
echo "Granting Secret Manager access to Cloud Run service account..."

if [ "$choice" = "1" ]; then
    gcloud secrets add-iam-policy-binding firebase-service-account \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="roles/secretmanager.secretAccessor"
elif [ "$choice" = "2" ]; then
    gcloud secrets add-iam-policy-binding firebase-client-email \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="roles/secretmanager.secretAccessor"
    
    gcloud secrets add-iam-policy-binding firebase-private-key \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="roles/secretmanager.secretAccessor"
fi

echo ""
echo "✅ Firebase authentication secrets setup completed!"

if [ "$choice" != "3" ]; then
    echo ""
    echo "Your Firebase Admin SDK will now authenticate using Secret Manager."
    echo "The authentication priority is:"
    echo "1. Secret Manager (what you just configured)"
    echo "2. Environment variables (fallback)"
    echo "3. Application Default Credentials (final fallback)"
fi

echo ""
echo "To test the setup, deploy your application:"
echo "gcloud builds submit --config=infra/cloudbuild-frontend.yml"