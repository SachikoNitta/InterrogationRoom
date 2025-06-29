# Local Development Setup

## Prerequisites

- **Node.js 20+** (LTS recommended)
- **gcloud CLI** installed and authenticated
- **Firebase project** with authentication enabled
- **Google Cloud project** with required APIs enabled

---

## 1. Repository Setup

```bash
git clone <repository-url>
cd interrogation_room
```

---

## 2. Environment Configuration

### Copy Environment Template

```bash
cd app
cp .env.example .env.local
```

### Configure Firebase Settings

Edit `app/.env.local` with your Firebase configuration values:

```bash
# Get these from Firebase Console → Project Settings → General → Web apps
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=asia-northeast1

# Environment
NODE_ENV=development

# Optional: Firebase Admin SDK for server-side operations
# Get from Firebase Console → Project Settings → Service Accounts
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
```

### Where to Find Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Go to **General** tab
5. Scroll down to **Your apps** section
6. Click on your web app or create one
7. Copy the configuration values

---

## 3. Dependencies Installation

```bash
# Install Next.js dependencies
npm install
```

---

## 4. Google Cloud Authentication

### Option A: Application Default Credentials (Recommended)

```bash
# Authenticate with Google Cloud
gcloud auth application-default login

# Set your project
gcloud config set project your-project-id
```

### Option B: Service Account Key (Alternative)

1. Download service account key from Google Cloud Console
2. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
   ```

---

## 5. Database Setup

### Firestore

The application uses Firestore as the database. Make sure it's enabled:

```bash
# Enable Firestore API
gcloud services enable firestore.googleapis.com

# Create Firestore database (if not exists)
gcloud firestore databases create --region=asia-northeast1
```

---

## 6. Development Server

### Start the Development Server

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **API Routes**: http://localhost:3000/api/*

### Development Features

- **Hot Reload**: Changes are automatically reflected
- **TypeScript Checking**: Real-time type checking
- **ESLint**: Code quality checking
- **Next.js Fast Refresh**: Preserves component state during edits

---

## 7. Firebase Authentication Setup

### Enable Authentication Methods

1. Go to Firebase Console → Authentication
2. Click **Sign-in method** tab
3. Enable **Google** sign-in provider
4. Add your domain to authorized domains:
   - `localhost` (for development)
   - Your production domain

### Test Authentication

1. Start the development server
2. Navigate to http://localhost:3000/login
3. Try signing in with Google
4. Check that user data appears on dashboard

---

## 8. Useful Development Commands

```bash
# Development server with Turbopack (faster builds)
npm run dev

# Build for production (test locally)
npm run build

# Start production build locally
npm run start

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

---

## 9. Development Tools

### Recommended VS Code Extensions

- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Prettier - Code formatter**
- **ESLint**

### Browser Extensions

- **React Developer Tools**
- **Firebase Admin**

---

## 10. Testing

### Local API Testing

Test API endpoints using curl or Postman:

```bash
# Test authentication (requires valid Firebase ID token)
curl -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
     http://localhost:3000/api/auth/me

# Test public endpoints
curl http://localhost:3000/api/summaries
```

### Getting Firebase ID Token for Testing

```javascript
// In browser console after signing in
import { getAuth } from 'firebase/auth';
const auth = getAuth();
auth.currentUser.getIdToken().then(token => console.log(token));
```

---

## 🔧 Troubleshooting

### Common Issues

#### Firebase Configuration Errors
```
Error: Missing required Firebase environment variables
```
**Solution**: Ensure all `NEXT_PUBLIC_FIREBASE_*` variables are set in `.env.local`

#### Authentication Errors
```
Error: Invalid Authorization header
```
**Solution**: Check Firebase project configuration and user authentication status

#### Firestore Permission Errors
```
Error: Missing or insufficient permissions
```
**Solution**: Verify Firestore security rules and authentication

#### Build Errors
```
Type error: Property does not exist
```
**Solution**: Run `npm install` and check TypeScript configuration

### Debug Mode

Enable debug logging:

```bash
# Add to .env.local
DEBUG=true
NEXT_PUBLIC_DEBUG=true
```

### Reset Environment

If you encounter persistent issues:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Reset Next.js cache
rm -rf .next

# Restart development server
npm run dev
```

---

## 🚀 Ready for Development

Once setup is complete, you should be able to:

- ✅ Access the application at http://localhost:3000
- ✅ Sign in with Google authentication
- ✅ View the dashboard with case data
- ✅ Access API endpoints with authentication
- ✅ See real-time changes during development

Happy coding! 🎉

