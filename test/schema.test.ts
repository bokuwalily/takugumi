// 生成した ccfolia ルームZIP が、実サンプル(fixtures/golden__data.json)と
// 同じ構造を持つかを検証する。スキーマ不一致はインポート失敗に直結するため
// ゴールデン照合を最重要テストとする。

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import JSZip from 'jszip'
import { buildRoomZip } from '../src/buildRoom.js'
import type { RoomImage } from '../src/types.js'

const __dir = dirname(fileURLToPath(import.meta.url))
const golden = JSON.parse(
  readFileSync(join(__dir, '../fixtures/golden__data.json'), 'utf-8'),
)

// 1x1 透明PNG / 最小JPEGのダミー(中身は問わない。ハッシュ名生成の検証用)
const PNG_1x1 = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
  0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
])
const png = (): RoomImage => ({ data: PNG_1x1, mime: 'image/png' })

function keySet(o: object): string[] {
  return Object.keys(o).sort()
}

test('生成ZIPは __data.json / .token / 画像を含む', async () => {
  const bytes = await buildRoomZip({
    background: png(),
    items: [{ image: png(), x: -7, y: -14, width: 15, height: 15, memo: 'タイトル' }],
  })
  const zip = await JSZip.loadAsync(bytes)
  const names = Object.keys(zip.files)
  assert.ok(names.includes('__data.json'), '__data.json がある')
  assert.ok(names.includes('.token'), '.token がある')
  const images = names.filter((n) => /\.(png|jpe?g)$/.test(n))
  assert.ok(images.length >= 1, '画像が1枚以上')
  // 画像名は <sha256(64hex)>.<ext>
  for (const img of images) {
    assert.match(img, /^[0-9a-f]{64}\.(png|jpeg)$/, `${img} はハッシュ名`)
  }
})

test('.token は "0.<64hex>" 形式', async () => {
  const bytes = await buildRoomZip({ items: [] })
  const zip = await JSZip.loadAsync(bytes)
  const token = await zip.file('.token')!.async('string')
  assert.match(token, /^0\.[0-9a-f]{64}$/)
})

test('__data.json のトップレベル構造がゴールデンと一致', async () => {
  const bytes = await buildRoomZip({
    background: png(),
    items: [{ image: png(), x: 0, y: 0, width: 5, height: 5 }],
  })
  const zip = await JSZip.loadAsync(bytes)
  const data = JSON.parse(await zip.file('__data.json')!.async('string'))

  assert.deepEqual(keySet(data), keySet(golden), 'トップレベルkeyが一致')
  assert.equal(data.meta.version, golden.meta.version, 'versionが一致')
  assert.deepEqual(
    keySet(data.entities),
    keySet(golden.entities),
    'entities keyが一致',
  )
  assert.deepEqual(
    keySet(data.entities.room),
    keySet(golden.entities.room),
    'room keyが一致',
  )
})

test('item の構造がゴールデンの item と完全一致', async () => {
  const bytes = await buildRoomZip({
    items: [{ image: png(), x: 1, y: 2, width: 3, height: 4 }],
  })
  const zip = await JSZip.loadAsync(bytes)
  const data = JSON.parse(await zip.file('__data.json')!.async('string'))

  const goldenItem = Object.values(golden.entities.items)[0] as object
  const myItem = Object.values(data.entities.items)[0] as object
  assert.deepEqual(keySet(myItem), keySet(goldenItem), 'item keyが一致')

  // item ID は 20文字
  const id = Object.keys(data.entities.items)[0]
  assert.equal(id.length, 20, 'item IDが20文字')
})

test('整合性: items.imageUrl と room.backgroundUrl は resources/ZIPに実在', async () => {
  const bytes = await buildRoomZip({
    background: png(),
    items: [{ image: png(), x: 0, y: 0, width: 5, height: 5 }],
  })
  const zip = await JSZip.loadAsync(bytes)
  const data = JSON.parse(await zip.file('__data.json')!.async('string'))
  const zipNames = new Set(Object.keys(zip.files))

  const refs = [
    data.entities.room.backgroundUrl,
    ...Object.values(data.entities.items).map((i: any) => i.imageUrl),
  ].filter(Boolean)

  for (const ref of refs) {
    assert.ok(data.resources[ref], `resources に ${ref} が登録されている`)
    assert.ok(zipNames.has(ref), `ZIP に ${ref} が同梱されている`)
  }
})
