# ローカル開発環境構築手順

## 前提条件
- Node.js（推奨バージョン: 最新LTS）
- Python 3.x
- Docker（必要に応じて）

---

## 1. リポジトリのクローン
```sh
git clone <このリポジトリのURL>
cd interrogation_room
```

---

## 2. フロントエンド(app)セットアップ
```sh
cd app
npm install
```

### 開発サーバー起動
```sh
npm run dev
```

---

## 3. バックエンド(backend)セットアップ
```sh
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export GOOGLE_CLOUD_PROJECT=[YOUR_PROJECT_ID]
```

### APIサーバー起動
```sh
uvicorn main:app --reload
```

### キーワード作成
```
import services.keyword_manager as km
km.create_keyword("うどん")
```

### 概要作成
10秒程度かかります
```
import services.summary_service as ss
ss.generate_summary()
```

---

## 5. 補足
- 仮想環境は毎回 `source venv/bin/activate` で有効化してください。
- Dockerを使う場合は、各ディレクトリの `Dockerfile` を参照してください。
- 本プロジェクトで想定してる本番環境（Cloud Run）では環境変数が自動的に読み込まれるため、`dotenv`を使用していません。ローカルでは`export`で環境変数を使用してください。

