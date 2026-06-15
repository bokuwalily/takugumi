# 卓組（タクグミ）

シナリオの構造から、ココフォリアの「配置済み部屋」ZIP を生成するツール。

## なぜ
ココフォリアの部屋作り（背景・パネル・立ち絵の配置）は手間で、ココナラ/SKIMA で
部屋作成代行が ¥2,000〜7,800 で実取引されている。卓組は「シナリオ構造 → 配置済み
部屋ZIP」を自動生成し、作り手の作業を代行する。BOOTH で体験版＋買い切りで配布する。

- 出力 = ココフォリアにドラッグするだけの ZIP（インポートは無料ユーザーも可）
- 製品内 LLM 不使用・サーバー不要・原価ゼロ・1人+AIで運用
- 配信/決済/特商法表示は BOOTH 等プラットフォームが代行（ハンドル名運営と整合）

## 状態（2026-06-15）
- ✅ ccfolia ルームZIPスキーマを実サンプルから解析（[SCHEMA.md](./SCHEMA.md)）
- ✅ 生成器コア実装（`src/buildRoom.ts`）。背景＋パネル配置のZIPを生成
- ✅ ゴールデン照合テスト 5/5 緑（`npm test`）
- ✅ **最終ゲート突破**: 生成ZIPを実際のココフォリアにインポート→背景＋6パネルが正常レンダリング確認済（`.token`も受理）。生成器はエンドツーエンドで実証完了
- ✅ **自動レイアウトエンジン**（`src/layout.ts`）: Scenario(タイトル/立ち絵/HO/参照チップ)→座標自動計算。重なりなし・盤面内・決定的をテストで保証（計12テスト緑）。トップAPI=`src/buildScenario.ts`
- ✅ **Web UI**（`src/web/`、Vite+React、クライアント完結・サーバー無し）: 画像アップ→WYSIWYG盤面プレビュー→ZIP DL。`npm run dev`。実ブラウザでコア生成(crypto.subtle+jszip)動作確認済・コンソールエラー0
- ⏳ 次段: BOOTH体験版でWTP検証 / Vercelデプロイ前にLP・問い合わせ・プラポリ・規約・sitemap / 立ち絵=characterのZIP埋め込み / scenes(シーン切替)

## 開発(Web)
```bash
npm run dev      # http://localhost:5173
npm run build    # dist/ に静的出力(Vercel等にそのまま乗る)
```

## API
```ts
import { buildScenarioZip } from './src/buildScenario.js'
const zip = await buildScenarioZip({
  background, title,
  handouts: [{ image }, ...],
  referenceChips: [{ image, label: 'ハウスルール' }, ...],
})  // → Uint8Array (ccfolia room ZIP)
```

## 使い方（開発）
```bash
npm install
npm test                       # スキーマ照合テスト
node --import tsx test/genDemo.ts   # 実サンプル画像で見える部屋ZIPを生成
```

## 構成
- `src/types.ts` — ccfolia 仕様の型
- `src/hash.ts` — SHA-256(コンテンツアドレス) / MIME
- `src/ids.ts` — 20文字 push ID 生成
- `src/buildRoom.ts` — RoomSpec → ルームZIP のコア
- `fixtures/golden__data.json` — 実サンプル（一次資料）
