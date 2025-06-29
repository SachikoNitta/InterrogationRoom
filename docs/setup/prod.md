# Production Deployment Guide

This guide covers deploying the Interrogation Room application to Google Cloud Platform production environment.

## Prerequisites

- **Google Cloud Project** with billing enabled
- **Firebase project** created (can be same as GCP project)
- **gcloud CLI** installed and authenticated
- **Domain name** (optional, for custom domain)

---

## 🚀 Quick Deployment

For those who just want to deploy quickly:

```bash
# 1. One-time infrastructure setup
./infra/setup-service-account.sh
./infra/setup-secrets.sh
./infra/setup-cloudbuild-permissions.sh

# 2. Deploy application
gcloud builds submit --config=infra/cloudbuild-frontend.yml
```

---

## 📋 Detailed Setup Process

### 1. Google Cloud Authentication

Verify your authentication and project setup:

```bash
# Check current project
gcloud config get-value project

# Switch project if needed
gcloud config set project YOUR_PROJECT_ID

# Authenticate
gcloud auth application-default login

# Verify authentication
gcloud auth list
```

### 2. Infrastructure Setup (One-time)

⚠️ **Important**: Use the new infrastructure scripts, not the legacy `setup.sh`

#### Step 2.1: Service Account Setup

```bash
./infra/setup-service-account.sh
```

**What this does:**
- Creates `interrogation-app@PROJECT_ID.iam.gserviceaccount.com`
- Grants Firebase Admin, Firestore, Vertex AI, and Secret Manager permissions

#### Step 2.2: Secret Management Setup

```bash
./infra/setup-secrets.sh
```

**Required information** (get from Firebase Console):
- Firebase API Key
- Auth Domain (e.g., `your-project.firebaseapp.com`)
- Project ID
- Storage Bucket
- Messaging Sender ID
- App ID
- Measurement ID (optional)
- Service Account JSON file path

#### Step 2.3: Cloud Build Permissions

```bash
./infra/setup-cloudbuild-permissions.sh
```

### 3. Firebase Configuration

#### 3.1: Enable Google Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Google** provider
5. Add authorized domains:
   - Your production domain
   - Cloud Run domain (if different)

#### 3.2: Create Web App (if not exists)

1. Go to **Project Settings** → **General**
2. Scroll to **Your apps**
3. Click **Add app** → **Web**
4. Register your app
5. Copy configuration values (used in secret setup)

### 4. Application Deployment

Deploy your application to Cloud Run:

```bash
gcloud builds submit --config=infra/cloudbuild-frontend.yml
```

**Deployment process:**
1. Retrieves secrets from Secret Manager
2. Builds Docker image with Firebase configuration
3. Pushes to Google Container Registry
4. Deploys to Cloud Run with secure configuration

### 5. Firestore Database Setup

#### 5.1: Create Database

```bash
# Create Firestore database in Native mode
gcloud firestore databases create --region=asia-northeast1
```

#### 5.2: Configure Security Rules

Update Firestore security rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /cases/{caseId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /summaries/{summaryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### 5.3: Create Indexes

Create composite indexes for optimal query performance:

```bash
# Create indexes via gcloud (or use Firestore Console)
gcloud firestore indexes composite create \
  --collection-group=cases \
  --field-config field-path=userId,order=ascending \
  --field-config field-path=summaryId,order=ascending

gcloud firestore indexes fields create \
  --collection-group=cases \
  --field-config field-path=userId,order=ascending
```

### 6. Domain Configuration (Optional)

#### 6.1: Custom Domain Setup

If using a custom domain:

```bash
# Map domain to Cloud Run service
gcloud run domain-mappings create \
  --service=interrogation-app \
  --domain=your-domain.com \
  --region=asia-northeast1
```

#### 6.2: Update Firebase Auth Domain

1. Go to Firebase Console → Authentication → Settings
2. Add your custom domain to **Authorized domains**

### 7. Monitoring and Logging

#### 7.1: Enable Cloud Logging

```bash
# Cloud Logging is enabled by default for Cloud Run
# View logs with:
gcloud logs tail "projects/PROJECT_ID/logs/run.googleapis.com"
```

#### 7.2: Set Up Error Reporting

```bash
# Enable Error Reporting API
gcloud services enable clouderrorreporting.googleapis.com
```

---

## 🔧 Post-Deployment Configuration

### Verify Deployment

1. **Check Cloud Run Service**:
   ```bash
   gcloud run services list --filter="metadata.name:interrogation-app"
   ```

2. **Test Application**:
   - Visit your Cloud Run URL
   - Test Google authentication
   - Verify API endpoints work

3. **Check Logs**:
   ```bash
   gcloud logs read "projects/PROJECT_ID/logs/run.googleapis.com" --limit=50
   ```

### Security Checklist

- [ ] **Service account has minimal permissions**
- [ ] **Secrets stored in Secret Manager**
- [ ] **Firestore security rules configured**
- [ ] **Authentication domains properly set**
- [ ] **Environment variables secure**
- [ ] **HTTPS enabled** (automatic with Cloud Run)

---

## 🔄 Regular Deployment

For subsequent deployments (after initial setup):

```bash
# Simply run the build and deploy
gcloud builds submit --config=infra/cloudbuild-frontend.yml
```

### Zero-Downtime Deployments

Cloud Run automatically handles zero-downtime deployments:
- Gradual traffic shifting to new revision
- Health checks ensure stability
- Automatic rollback on failure

---

## 📊 Monitoring and Maintenance

### Performance Monitoring

1. **Cloud Run Metrics**:
   - View in Google Cloud Console → Cloud Run → interrogation-app
   - Monitor request count, latency, error rate

2. **Firebase Analytics**:
   - Set up Firebase Analytics for user behavior tracking
   - Monitor authentication success rates

### Log Analysis

```bash
# View recent logs
gcloud logs read "projects/PROJECT_ID/logs/run.googleapis.com" --limit=100

# Filter error logs
gcloud logs read "projects/PROJECT_ID/logs/run.googleapis.com" \
  --filter="severity>=ERROR" --limit=50

# Real-time log streaming
gcloud logs tail "projects/PROJECT_ID/logs/run.googleapis.com"
```

### Cost Optimization

- **Auto-scaling**: Configure min/max instances based on usage
- **Resource limits**: Adjust CPU/memory based on actual usage
- **Request timeout**: Optimize timeout values
- **Monitoring**: Set up billing alerts

---

## 🆘 Troubleshooting

### Common Production Issues

#### Authentication Errors
```
Error: Firebase ID token verification failed
```
**Solutions**:
- Verify Firebase project configuration
- Check service account permissions
- Ensure secrets are properly set in Secret Manager

#### Permission Denied Errors
```
Error: Permission denied accessing Secret Manager
```
**Solutions**:
- Run `./infra/setup-cloudbuild-permissions.sh`
- Verify service account has `secretmanager.secretAccessor` role

#### Database Connection Issues
```
Error: Firestore connection failed
```
**Solutions**:
- Verify Firestore database exists and is in correct region
- Check IAM permissions for `datastore.user` role
- Review Firestore security rules

#### High Latency/Timeouts
**Solutions**:
- Increase Cloud Run memory allocation
- Optimize database queries
- Check regional deployment vs. user location

### Emergency Procedures

#### Rollback Deployment
```bash
# List revisions
gcloud run revisions list --service=interrogation-app --region=asia-northeast1

# Rollback to previous revision
gcloud run services update-traffic interrogation-app \
  --to-revisions=REVISION_NAME=100 \
  --region=asia-northeast1
```

#### Scale Down (Emergency)
```bash
# Scale down to 0 instances
gcloud run services update interrogation-app \
  --min-instances=0 \
  --max-instances=0 \
  --region=asia-northeast1
```

---

## 📈 Scaling Considerations

### High Traffic Preparation

```bash
# Optimize for high traffic
gcloud run services update interrogation-app \
  --min-instances=1 \
  --max-instances=100 \
  --concurrency=1000 \
  --cpu=2 \
  --memory=4Gi \
  --region=asia-northeast1
```

### Multi-Region Deployment

For global users, consider deploying to multiple regions:

```bash
# Deploy to additional regions
gcloud run deploy interrogation-app \
  --image=gcr.io/PROJECT_ID/next-app \
  --region=us-central1 \
  --service-account=interrogation-app@PROJECT_ID.iam.gserviceaccount.com
```

---

## ✅ Production Checklist

Before going live:

- [ ] **Infrastructure setup completed**
- [ ] **Secrets properly configured in Secret Manager**
- [ ] **Firebase authentication enabled and tested**
- [ ] **Firestore database created with security rules**
- [ ] **Application deployed and accessible**
- [ ] **Custom domain configured** (if applicable)
- [ ] **Monitoring and alerting set up**
- [ ] **Backup and disaster recovery plan**
- [ ] **Performance testing completed**
- [ ] **Security review completed**

Your production environment is now ready! 🎉