# Infrastructure Setup Guide

This guide covers setting up the Google Cloud infrastructure for the Interrogation Room application.

## 📁 Infrastructure Files Overview

The `/infra` directory contains all infrastructure setup and deployment scripts:

### 🏗️ **Setup Scripts (Run Once)**

| File | Purpose | When to Run | Required |
|------|---------|-------------|----------|
| `setup-service-account.sh` | Creates `interrogation-app` service account with proper IAM permissions | **First-time setup only** | ✅ Required |
| `setup-secrets.sh` | Stores Firebase configuration in Google Cloud Secret Manager | **First-time setup only** | ✅ Required |
| `setup-cloudbuild-permissions.sh` | Grants Cloud Build service account access to Secret Manager | **First-time setup only** | ✅ Required |
| `setup-firebase-auth-secrets.sh` | Interactive setup for Firebase Admin SDK credentials in Secret Manager | **First-time setup only** | ✅ Required |

### 🚀 **Deployment Files (Use Every Deploy)**

| File | Purpose | When to Run | Required |
|------|---------|-------------|----------|
| `cloudbuild-frontend.yml` | Main deployment configuration - builds and deploys to Cloud Run | **Every deployment** | ✅ Required |

### 🔧 **Utility Scripts**

| File | Purpose | When to Run | Required |
|------|---------|-------------|----------|
| `get-secrets.sh` | Retrieves secrets for debugging (creates `/tmp/env-vars.txt`) | **Optional - debugging only** | ❌ Optional |

---

## 🎯 Initial Setup Workflow

### Prerequisites

1. **Google Cloud Project** with billing enabled
2. **gcloud CLI** installed and authenticated
3. **Firebase project** created (can be the same as GCP project)

```bash
# Verify gcloud setup
gcloud auth list
gcloud config get-value project
```

### Step 1: Service Account Setup

Creates the `interrogation-app@PROJECT_ID.iam.gserviceaccount.com` service account with required permissions:

```bash
./infra/setup-service-account.sh
```

**What it does:**
- Creates service account for the application
- Grants Firebase Admin SDK permissions (`roles/firebase.admin`)
- Grants Firestore access (`roles/datastore.user`)
- Grants Vertex AI access (`roles/aiplatform.user`)
- Grants Secret Manager access (`roles/secretmanager.secretAccessor`)

### Step 2: Secret Management Setup

Stores Firebase configuration securely in Google Cloud Secret Manager:

```bash
./infra/setup-secrets.sh
```

**What it does:**
- Enables Secret Manager API
- Prompts for Firebase configuration values
- Creates secrets for each Firebase config parameter:
  - `firebase-api-key`
  - `firebase-auth-domain`
  - `firebase-project-id`
  - `firebase-storage-bucket`
  - `firebase-messaging-sender-id`
  - `firebase-app-id`
  - `firebase-measurement-id` (optional)
  - `firebase-service-account` (for Admin SDK)

**Required Information:**
Get these values from [Firebase Console](https://console.firebase.google.com/) → Project Settings → General → Web apps:
- Firebase API Key
- Auth Domain (e.g., `your-project.firebaseapp.com`)
- Project ID
- Storage Bucket (e.g., `your-project.firebasestorage.app`)
- Messaging Sender ID
- App ID
- Measurement ID (optional, for Analytics)

### Step 3: Firebase Authentication Setup

Setup Firebase Admin SDK authentication using Secret Manager:

```bash
./infra/setup-firebase-auth-secrets.sh
```

**What it does:**
- Provides interactive setup for Firebase Admin SDK credentials
- Offers three authentication options:
  1. Complete service account JSON (recommended)
  2. Individual credentials (client email + private key)
  3. Application Default Credentials
- Stores credentials securely in Secret Manager
- Grants proper access permissions

### Step 4: Cloud Build Permissions

Grants Cloud Build service account access to retrieve secrets during deployment:

```bash
./infra/setup-cloudbuild-permissions.sh
```

**What it does:**
- Identifies the correct Cloud Build service account (`PROJECT_NUMBER@cloudbuild.gserviceaccount.com`)
- Grants Secret Manager access (`roles/secretmanager.secretAccessor`)

---

## 🚀 Deployment Workflow

### Every Deployment

Once setup is complete, deploy your application:

```bash
gcloud builds submit --config=infra/cloudbuild-frontend.yml
```

**What it does:**
1. **Retrieves secrets** from Google Cloud Secret Manager
2. **Builds Docker image** with Firebase configuration as build arguments
3. **Pushes image** to Google Container Registry
4. **Deploys to Cloud Run** with the `interrogation-app` service account

### Deployment Configuration

The `cloudbuild-frontend.yml` file:
- Uses secure secret injection from Secret Manager
- Builds Next.js app with proper environment variables
- Deploys to Cloud Run with optimal settings:
  - **Memory**: 2Gi
  - **CPU**: 1
  - **Timeout**: 300 seconds
  - **Concurrency**: 1000
  - **Max instances**: 10

---

## 🔧 Troubleshooting

### Common Issues

#### Permission Denied Errors
```
PERMISSION_DENIED: Permission 'secretmanager.versions.access' denied
```
**Solution**: Run `./infra/setup-cloudbuild-permissions.sh`

#### Service Account Not Found
```
Service account interrogation-app@PROJECT_ID.iam.gserviceaccount.com does not exist
```
**Solution**: Run `./infra/setup-service-account.sh`

#### Missing Secrets
```
ERROR: (gcloud.secrets.versions.access) NOT_FOUND: Secret not found
```
**Solution**: Run `./infra/setup-secrets.sh`

#### TypeScript Build Errors
**Solution**: Ensure all environment variables are properly set in secrets

### Verification Commands

```bash
# Check service account exists
gcloud iam service-accounts list --filter="email:interrogation-app@*"

# Check secrets exist
gcloud secrets list --filter="name:firebase-"

# Check Cloud Build permissions
gcloud projects get-iam-policy $(gcloud config get-value project) \
  --filter="bindings.members:*@cloudbuild.gserviceaccount.com"

# Check deployment status
gcloud run services list --filter="metadata.name:interrogation-app"
```

---

## 🔒 Security Notes

1. **Secrets are never stored in code** - All sensitive data is in Secret Manager
2. **Service accounts have minimal permissions** - Following principle of least privilege
3. **Build-time secret injection** - Secrets are only available during build, not in final image
4. **Automatic credential rotation** - Update secrets in Secret Manager, redeploy to apply

---

## 📋 Quick Reference

### First Time Setup (Run Once)
```bash
./infra/setup-service-account.sh
./infra/setup-secrets.sh
./infra/setup-firebase-auth-secrets.sh
./infra/setup-cloudbuild-permissions.sh
```

### Every Deployment
```bash
gcloud builds submit --config=infra/cloudbuild-frontend.yml
```

### Secret Updates
```bash
# Update a secret
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-

# Then redeploy
gcloud builds submit --config=infra/cloudbuild-frontend.yml
```

---

## 🆘 Support

If you encounter issues:

1. **Check the logs**: [Cloud Build Console](https://console.cloud.google.com/cloud-build)
2. **Verify permissions**: Use verification commands above
3. **Re-run setup scripts**: All scripts are idempotent and safe to re-run
4. **Check Firebase configuration**: Ensure all required fields are set in Firebase Console