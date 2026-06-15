# ココフォリア ルームデータ ZIP 仕様（リバースエンジニアリング結果）

> 2026-06-14 BOOTH無料配布部屋ZIP（nagerudake4 / ネクロニカ汎用）の実物を解析して確定。
> 一次資料: `fixtures/golden__data.json`。公式docsには内部スキーマの記載なし。

## ZIP 構成

```
room.zip
├── __data.json          ルームデータ本体(UTF-8 JSON)
├── .token               "0.<sha256 64hex>" 形式のトークン
└── <sha256>.png|.jpeg   画像リソース(ファイル名=中身のSHA-256 16進=コンテンツアドレス)
```

- 画像はコンテンツアドレス方式。同一画像は自動的に1ファイルに重複排除される。
- 音源(BGM)は ZIP に含まれない（公式仕様。インポートでも復元されない）。
- **インポートは全ユーザー無料 / エクスポートは CCFOLIA PRO 限定**。
  → 生成物を読む顧客側は無料でよい＝商品として成立。

## __data.json スキーマ（meta.version = "1.1.0"）

```jsonc
{
  "meta": { "version": "1.1.0" },
  "entities": {
    "room": {
      "backgroundUrl": "<hash>.jpeg" | null,   // 背景
      "foregroundUrl": null,
      "thumbnailUrl": null,
      "mapType": null,
      "fieldWidth": 67, "fieldHeight": 37,      // 盤面マス数
      "messageChannels": [],
      "markers": {},
      "monitored": false, "sceneId": null,
      "archived": false, "underConstruction": false
    },
    "items": {                                  // 盤面パネル/画像。key=20文字のランダムID
      "<20charId>": {
        "x": -7, "y": -14, "z": 5, "angle": 0,
        "width": 15, "height": 15,
        "deckId": null,
        "locked": true, "visible": true, "closed": false, "freezed": false,
        "type": "plane", "active": true,
        "memo": "タイトル",
        "imageUrl": "<hash>.png", "coverImageUrl": null,
        "order": 0
      }
    },
    "decks": {},        // カードデッキ(未調査・空でOK)
    "characters": {},   // 駒。スキーマは Clipboard API docs + 実サンプル tiria.json で別途確定済
    "effects": {},      // 演出(未調査・空でOK)
    "scenes": {}        // シーン(未調査・空でOK。背景差し替えの単位)
  },
  "resources": {                                // ZIP内画像のMIME登録。これが無いと画像が読まれない
    "<hash>.jpeg": { "type": "image/jpeg" },
    "<hash>.png":  { "type": "image/png" }
  }
}
```

## キャラクター(characters)スキーマ
別途確定済（docs.ccfolia.com/developer-api/clipboard-api + GitHub実サンプル）:
`{ name, memo, initiative, externalUrl, status[{label,value,max}], params[{label,value}],
   iconUrl, faces[], x, y, angle, width, height, active, secret, invisible, hideStatus,
   color, commands, owner }`
※ Clipboard API 経由では iconUrl/faces/x/y/active が「デフォルト優先」で設定不可。
  配置・画像付きで投入するには **必ず ZIP インポート経路**を使うこと（本ツールの存在意義）。

## 検証済み（2026-06-15 実インポートで確認）
- ✅ 生成ZIP(`takugumi-test-room.zip`)を実際のココフォリアにインポート→背景＋6パネルが正常レンダリング。
- ✅ `.token` は `0.<ランダム32byteのsha256>` でOK。内容検証はされていない（ランダム値で受理された）。
- ✅ 画像のコンテンツアドレス名・resources登録・items配置すべて期待通り反映。

## 未調査（MVPでは不要）
- `scenes` / `decks` / `effects` の内部スキーマ（空で可。シーン切替・カードは次段）。
- characters の ZIP 内配置（Clipboard APIスキーマは判明済、ZIP埋め込みは未テスト）。
