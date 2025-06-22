# ゲームをプレイ可能にするため管理者が行うこと

後ほど管理画面を実装予定です

## キーワード作成
- 概要の作成に使用するキーワードを作成します。
- 「うどん」のような簡単な単語でOK
- 概要作成時にランダムに3つが選ばれ、それらの単語を含む概要が作成されます
```sh
cd backend
python3
import services.keyword_manager as km
km.create_keyword("うどん")
```

## 概要作成
- 事件の概要を作成します
- 10秒程度かかります
- 完了するとフロントエンドのダッシュボードに概要が追加されます
```sh
cd backend
python3
import services.summary_service as ss
ss.generate_summary()
```