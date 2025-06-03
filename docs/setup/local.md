# ローカル開発環境構築手順

## 前提条件
- Node.js（推奨バージョン: 最新LTS）
- Python 3.x
- Docker（必要に応じて）
- Terraform（インフラ操作が必要な場合）

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
```

### APIサーバー起動
```sh
python main.py
```

---

## 4. インフラ（必要な場合）
```sh
cd infra/terraform
terraform init
terraform apply
```

- 変数は `terraform.tfvars` で管理してください。
- 詳細は `docs/setup/local.md` の変数管理セクション参照。

---

## 5. 補足
- `.env` や `terraform.tfvars` などのサンプルファイルがある場合は、コピーして値を設定してください。
- 仮想環境は毎回 `source venv/bin/activate` で有効化してください。
- Dockerを使う場合は、各ディレクトリの `Dockerfile` を参照してください。

