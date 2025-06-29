/**
 * API共通ユーティリティ
 */

// 基本的なAPIリクエスト関数
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? '' // 本番環境では同じドメイン
    : 'http://localhost:3000'; // 開発環境でのベースURL
    
  const url = `${baseUrl}${endpoint}`;
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`API Error: ${res.status} ${res.statusText}`, errorText);
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  
  return res.json();
}

// 認証関連API
export async function loginWithGoogle(idToken: string) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}

export async function getCurrentUser(idToken: string) {
  return apiRequest('/api/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}

// ケース関連API
export async function getCases(idToken: string) {
  return apiRequest('/api/cases', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}

export async function getCase(caseId: string, idToken: string) {
  return apiRequest(`/api/cases/${caseId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}

export async function createCase(summaryId: string, idToken: string) {
  return apiRequest('/api/cases', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ summaryId }),
  });
}

export async function deleteCase(caseId: string, idToken: string) {
  return apiRequest(`/api/cases/${caseId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}

// サマリー関連API
export async function getSummaries() {
  return apiRequest('/api/summaries', {
    method: 'GET',
  });
}

export async function getSummary(summaryId: string) {
  return apiRequest(`/api/summaries/${summaryId}`, {
    method: 'GET',
  });
}

export async function generateSummary(caseId: string, idToken: string) {
  return apiRequest('/api/summaries', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ caseId }),
  });
}

// チャット関連API
export async function sendChatMessage(caseId: string, message: string, idToken: string) {
  return apiRequest(`/api/cases/${caseId}/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ message }),
  });
}

export async function sendAssistantMessage(caseId: string, message: string, idToken: string) {
  return apiRequest(`/api/cases/${caseId}/chat/assistant`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ message }),
  });
}

export async function getCaseBySummaryId(summaryId: string, idToken: string) {
  return apiRequest(`/api/cases/summary/${summaryId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}

// 新しいサマリーを生成（引数なし）
export async function createNewSummary(idToken: string) {
  return apiRequest('/api/summaries', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}