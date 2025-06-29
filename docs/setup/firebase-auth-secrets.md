# Firebase Authentication Secrets in Secret Manager

This guide covers managing Firebase Admin SDK authentication credentials using Google Cloud Secret Manager for enhanced security.

## 🔐 **Why Use Secret Manager for Firebase Auth?**

- **Security**: Credentials are encrypted and access is audited
- **Rotation**: Easy to rotate credentials without code changes
- **Separation**: No credentials in code or environment variables
- **Compliance**: Meets enterprise security requirements

---

## 🎯 **Authentication Priority**

Your application uses this authentication priority:

1. **Secret Manager** (Most Secure)
   - Complete service account JSON
   - Individual credentials (client email + private key)

2. **Environment Variables** (Development/Fallback)
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

3. **Application Default Credentials** (Cloud Run Default)
   - Uses Cloud Run's built-in service account

---

## 🛠️ **Setup Options**

### **Option 1: Complete Service Account JSON (Recommended)**

Store the entire Firebase service account JSON file in Secret Manager:

```bash
# Run the setup script
./infra/setup-firebase-auth-secrets.sh

# Or manually:
# 1. Download service account JSON from Firebase Console
# 2. Store in Secret Manager
gcloud secrets create firebase-service-account \
  --data-file=path/to/serviceAccountKey.json

# 3. Grant access to your service account
gcloud secrets add-iam-policy-binding firebase-service-account \
  --member="serviceAccount:interrogation-app@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

**How it works:**
```typescript
// Your app automatically loads from Secret Manager
const serviceAccountJson = await getSecret('firebase-service-account');
const serviceAccount = JSON.parse(serviceAccountJson);
```

### **Option 2: Individual Credentials**

Store client email and private key separately:

```bash
# Store client email
echo -n "your-service-account@project.iam.gserviceaccount.com" | \
  gcloud secrets create firebase-client-email --data-file=-

# Store private key
echo -n "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n" | \
  gcloud secrets create firebase-private-key --data-file=-

# Grant access
gcloud secrets add-iam-policy-binding firebase-client-email \
  --member="serviceAccount:interrogation-app@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding firebase-private-key \
  --member="serviceAccount:interrogation-app@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### **Option 3: Application Default Credentials (Simplest)**

Use Cloud Run's built-in authentication (no additional setup required):

```bash
# Your service account needs Firebase Admin permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:interrogation-app@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"
```

---

## 📋 **Getting Firebase Service Account**

### **Step 1: Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Go to **Service Accounts** tab
5. Click **Generate new private key**
6. Download the JSON file

### **Step 2: Store in Secret Manager**

```bash
# Option A: Use the setup script (interactive)
./infra/setup-firebase-auth-secrets.sh

# Option B: Manual command
gcloud secrets create firebase-service-account \
  --data-file=/path/to/downloaded-service-account.json
```

---

## 🔍 **Verification**

### **Check Secrets Exist**

```bash
# List Firebase-related secrets
gcloud secrets list --filter="name:firebase"

# Check specific secret exists
gcloud secrets describe firebase-service-account
```

### **Test Secret Access**

```bash
# Test that your service account can access the secret
gcloud secrets versions access latest --secret="firebase-service-account" \
  --impersonate-service-account="interrogation-app@PROJECT_ID.iam.gserviceaccount.com"
```

### **Verify in Application**

Check your application logs for initialization messages:

```bash
# View Cloud Run logs
gcloud logs read "projects/PROJECT_ID/logs/run.googleapis.com" \
  --filter="textPayload:Firebase" --limit=10
```

You should see:
```
Attempting to initialize Firebase Admin with Secret Manager (JSON)
```

---

## 🔄 **Secret Rotation**

### **Rotate Service Account Key**

1. **Generate new key** in Firebase Console
2. **Update Secret Manager**:
   ```bash
   gcloud secrets versions add firebase-service-account \
     --data-file=new-service-account.json
   ```
3. **Deploy application** to use new key:
   ```bash
   gcloud builds submit --config=infra/cloudbuild-frontend.yml
   ```

### **Disable Old Key**

1. Go to Firebase Console → Service Accounts
2. Delete the old private key
3. Keep only the current key active

---

## 🛡️ **Security Best Practices**

### **Access Control**

```bash
# Only grant access to necessary service accounts
gcloud secrets add-iam-policy-binding firebase-service-account \
  --member="serviceAccount:interrogation-app@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Remove unnecessary access
gcloud secrets remove-iam-policy-binding firebase-service-account \
  --member="user:developer@example.com" \
  --role="roles/secretmanager.secretAccessor"
```

### **Audit Access**

```bash
# View secret access logs
gcloud logs read "projects/PROJECT_ID/logs/cloudaudit.googleapis.com" \
  --filter="resource.type=secret_manager_secret AND protoPayload.resourceName:firebase-service-account"
```

### **Monitor Usage**

Set up alerts for secret access:

```bash
# Create notification channel (email)
gcloud alpha monitoring channels create \
  --display-name="Secret Access Alert" \
  --type=email \
  --channel-labels=email_address=admin@yourcompany.com

# Create alert policy for secret access
gcloud alpha monitoring policies create \
  --policy-from-file=secret-access-alert.yaml
```

---

## 🆘 **Troubleshooting**

### **Permission Denied Errors**

```
Error: Permission denied accessing secret
```

**Solutions:**
1. Verify service account has `secretmanager.secretAccessor` role
2. Check secret exists: `gcloud secrets describe firebase-service-account`
3. Ensure correct project context

### **Invalid Credentials**

```
Error: Firebase admin initialization failed
```

**Solutions:**
1. Verify JSON format: `jq . service-account.json`
2. Check client email format
3. Verify private key includes BEGIN/END markers

### **Fallback to Environment Variables**

If you see this log message:
```
Initializing Firebase Admin with environment variables
```

It means Secret Manager isn't being used. Check:
1. Secret exists and has correct name
2. Service account has access
3. Secret Manager API is enabled

---

## 📊 **Current Status Check**

Run this script to check your current Firebase auth setup:

```bash
#!/bin/bash
PROJECT_ID=$(gcloud config get-value project)
SERVICE_ACCOUNT="interrogation-app@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🔍 Firebase Authentication Setup Status"
echo "======================================"

# Check if secrets exist
echo "📦 Secret Manager Status:"
if gcloud secrets describe firebase-service-account >/dev/null 2>&1; then
    echo "  ✅ firebase-service-account exists"
else
    echo "  ❌ firebase-service-account missing"
fi

# Check permissions
echo "🔐 Permissions Status:"
if gcloud secrets get-iam-policy firebase-service-account --flatten="bindings[].members[]" --filter="bindings.role:roles/secretmanager.secretAccessor" --format="value(bindings.members)" | grep -q "$SERVICE_ACCOUNT"; then
    echo "  ✅ Service account has access to secrets"
else
    echo "  ❌ Service account missing secret access"
fi

# Check service account exists
echo "👤 Service Account Status:"
if gcloud iam service-accounts describe "$SERVICE_ACCOUNT" >/dev/null 2>&1; then
    echo "  ✅ interrogation-app service account exists"
else
    echo "  ❌ interrogation-app service account missing"
fi

echo ""
echo "Next steps:"
echo "- Missing items: Run ./infra/setup-firebase-auth-secrets.sh"
echo "- Deploy: gcloud builds submit --config=infra/cloudbuild-frontend.yml"
```

---

## ✅ **Quick Setup Checklist**

- [ ] **Service account created** (`./infra/setup-service-account.sh`)
- [ ] **Firebase project configured** with authentication enabled
- [ ] **Service account JSON downloaded** from Firebase Console
- [ ] **Secret stored in Secret Manager** (`./infra/setup-firebase-auth-secrets.sh`)
- [ ] **Permissions granted** to Cloud Run service account
- [ ] **Application deployed** and tested

Your Firebase authentication is now fully managed through Secret Manager! 🎉