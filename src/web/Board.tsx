// レイアウト結果をそのまま盤面プレビューとして描画(WYSIWYG)。
// 座標は原点中心セル → パーセントに変換して絶対配置。

import type { RoomSpec } from '../types.js'

interface BoardProps {
  spec: RoomSpec
  /** items と同じ順のプレビューURL列。 */
  itemUrls: string[]
  backgroundUrl?: string
}

export function Board({ spec, itemUrls, backgroundUrl }: BoardProps) {
  const fw = spec.fieldWidth ?? 64
  const fh = spec.fieldHeight ?? 40
  const items = spec.items ?? []

  const pct = (v: number, total: number) => `${(v / total) * 100}%`

  return (
    <div
      className="board"
      style={{ aspectRatio: `${fw} / ${fh}` }}
      role="img"
      aria-label="部屋のプレビュー"
    >
      {backgroundUrl && (
        <img className="board__bg" src={backgroundUrl} alt="" />
      )}
      {items.length === 0 && !backgroundUrl && (
        <p className="board__empty">素材を追加すると、ここに配置が出ます</p>
      )}
      {items.map((it, i) => (
        <div
          key={i}
          className="board__item"
          style={{
            left: pct(it.x + fw / 2, fw),
            top: pct(it.y + fh / 2, fh),
            width: pct(it.width, fw),
            height: pct(it.height, fh),
          }}
          title={it.memo || undefined}
        >
          {itemUrls[i] && <img src={itemUrls[i]} alt={it.memo || ''} />}
          {it.memo && <span className="board__memo">{it.memo}</span>}
        </div>
      ))}
    </div>
  )
}
