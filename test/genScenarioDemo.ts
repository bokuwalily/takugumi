// 実サンプル画像で Scenario → 自動レイアウト → ルームZIP を通しで生成し、
// ~/Downloads に出力。シナリオ入力APIのE2E確認用。

import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import JSZip from 'jszip'
import { buildScenarioZip, layoutScenario } from '../src/buildScenario.js'
import type { RoomImage } from '../src/types.js'

const SAMPLE = join(homedir(), 'Downloads/nagerudake4_black_set.zip')

async function main() {
  const outer = await JSZip.loadAsync(readFileSync(SAMPLE))
  const innerName = Object.keys(outer.files).find((n) => n.toLowerCase().endsWith('.zip'))!
  const inner = await JSZip.loadAsync(await outer.file(innerName)!.async('uint8array'))

  const imgs: Record<string, RoomImage> = {}
  for (const name of Object.keys(inner.files)) {
    if (/\.(png|jpe?g)$/i.test(name)) {
      imgs[name] = {
        data: await inner.file(name)!.async('uint8array'),
        mime: /\.jpe?g$/i.test(name) ? 'image/jpeg' : 'image/png',
      }
    }
  }
  const pngs = Object.values(imgs).filter((i) => i.mime === 'image/png')
  const jpeg = Object.values(imgs).find((i) => i.mime === 'image/jpeg')

  const scenario = {
    background: jpeg,
    title: pngs[3] ?? pngs[0],
    handouts: [{ image: pngs[1] }, { image: pngs[1] }, { image: pngs[1] }],
    referenceChips: [
      { image: pngs[2] ?? pngs[0], label: 'ハウスルール' },
      { image: pngs[2] ?? pngs[0], label: '狂気' },
      { image: pngs[2] ?? pngs[0], label: '戦闘' },
      { image: pngs[2] ?? pngs[0], label: '成長' },
    ],
  }

  const spec = layoutScenario(scenario)
  console.log('レイアウト結果:')
  for (const it of spec.items!) {
    console.log(`  (${it.x},${it.y}) ${it.width}x${it.height} "${it.memo}"`)
  }
  console.log(`field: ${spec.fieldWidth}x${spec.fieldHeight}`)

  const bytes = await buildScenarioZip(scenario)
  const out = join(homedir(), 'Downloads/takugumi-scenario-room.zip')
  writeFileSync(out, bytes)
  console.log(`\n生成: ${out} (${bytes.length} bytes, items=${spec.items!.length})`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
