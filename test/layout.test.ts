// 自動レイアウトの検証: 重なりなし・盤面内に収まる・要素数一致・決定的。

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { layoutScenario } from '../src/layout.js'
import type { Scenario } from '../src/scenario.js'
import type { RoomImage } from '../src/types.js'

const img = (): RoomImage => ({ data: new Uint8Array([1, 2, 3]), mime: 'image/png' })

function overlaps(a: any, b: any): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

const fullScenario: Scenario = {
  background: img(),
  title: img(),
  stands: [{ image: img() }, { image: img() }, { image: img() }],
  handouts: [{ image: img() }, { image: img() }, { image: img() }, { image: img() }, { image: img() }],
  referenceChips: [
    { image: img(), label: 'ハウスルール' },
    { image: img(), label: '狂気' },
    { image: img(), label: '戦闘' },
  ],
}

test('要素数: 全アイテムが items に反映される(背景はitem外)', () => {
  const spec = layoutScenario(fullScenario)
  // title1 + stands3 + handouts5 + chips3 = 12
  assert.equal(spec.items?.length, 12)
  assert.ok(spec.background, '背景はroom側に保持')
})

test('重なりなし: どの2アイテムも矩形が重ならない', () => {
  const items = layoutScenario(fullScenario).items!
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      assert.ok(
        !overlaps(items[i], items[j]),
        `item[${i}] と item[${j}] が重なっている`,
      )
    }
  }
})

test('盤面内: 全アイテムが fieldWidth×fieldHeight の範囲(原点中心)に収まる', () => {
  const spec = layoutScenario(fullScenario)
  const halfW = spec.fieldWidth! / 2
  const halfH = spec.fieldHeight! / 2
  for (const it of spec.items!) {
    assert.ok(it.x >= -halfW && it.x + it.width <= halfW, `x範囲: ${it.x}`)
    assert.ok(it.y >= -halfH && it.y + it.height <= halfH, `y範囲: ${it.y}`)
  }
})

test('チップは横一列(同じy)に並ぶ', () => {
  const spec = layoutScenario({
    referenceChips: [{ image: img() }, { image: img() }, { image: img() }],
  })
  const ys = new Set(spec.items!.map((i) => i.y))
  assert.equal(ys.size, 1, '3チップが同じy')
})

test('ハンドアウトは perRow=4 で折り返す', () => {
  const spec = layoutScenario({
    handouts: Array.from({ length: 5 }, () => ({ image: img() })),
  })
  const ys = [...new Set(spec.items!.map((i) => i.y))]
  assert.equal(ys.length, 2, '5個→2行')
})

test('決定的: 同じ入力なら同じ座標', () => {
  const a = layoutScenario(fullScenario).items!.map((i) => [i.x, i.y, i.width, i.height])
  const b = layoutScenario(fullScenario).items!.map((i) => [i.x, i.y, i.width, i.height])
  assert.deepEqual(a, b)
})

test('空シナリオ: items空・既定盤面', () => {
  const spec = layoutScenario({})
  assert.equal(spec.items?.length, 0)
  assert.ok(spec.fieldWidth! > 0 && spec.fieldHeight! > 0)
})
