import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getSecret } from './secret-manager';

// Firebase Admin SDK with enhanced Secret Manager support
async function initializeAdminSDK() {
  if (!getApps().length) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'interrogation-room';
    
    try {
      // 1. Try Secret Manager for complete service account JSON (Most Secure)
      try {
        console.log('Attempting to initialize Firebase Admin with Secret Manager (JSON)');
        const serviceAccountJson = await getSecret('firebase-service-account');
        const serviceAccount = JSON.parse(serviceAccountJson);
        
        return initializeApp({
          credential: cert(serviceAccount),
        });
      } catch (secretError) {
        console.log('Complete service account JSON not found in Secret Manager');
      }

      // 2. Try Secret Manager for individual credentials
      try {
        console.log('Attempting to initialize Firebase Admin with Secret Manager (individual)');
        const [clientEmail, privateKey] = await Promise.all([
          getSecret('firebase-client-email'),
          getSecret('firebase-private-key')
        ]);
        
        return initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
      } catch (secretError) {
        console.log('Individual Firebase credentials not found in Secret Manager');
      }
      
      // 3. Try environment variables (Development/Legacy)
      if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        console.log('Initializing Firebase Admin with environment variables');
        return initializeApp({
          credential: cert({
            projectId,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });
      }
      
      // 4. Cloud Run environment with Application Default Credentials
      console.log('Initializing Firebase Admin with Application Default Credentials');
      return initializeApp({
        projectId,
      });
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
      throw error;
    }
  }
  return getApps()[0];
}

// Synchronous version for immediate initialization
function initializeAdminSDKSync() {
  if (!getApps().length) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'interrogation-room';
    
    try {
      // Environment variables (sync only)
      if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        return initializeApp({
          credential: cert({
            projectId,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });
      }
      
      // Application Default Credentials
      return initializeApp({
        projectId,
      });
    } catch (error) {
      console.error('Firebase admin sync initialization error:', error);
      // Fallback
      return initializeApp({
        projectId,
      });
    }
  }
  return getApps()[0];
}

// Enhanced initialization with secret management
export async function getFirebaseAdmin() {
  return await initializeAdminSDK();
}

export async function getFirebaseAuth() {
  const app = await initializeAdminSDK();
  return getAuth(app);
}

// Backward compatibility exports
export const adminApp = initializeAdminSDKSync();
export const adminAuth = getAuth(adminApp);