import { adminAuth } from './firebase-admin';

/**
 * 管理者権限の管理ユーティリティ
 */

// 管理者権限のカスタムクレームキー
const ADMIN_CLAIM = 'admin';

/**
 * ユーザーに管理者権限を付与
 */
export async function setAdminRole(userId: string, isAdmin: boolean = true): Promise<void> {
  await adminAuth.setCustomUserClaims(userId, { [ADMIN_CLAIM]: isAdmin });
}

/**
 * ユーザーの管理者権限を確認
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await adminAuth.getUser(userId);
  return user.customClaims?.[ADMIN_CLAIM] === true;
}

/**
 * IDトークンから管理者権限を確認
 */
export async function isTokenAdmin(idToken: string): Promise<boolean> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken[ADMIN_CLAIM] === true;
  } catch (error) {
    return false;
  }
}

/**
 * Secret Managerから管理者メールアドレスを取得
 */
async function getAdminEmailsFromSecrets(): Promise<string[]> {
  try {
    // Secret Managerクライアントを動的にインポート
    const { getSecret } = await import('./secret-manager');
    const adminEmailsString = await getSecret('admin-emails');
    
    if (!adminEmailsString) {
      console.log('📝 admin-emails secret not found, checking environment variable');
      return process.env.ADMIN_EMAILS?.split(',').map((email: string) => email.trim()) || [];
    }
    
    return adminEmailsString.split(',').map((email: string) => email.trim()).filter((email: string) => email);
  } catch (error) {
    console.warn('⚠️ Could not get admin emails from Secret Manager, falling back to environment variable:', error);
    return process.env.ADMIN_EMAILS?.split(',').map((email: string) => email.trim()) || [];
  }
}

/**
 * Secret Managerで指定された管理者ユーザーを初期化
 */
export async function initializeAdminUsers(): Promise<void> {
  const adminEmails = await getAdminEmailsFromSecrets();
  
  if (adminEmails.length === 0) {
    console.log('📝 No admin emails configured in Secret Manager or environment variables');
    return;
  }
  
  console.log(`🔧 Initializing admin users: ${adminEmails.length} emails found`);
  
  for (const email of adminEmails) {
    try {
      const user = await adminAuth.getUserByEmail(email);
      await setAdminRole(user.uid, true);
      console.log(`✅ Admin role granted to: ${email}`);
    } catch (error) {
      console.warn(`⚠️ Could not grant admin role to ${email}:`, error);
    }
  }
}