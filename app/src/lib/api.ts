/**
 * API共通ユーティリティ
 */

export async function loginWithGoogle(idToken: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to login");
  return res.json();
}