# 卓組 ローンチ手順（BOOTH体験版でWTP検証）

目的: 無料Webツールは公開済み（https://takugumi.vercel.app）。次は **BOOTHに無料体験版を置いて
「部屋データに金を払う層」への接触とWTPの初期シグナルを測る**。

## 舜が物理的にやること（俺が代行できない＝要ログイン/本人判断）

1. **BOOTHショップを開設**（pixivアカウント連携。ハンドル「Lily」名義）
   - 特商法表示はBOOTHが代行する形態を選ぶ（個人情報の露出回避）
2. **商品①を出品**（無料体験版）
   - ファイル: `launch/takugumi-sample-room.zip`
   - 商品名・説明文・タグ: `launch/BOOTH-listing.md` からコピペ
   - 価格: ¥0／ブースト ON
   - サムネ: ココフォリアで体験版を読み込んだ盤面のスクショ（推奨）
3. **告知**: X（Lily）で「#ココフォリア #TRPGシナリオ」を付け、
   体験版DLリンク＋ツールURLを実演GIF/スクショ付きで投稿（週2〜3本）
4. **GSC**（任意・SEO計測したい場合）: Google Search Console に takugumi.vercel.app を登録し
   `sitemap.xml` を送信（要・舜のGoogleログイン。俺は代行不可）

## 測る指標（2〜4週間）
- 体験版DL数（=入口の関心）
- ブースト件数/額（=初期WTPシグナル）
- ツールへの流入（X→takugumi.vercel.app）
- 「自分のシナリオでも使った」の声（=コア価値の刺さり）

判断基準: DLは伸びるがブースト/再訪がゼロなら「無料で十分」シグナル→Pro機能課金 or テンプレ集（有料・要アート）へ切替。

## 次段の開発（WTPが見えたら）
- 立ち絵=character のZIP埋め込み（NPC駒）
- 複数シーン（scenes）対応
- Pro機能＋ライセンス課金（autolike-license-server 流用）or ムード別テンプレ集の量産

## 生成物の再生成コマンド
```bash
# 体験版アセット(背景/枠/チップ)を作り直す
SHARP_PATH="$HOME/dev/seo-affiliate-site/node_modules/sharp" node launch/genAssets.cjs
# 体験版ルームZIPを作り直す
node --import tsx launch/genSample.ts   # → launch/takugumi-sample-room.zip
```
