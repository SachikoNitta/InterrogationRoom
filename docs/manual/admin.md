# 管理者マニュアル

取り調べ室アプリケーションの管理者機能について説明します。

## 📋 目次

1. [管理者権限について](#管理者権限について)
2. [管理者アクセス方法](#管理者アクセス方法)
3. [キーワード管理](#キーワード管理)
4. [サマリー管理](#サマリー管理)
5. [トラブルシューティング](#トラブルシューティング)

---

## 🔐 管理者権限について

### 管理者とは
管理者は以下の特別な権限を持つユーザーです：
- **キーワード管理**: サマリー生成用のキーワードの作成、編集、削除
- **サマリー管理**: ケースからのサマリー生成と管理
- **システム設定**: アプリケーション全体の設定管理

### 権限システム
- **Firebase Custom Claims**を使用した安全な権限管理
- **Secret Manager**による管理者メールアドレスの暗号化保存
- **役割ベースアクセス制御**による適切な権限分離

---

## 🚪 管理者アクセス方法

### 1. ログイン
1. アプリケーションにGoogleアカウントでログイン
2. 管理者権限が設定されたメールアドレスでログインする必要があります

### 2. 管理者ページへのアクセス
```
https://your-app-url.com/admin
```

または、ダッシュボードから「管理者ダッシュボード」ボタンをクリック

### 3. アクセス確認
- 管理者権限がない場合は「アクセス拒否」ページが表示されます
- 権限がある場合は管理者ダッシュボードが表示されます

---

## 🏷️ キーワード管理

### キーワードとは
サマリー生成時に使用される重要な語句です。会話内容からこれらのキーワードに関連する情報を抽出し、構造化されたサマリーを作成します。

### キーワード管理機能

#### 新規キーワード作成
1. 管理者ページの「キーワード管理」タブを選択
2. 「新規キーワード」ボタンをクリック
3. 以下の情報を入力：
   - **キーワード**: 検索対象となる語句（例：「うどん」「感情」）
   - **カテゴリ**: キーワードの分類（例：「food」「emotion」「action」）
   - **説明**: キーワードの用途や意味の説明
4. 「作成」ボタンをクリック

#### キーワード編集
1. キーワード一覧から編集したいキーワードの「編集」ボタンをクリック
2. 情報を修正
3. 「更新」ボタンをクリック

#### キーワードの有効/無効切り替え
- **有効**: サマリー生成時に使用される
- **無効**: 一時的に使用を停止（削除せずに保持）

#### キーワード削除
1. 削除したいキーワードの「削除」ボタンをクリック
2. 確認ダイアログで「OK」をクリック

**⚠️ 注意**: 削除されたキーワードは復元できません

### キーワード設計のベストプラクティス

#### 効果的なキーワードの作成
1. **具体性**: 「食べ物」より「うどん」のように具体的に
2. **一意性**: 他の語句と重複しない独特の表現
3. **関連性**: サマリーで重要となる概念を選択

#### カテゴリ分類例
- **food**: 食べ物関連（うどん、ラーメン、寿司）
- **emotion**: 感情関連（喜び、悲しみ、怒り）
- **action**: 行動関連（移動、購入、連絡）
- **person**: 人物関連（友人、家族、同僚）
- **location**: 場所関連（駅、店舗、オフィス）

---

## 📄 サマリー管理

### サマリーとは
ユーザーのケース（会話記録）から重要な情報を抽出し、構造化された要約を作成したものです。

### サマリー生成機能

#### 新規サマリー生成
1. 管理者ページの「サマリー管理」タブを選択
2. 「新規サマリー生成」セクションでケースを選択
3. 「サマリー生成」ボタンをクリック
4. 生成完了まで待機（通常数秒〜数分）

#### 生成プロセス
1. **ケース選択**: 対象となる会話記録を選択
2. **キーワード適用**: アクティブなキーワードを自動適用
3. **AI分析**: 会話内容をAIが分析
4. **サマリー作成**: 構造化された要約を生成
5. **保存**: データベースに保存

### サマリー管理機能

#### サマリー一覧表示
- 生成されたサマリーが新しい順に表示
- 各サマリーには以下の情報が含まれます：
  - **ケースID**: 対象となったケースの識別子
  - **生成日時**: サマリーが作成された日時
  - **使用キーワード**: 生成時に使用されたキーワード一覧
  - **ステータス**: 生成状況（完了、処理中、エラー）
  - **サマリー内容**: 生成された要約文

#### サマリー検索
- 検索ボックスでサマリー内容やキーワードで検索可能
- リアルタイム検索でフィルタリング

### サマリー品質向上のヒント

#### 高品質なサマリーを作成するために
1. **キーワードの充実**: 重要な概念を網羅するキーワードセットを構築
2. **定期的な見直し**: 生成されたサマリーの品質を確認し、キーワードを調整
3. **カテゴリバランス**: 異なるカテゴリのキーワードをバランス良く設定

---

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 管理者ページにアクセスできない
**症状**: 「アクセス拒否」ページが表示される

**原因と解決方法**:
1. **管理者権限がない**
   - 管理者メールアドレスがSecret Managerに登録されているか確認
   - `./init-admin.sh`を実行して権限を初期化

2. **ログインユーザーが異なる**
   - 正しい管理者メールアドレスでログインしているか確認
   - 別のGoogleアカウントを使用している可能性

3. **キャッシュの問題**
   - ブラウザをリフレッシュ（Ctrl+F5）
   - ログアウト後、再ログイン

#### キーワードが保存できない
**症状**: 「作成」ボタンを押してもエラーが発生する

**解決方法**:
1. **必須項目の確認**: キーワード名が入力されているか確認
2. **重複チェック**: 同じキーワードが既に存在しないか確認
3. **権限確認**: 管理者権限が正しく設定されているか確認

#### サマリー生成が失敗する
**症状**: 「生成中...」から進まない、またはエラーメッセージが表示される

**解決方法**:
1. **ケースの確認**: 選択したケースに十分なメッセージが含まれているか確認
2. **キーワードの確認**: アクティブなキーワードが存在するか確認
3. **システムログ確認**: 
   ```bash
   gcloud logs read --limit=50 --filter='resource.type=cloud_run_revision'
   ```

### 管理者権限の追加・削除

#### 新しい管理者の追加
1. Secret Managerで`admin-emails`を更新:
   ```bash
   echo -n "existing@company.com,new-admin@company.com" | \
   gcloud secrets versions add admin-emails --data-file=-
   ```

2. 権限を初期化:
   ```bash
   ./init-admin.sh
   ```

3. 新しい管理者にログアウト・ログインを依頼

#### 管理者権限の削除
1. Secret Managerから該当メールアドレスを削除
2. 権限を再初期化
3. Firebase Consoleで必要に応じてCustom Claimsを手動削除

### システムメンテナンス

#### 定期的なメンテナンス項目
1. **キーワードの見直し**: 月1回程度、使用されていないキーワードの整理
2. **サマリー品質確認**: 生成されたサマリーの品質チェック
3. **ログ確認**: エラーログの定期確認
4. **バックアップ確認**: データベースのバックアップ状況確認

---

## 📞 サポート

### ヘルプが必要な場合
1. **ドキュメント確認**: この管理者マニュアルを再確認
2. **システムログ確認**: Cloud Runのログでエラー詳細を確認
3. **開発チーム連絡**: 上記で解決しない場合は開発チームに連絡

### ログ確認方法
```bash
# 最新のログを確認
gcloud logs read --limit=20 --filter='resource.type=cloud_run_revision'

# エラーログのみ確認
gcloud logs read --limit=20 --filter='resource.type=cloud_run_revision AND severity>=ERROR'

# 特定時間のログ確認
gcloud logs read --filter='resource.type=cloud_run_revision' \
  --format='table(timestamp,severity,textPayload)' \
  --since='1h'
```

---

## 📈 管理者ダッシュボードの活用

### 効率的な管理のために
1. **定期的なチェック**: 週1回程度、新規サマリーと品質を確認
2. **キーワード最適化**: サマリーの結果に基づいてキーワードを調整
3. **ユーザーフィードバック**: 一般ユーザーからの要望を反映

---

このマニュアルは継続的に更新されます。最新版は常にプロジェクトドキュメントで確認してください。