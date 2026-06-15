// ブラウザ側ヘルパー: File→RoomImage、レイアウト順URL列、ZIPダウンロード。

import type { RoomImage } from '../types.js'
import type { Scenario } from '../scenario.js'
import { layoutScenario } from '../layout.js'
import { buildScenarioZip } from '../buildScenario.js'

export interface Slot {
  id: string
  url: string // プレビュー用 object URL
  image: RoomImage
  label?: string
}

/** アップロードされた File を RoomImage(+プレビューURL) に変換する。png/jpeg のみ。 */
export async function fileToSlot(file: File): Promise<Slot> {
  const mime: RoomImage['mime'] =
    file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png'
  const data = new Uint8Array(await file.arrayBuffer())
  return {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    url: URL.createObjectURL(file),
    image: { data, mime },
  }
}

export function isSupportedImage(file: File): boolean {
  return file.type === 'image/png' || file.type === 'image/jpeg'
}

/** UI状態(Slot群) から Scenario(build用) を組む。 */
export interface BuilderState {
  background?: Slot
  title?: Slot
  stands: Slot[]
  handouts: Slot[]
  chips: Slot[]
}

export function toScenario(s: BuilderState): Scenario {
  return {
    background: s.background?.image,
    title: s.title?.image,
    stands: s.stands.map((x) => ({ image: x.image })),
    handouts: s.handouts.map((x) => ({ image: x.image })),
    referenceChips: s.chips.map((x) => ({ image: x.image, label: x.label })),
  }
}

/** layoutScenario が items を生成する順に並べた プレビューURL列。 */
export function orderedUrls(s: BuilderState): string[] {
  return [
    ...(s.title ? [s.title.url] : []),
    ...s.stands.map((x) => x.url),
    ...s.handouts.map((x) => x.url),
    ...s.chips.map((x) => x.url),
  ]
}

export function layoutForPreview(s: BuilderState) {
  return layoutScenario(toScenario(s))
}

/** Scenario をZIP化してダウンロードさせる。 */
export async function downloadRoomZip(s: BuilderState, filename = 'room.zip') {
  const bytes = await buildScenarioZip(toScenario(s))
  const blob = new Blob([bytes as BlobPart], { type: 'application/zip' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(a.href)
}
