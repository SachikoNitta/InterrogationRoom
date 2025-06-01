# 🎮 Interrogation Room - ゲームフロー

このドキュメントは、Interrogation Room のゲーム体験全体の流れと、サーバーで行う処理を記録するためのものです。

## 🔐 ログイン・認証
1. クライアントが SSO（例: Google）でログイン
2. Firebase Auth が ID トークンを発行
3. クライアントが `/api/auth/login` にトークンを送信
4. サーバー側で `verifyIdToken()` によるトークン検証
5. ユーザーが存在しなければ `users/{userId}` を作成
6. 認証完了後、JWTを使って以降のリクエストを保護

## 🧵 case作成
1. クライアントが `POST /api/cases` を送信（リクエストボディは空）
2. サーバーが以下を実行：
   - Firestore に `cases/{caseId}` を作成（status: in_progress）
   - Gemini に対して固定プロンプトを送信し、事件概要と導入メッセージを生成
   - 最初のメッセージを logs に保存
3. クライアントには caseId と最初のメッセージを返す

## 🗣️ 対話の流れ
1. クライアントが `/api/cases/{caseId}/chat` に質問を送信
2. サーバーが以下を実行：
   - 対象の case を Firestore から取得
   - ユーザー発言をログに追加
   - 直前のログとともに Gemini に送信し、容疑者の返答を生成
   - AIの返答をログに追加し、Firestoreに保存
   - AIの返答をクライアントに返す

## 🏁 ゲームの終了
- （プロトタイプ段階）容疑者が自白したら、ゲームを終了する
- 終了した case は `status: confessed`になり、それ以上チャットを続行できなくなる

## 📝 備考
- シナリオは事前には保持しない。Gemini に完全に任せる構成
- 1セッション = 1ケース（Firestoreのドキュメント）
- logs は単純な role/message のリスト
- caseId はクライアント側で保持しておき、リクエストごとに渡す

