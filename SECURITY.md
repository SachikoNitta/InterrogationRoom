# Security Configuration Guide

## 🔒 Secret Management

This project uses Google Cloud Secret Manager for secure secret storage and management.

### Production Secrets

All production secrets are stored in Google Cloud Secret Manager:
- `firebase-api-key` - Firebase API key
- `firebase-auth-domain` - Firebase auth domain
- `firebase-project-id` - Firebase project ID
- `firebase-storage-bucket` - Firebase storage bucket
- `firebase-messaging-sender-id` - Firebase messaging sender ID
- `firebase-app-id` - Firebase app ID
- `firebase-measurement-id` - Firebase measurement ID (optional)
- `firebase-service-account` - Firebase Admin SDK service account JSON

### Setup Instructions

#### 1. Initial Setup

```bash
# Setup service account with proper permissions
./infra/setup-service-account.sh

# Store secrets in Google Cloud Secret Manager
./infra/setup-secrets.sh
```

#### 2. Local Development

1. Copy the environment template:
   ```bash
   cp app/.env.example app/.env.local
   ```

2. Fill in your Firebase configuration values from Firebase Console
3. Never commit `.env.local` to version control

#### 3. Deployment

Secrets are automatically retrieved from Secret Manager during deployment:
```bash
gcloud builds submit --config=infra/cloudbuild-frontend.yml
```

### Security Best Practices

#### ✅ Do
- Store all secrets in Google Cloud Secret Manager for production
- Use environment variables for local development
- Rotate API keys regularly
- Monitor secret access logs
- Use dedicated service accounts with minimal permissions

#### ❌ Don't
- Hardcode secrets in source code
- Commit environment files to git
- Share API keys via insecure channels
- Use production secrets in development
- Log secret values

### Secret Rotation

To rotate secrets:

1. Generate new keys in Firebase Console
2. Update secrets in Secret Manager:
   ```bash
   echo -n "new-api-key" | gcloud secrets versions add firebase-api-key --data-file=-
   ```
3. Redeploy the application

### Monitoring

Monitor secret access in Google Cloud Console:
- Secret Manager > [Secret Name] > Versions
- Cloud Logging for access patterns
- Set up alerts for unusual access

### Environment Variables Reference

| Variable | Description | Required | Source |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | ✅ | Secret Manager / .env |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ | Secret Manager / .env |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ | Secret Manager / .env |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | ✅ | Secret Manager / .env |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | ✅ | Secret Manager / .env |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | ✅ | Secret Manager / .env |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID | ❌ | Secret Manager / .env |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID | ✅ | Cloud Run |
| `GOOGLE_CLOUD_LOCATION` | GCP region | ✅ | Cloud Run |
| `FIREBASE_CLIENT_EMAIL` | Service account email | ❌ | Secret Manager |
| `FIREBASE_PRIVATE_KEY` | Service account private key | ❌ | Secret Manager |

### Troubleshooting

#### Missing Environment Variables Error
```
Error: Missing required Firebase environment variables: NEXT_PUBLIC_FIREBASE_API_KEY
```
**Solution**: Ensure secrets are stored in Secret Manager and deployment script can access them.

#### Firebase Admin SDK Authentication Error
**Solution**: Verify service account has proper IAM roles and Secret Manager access.

#### Build Failure with Secrets
**Solution**: Check Cloud Build service account has `secretmanager.secretAccessor` role.

For more information, see the [Google Cloud Secret Manager documentation](https://cloud.google.com/secret-manager/docs).