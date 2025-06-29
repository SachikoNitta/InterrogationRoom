import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'interrogation-room';

export async function getSecret(secretName: string): Promise<string> {
  /**
   * 指定されたシークレット名のシークレットをGoogle Cloud Secret Managerから取得する
   */
  const client = new SecretManagerServiceClient();
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
  
  try {
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload?.data;
    if (!payload) {
      throw new Error(`Secret '${secretName}' not found`);
    }
    return payload.toString();
  } catch (error) {
    console.error(`Error accessing secret ${secretName}:`, error);
    throw new Error(`Failed to access secret: ${secretName}`);
  }
}
