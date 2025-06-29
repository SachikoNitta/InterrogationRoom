import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getSecret } from './secret-manager';

// Firebase Admin SDK (Server-side only)
async function initializeAdminSDK() {
  if (!getApps().length) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'interrogation-room';
    
    try {
      // 1. 環境変数から認証情報を取得を試行
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
      
      // 2. Secret Managerから認証情報を取得を試行
      try {
        console.log('Attempting to initialize Firebase Admin with Secret Manager');
        const serviceAccountJson = await getSecret('firebase-service-account');
        const serviceAccount = JSON.parse(serviceAccountJson);
        
        return initializeApp({
          credential: cert(serviceAccount),
        });
      } catch (secretError) {
        console.log('Secret Manager not available:', secretError);
      }
      
      // 3. Cloud Run環境では自動的に認証される (Application Default Credentials)
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

// 同期的に初期化する関数
function initializeAdminSDKSync() {
  if (!getApps().length) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'interrogation-room';
    
    try {
      // 環境変数から認証情報を取得
      if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        return initializeApp({
          credential: cert({
            projectId,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });
      }
      
      // Cloud Run環境では自動的に認証される
      return initializeApp({
        projectId,
      });
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
      // フォールバック: 最小限の設定で初期化
      return initializeApp({
        projectId,
      });
    }
  }
  return getApps()[0];
}

export const adminApp = initializeAdminSDKSync();
export const adminAuth = getAuth(adminApp);
