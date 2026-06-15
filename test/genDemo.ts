// 実サンプル(無料配布部屋)の画像を使い、自前の生成器で「見える部屋ZIP」を
// 組んで ~/Downloads に出力する。これをココフォリアにドラッグして
// インポートが通れば、.token を含め生成器が実用上正しいと確定する(最終検証ゲート)。

import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import JSZip from 'jszip'
import { buildRoomZip } from '../src/buildRoom.js'
import type { ItemSpec, RoomImage } from '../src/types.js'

const SAMPLE = join(
  homedir(),
  'Downloads/nagerudake4_black_set.zip',
)

function mimeOf(name: string): RoomImage['mime'] {
  return /\.jpe?g$/i.test(name) ? 'image/jpeg' : 'image/png'
}

async function main() {
  // 外側ZIP → 入れ子の部屋ZIP → __data.json と画像を取得
  const outer = await JSZip.loadAsync(readFileSync(SAMPLE))
  const innerName = Object.keys(outer.files).find((n) =>
    n.toLowerCase().endsWith('.zip'),
  )!
  const inner = await JSZip.loadAsync(
    await outer.file(innerName)!.async('uint8array'),
  )
  const golden = JSON.parse(await inner.file('__data.json')!.async('string'))

  // 画像をハッシュ名→バイトで読み出し
  const imgBytes = new Map<string, Uint8Array>()
  for (const name of Object.keys(inner.files)) {
    if (/\.(png|jpe?g)$/i.test(name)) {
      imgBytes.set(name, await inner.file(name)!.async('uint8array'))
    }
  }
  const img = (ref: string): RoomImage => ({
    data: imgBytes.get(ref)!,
    mime: mimeOf(ref),
  })

  // golden の room/items を自前 RoomSpec に写経(同じ見た目を自分の生成器で再現)
  const items: ItemSpec[] = Object.values<any>(golden.entities.items).map(
    (it) => ({
      image: img(it.imageUrl),
      x: it.x,
      y: it.y,
      width: it.width,
      height: it.height,
      z: it.z,
      order: it.order,
      memo: it.memo,
      locked: it.locked,
      freezed: it.freezed,
    }),
  )

  const bytes = await buildRoomZip({
    fieldWidth: golden.entities.room.fieldWidth,
    fieldHeight: golden.entities.room.fieldHeight,
    background: golden.entities.room.backgroundUrl
      ? img(golden.entities.room.backgroundUrl)
      : undefined,
    items,
  })

  const out = join(homedir(), 'Downloads/takugumi-test-room.zip')
  writeFileSync(out, bytes)
  console.log(`生成: ${out}  (${bytes.length} bytes, items=${items.length})`)
  console.log('→ ココフォリアの新規ルームにこのZIPをドラッグして再現されるか確認')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
