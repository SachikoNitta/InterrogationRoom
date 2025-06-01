# 🔐 認証方式（Authentication）

## 使用サービス
- Firebase Authentication（SSO：Google / GitHub）
- IDトークン（JWT）によるサーバー側検証

## 認証フロー概要
1. クライアント側で Firebase にログイン（GoogleなどのSSO）
2. getIdToken() で IDトークン（JWT）取得
3. トークンを Authorization: Bearer <token> でAPIに送信
4. サーバーは Firebase Admin SDK で verifyIdToken() を実行しユーザーを検証
5. 成功時、uid を使って Firestore にアクセス

## セキュリティメモ
- IDトークンの有効期限は約1時間
- トークンは HTTP-only Cookie or Bearerヘッダーで送信（推奨：HTTP-only）
- 認証失敗時は 401 Unauthorized を返却

