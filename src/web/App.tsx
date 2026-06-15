import { useMemo, useState } from 'react'
import { Uploader } from './Uploader.js'
import { Board } from './Board.js'
import {
  downloadRoomZip,
  layoutForPreview,
  orderedUrls,
  type BuilderState,
  type Slot,
} from './lib.js'

const EMPTY: BuilderState = {
  background: undefined,
  title: undefined,
  stands: [],
  handouts: [],
  chips: [],
}

export function App() {
  const [state, setState] = useState<BuilderState>(EMPTY)
  const [busy, setBusy] = useState(false)

  const spec = useMemo(() => layoutForPreview(state), [state])
  const itemUrls = useMemo(() => orderedUrls(state), [state])
  const hasContent =
    !!state.background ||
    !!state.title ||
    state.stands.length + state.handouts.length + state.chips.length > 0

  const single = (key: 'background' | 'title') => (slots: Slot[]) =>
    setState((s) => ({ ...s, [key]: slots[0] }))
  const multi = (key: 'stands' | 'handouts' | 'chips') => (slots: Slot[]) =>
    setState((s) => ({ ...s, [key]: slots }))

  async function handleDownload() {
    setBusy(true)
    try {
      await downloadRoomZip(state, 'takugumi-room.zip')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead__brand">
          <span className="masthead__mark">卓組</span>
          <span className="masthead__sub">TAKUGUMI</span>
        </div>
        <p className="masthead__tag">
          素材を放り込むだけで、ココフォリアの<b>配置済み部屋</b>を書き出す。
          <br />
          ブラウザの中で完結・登録不要・画像はどこにも送られません。
        </p>
      </header>

      <main className="layout">
        <div className="panel">
          <Uploader
            label="背景"
            hint="盤面いっぱいに敷く1枚"
            slots={state.background ? [state.background] : []}
            onChange={single('background')}
          />
          <Uploader
            label="タイトル"
            hint="中央上部に大きく置く"
            slots={state.title ? [state.title] : []}
            onChange={single('title')}
          />
          <Uploader
            label="立ち絵 / NPC"
            hint="中段に横並び"
            multiple
            slots={state.stands}
            onChange={multi('stands')}
          />
          <Uploader
            label="ハンドアウト"
            hint="情報パネル。4枚ごとに折り返し"
            multiple
            slots={state.handouts}
            onChange={multi('handouts')}
          />
          <Uploader
            label="参照チップ"
            hint="ハウスルール/狂気/戦闘 など最下段の小パネル"
            multiple
            withLabels
            slots={state.chips}
            onChange={multi('chips')}
          />
        </div>

        <div className="preview">
          <div className="preview__sticky">
            <Board
              spec={spec}
              itemUrls={itemUrls}
              backgroundUrl={state.background?.url}
            />
            <button
              className="download"
              onClick={handleDownload}
              disabled={!hasContent || busy}
            >
              {busy ? '生成中…' : '部屋ZIPをダウンロード'}
            </button>
            <p className="preview__note">
              ココフォリアの新規ルーム →「ルーム設定 → ルームデータ →
              インポート」で読み込めます。
            </p>
          </div>
        </div>
      </main>

      <footer className="foot">
        <span>卓組 — 個人開発の非公式ツール（CCFOLIA運営とは無関係）</span>
        <nav className="foot__links">
          <a href="mailto:bokuwalily@gmail.com">お問い合わせ</a>
          <a href="/privacy.html">プライバシー</a>
          <a href="/terms.html">利用規約</a>
        </nav>
      </footer>
    </div>
  )
}
