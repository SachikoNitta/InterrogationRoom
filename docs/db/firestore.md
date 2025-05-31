# Firestore Data Structure

このドキュメントでは、Interrogation Roomアプリで使用するFirestoreのデータ構造を定義します。

## users/{userId}

認証済みユーザーのプロフィールと設定を保持するコレクション

📄 フィールド定義

| フィールド名       | 型         | NULL可 | デフォルト値 | 説明                              |
|--------------------|------------|--------|-------------|----------------------------------|
| userId            | string     | ×      | なし        | Firebase UID（ドキュメントIDと同じ） |
| displayName       | string     | ×      | なし        | 表示名（ニックネーム）              |
| email             | string     | ×      | なし        | ユーザーのメールアドレス           |
| provider          | string     | ×      | なし        | SSOログインプロバイダー名           |
| createdAt         | timestamp  | ×      | サーバ時刻   | 初回ログイン日時                   |
| lastLoginAt       | timestamp  | ×      | サーバ時刻   | 最終ログイン日時                   |
| preferences       | map        | ○      | {}          | テーマなどのユーザー設定           |

🧪 例
```
{
  "userId": "abc123",
  "displayName": "Sachiko",
  "email": "sachi@example.com",
  "provider": "google",
  "createdAt": "2024-01-01T00:00:00Z",
  "lastLoginAt": "2024-05-30T12:34:56Z",
  "preferences": {
    "lang": "ja"
  }
}
```

## cases/{caseId}

ユーザーが進行中または完了した尋問セッションを記録するコレクション

📄 フィールド定義

| フィールド名       | 型         | NULL可 | デフォルト値 | 説明                              |
|--------------------|------------|--------|-------------|----------------------------------|
| caseId            | string     | ×      | ドキュメントID | ケースID（ドキュメントIDと同じ）   |
| userId            | string     | ×      | なし        | このケースの所有ユーザー           |
| status            | string     | ×      | in_progress | “in_progress” / “confessed” / “failed” |
| createdAt         | timestamp  | ×      | サーバ時刻   | 開始日時                          |
| lastUpdated       | timestamp  | ×      | サーバ時刻   | 最終更新日時                      |
| logs              | array      | ×      | []          | チャットログ（発言順）             |

🧪 例
```
{
  "caseId": "case123",
  "userId": "sachi456",
  "status": "in_progress",
  "createdAt": "2024-05-30T10:00:00Z",
  "lastUpdated": "2024-05-30T10:10:00Z",
  "logs": [
    { "role": "user", "message": "何時に帰ったの？" },
    { "role": "suspect", "message": "7時には出ました" }
  ]
}
```