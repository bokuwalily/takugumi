// 体験版「汎用 雰囲気部屋」を卓組で生成して launch/ に出力。
// 実行: node --import tsx launch/genSample.ts

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildScenarioZip } from '../src/buildScenario.js'
import type { RoomImage } from '../src/types.js'

const dir = join(import.meta.dirname, 'assets')
const png = (name: string): RoomImage => ({
  data: new Uint8Array(readFileSync(join(dir, name))),
  mime: 'image/png',
})
const jpg = (name: string): RoomImage => ({
  data: new Uint8Array(readFileSync(join(dir, name))),
  mime: 'image/jpeg',
})

const bytes = await buildScenarioZip({
  background: jpg('bg.jpg'),
  title: png('title-frame.png'),
  referenceChips: [
    { image: png('chip.png'), label: '' },
    { image: png('chip.png'), label: '' },
    { image: png('chip.png'), label: '' },
    { image: png('chip.png'), label: '' },
  ],
})

const out = join(import.meta.dirname, 'takugumi-sample-room.zip')
writeFileSync(out, bytes)
console.log(`体験版生成: ${out} (${bytes.length} bytes)`)
