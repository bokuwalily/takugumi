// シナリオ要素を ccfolia グリッド上の座標付き RoomSpec に自動レイアウトする。
// 方針: 種類ごとに横1行(必要なら折返し)を作り、行を上から下へ重ならないよう積む。
// 各行は原点(0,0)中心に左右センタリング。盤面は内容に合わせて自動拡張。

import type { Scenario } from './scenario.js'
import type { RoomSpec, ItemSpec, RoomImage } from './types.js'

const DEFAULT_FIELD_W = 64
const DEFAULT_FIELD_H = 40
const MARGIN = 3
const ROW_GAP = 2

// 種類別の既定サイズ(マス)と折返し数
const SIZE = {
  title: { w: 16, h: 10, gap: 0, perRow: 1 },
  stand: { w: 8, h: 12, gap: 1, perRow: 6 },
  handout: { w: 10, h: 14, gap: 1, perRow: 4 },
  chip: { w: 6, h: 2, gap: 1, perRow: 8 },
} as const

type Kind = keyof typeof SIZE

interface Cell {
  image: RoomImage
  memo: string
  w: number
  h: number
  gap: number
}

interface Row {
  cells: Cell[]
  width: number
  height: number
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/** 1種類の要素群を行(複数可)に変換する。 */
function toRows(
  items: { image: RoomImage; label?: string }[] | undefined,
  kind: Kind,
): Row[] {
  if (!items || items.length === 0) return []
  const s = SIZE[kind]
  return chunk(items, s.perRow).map((group) => {
    const cells: Cell[] = group.map((it) => ({
      image: it.image,
      memo: it.label ?? '',
      w: s.w,
      h: s.h,
      gap: s.gap,
    }))
    const width =
      cells.reduce((sum, c) => sum + c.w, 0) + s.gap * (cells.length - 1)
    const height = Math.max(...cells.map((c) => c.h))
    return { cells, width, height }
  })
}

/** Scenario → 座標付き RoomSpec。背景はそのまま透過。 */
export function layoutScenario(scenario: Scenario): RoomSpec {
  const rows: Row[] = [
    ...toRows(scenario.title ? [{ image: scenario.title }] : undefined, 'title'),
    ...toRows(scenario.stands, 'stand'),
    ...toRows(scenario.handouts, 'handout'),
    ...toRows(scenario.referenceChips, 'chip'),
  ]

  const items: ItemSpec[] = []

  if (rows.length > 0) {
    const totalHeight =
      rows.reduce((sum, r) => sum + r.height, 0) + ROW_GAP * (rows.length - 1)
    let cursorY = -Math.round(totalHeight / 2)
    let z = 1

    for (const row of rows) {
      let cursorX = -Math.round(row.width / 2)
      for (const cell of row.cells) {
        items.push({
          image: cell.image,
          x: cursorX,
          y: cursorY,
          width: cell.w,
          height: cell.h,
          z,
          order: z,
          memo: cell.memo,
          locked: true,
        })
        cursorX += cell.w + cell.gap
        z++
      }
      cursorY += row.height + ROW_GAP
    }
  }

  // 盤面サイズ: 指定があれば優先、なければ内容を包む大きさに自動拡張
  const contentW = rows.length ? Math.max(...rows.map((r) => r.width)) : 0
  const contentH = rows.length
    ? rows.reduce((sum, r) => sum + r.height, 0) + ROW_GAP * (rows.length - 1)
    : 0
  const fieldWidth =
    scenario.fieldWidth ?? Math.max(DEFAULT_FIELD_W, contentW + MARGIN * 2)
  const fieldHeight =
    scenario.fieldHeight ?? Math.max(DEFAULT_FIELD_H, contentH + MARGIN * 2)

  return { fieldWidth, fieldHeight, background: scenario.background, items }
}
