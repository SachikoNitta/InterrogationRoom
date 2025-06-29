// 開発環境用のモック認証ヘルパー
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

export function createMockUser() {
  return {
    uid: 'dev-user-123',
    email: 'dev@example.com',
    name: 'Development User',
  };
}

export async function verifyTokenOrMock(token: string) {
  if (isDevelopment() && token === 'dev-token') {
    return createMockUser();
  }
  throw new Error('Invalid token');
}
