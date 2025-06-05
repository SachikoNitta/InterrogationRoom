# Interrogation Room API エンドポイント一覧とcurl例

## /api/cases

### POST 新しい尋問ケースを作成
- レスポンス: `{ "caseId": "..." }`

```sh
curl -X POST http://localhost:8000/api/cases
```

### GET ユーザーのすべてのケースを取得
- レスポンス: ケース配列

```sh
curl http://localhost:8000/api/cases
```

---

## /api/cases/{caseId}

### GET 特定の尋問ケースを取得
- パスパラメータ: `caseId`（例: dummy-case-id）
- レスポンス: ケース詳細

```sh
curl http://localhost:8000/api/cases/dummy-case-id
```

---

## /api/cases/{caseId}/chat

### POST 尋問メッセージを送信
- パスパラメータ: `caseId`
- リクエストボディ: `{ "message": "..." }`
- レスポンス: `{ "reply": "...", "status": "..." }`

```sh
curl -X POST http://localhost:8000/api/cases/dummy-case-id/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "こんにちは"}'
```

---

## /api/auth/login

### POST FirebaseのIDトークンでログイン
- リクエストボディ: `{ "idToken": "..." }`
- レスポンス: `{ "userId": "..." }`

```sh
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"idToken": "dummy-token"}'
```

---

## /api/auth/me

### GET 現在ログイン中のユーザー情報を取得
- レスポンス: ユーザープロフィール

```sh
curl http://localhost:8000/api/auth/me
```
