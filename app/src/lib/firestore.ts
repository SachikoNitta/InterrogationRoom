import { Firestore } from '@google-cloud/firestore';

let firestoreInstance: Firestore | null = null;

export function getFirestoreClient(): Firestore {
  if (!firestoreInstance) {
    // 環境変数からプロジェクトIDを取得
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'interrogation-room';
    
    firestoreInstance = new Firestore({
      projectId,
      // Cloud Run環境では自動的に認証される
      // ローカル開発時はGCLOUD_APPLICATION_CREDENTIALSを設定
    });
  }
  
  return firestoreInstance;
}
