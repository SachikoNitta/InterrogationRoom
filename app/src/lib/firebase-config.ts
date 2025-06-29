import { getSecret } from './secret-manager';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

let cachedConfig: FirebaseConfig | null = null;

export async function getFirebaseConfig(): Promise<FirebaseConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    // Try to get config from environment variables first (for local development)
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      cachedConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      };
      return cachedConfig;
    }

    // Fallback to Secret Manager for server-side/production
    const [
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      measurementId,
    ] = await Promise.all([
      getSecret('firebase-api-key'),
      getSecret('firebase-auth-domain'),
      getSecret('firebase-project-id'),
      getSecret('firebase-storage-bucket'),
      getSecret('firebase-messaging-sender-id'),
      getSecret('firebase-app-id'),
      getSecret('firebase-measurement-id').catch(() => undefined),
    ]);

    cachedConfig = {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      measurementId,
    };

    return cachedConfig;
  } catch (error) {
    console.error('Error loading Firebase configuration:', error);
    throw new Error('Failed to load Firebase configuration');
  }
}