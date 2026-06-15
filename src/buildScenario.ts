// Scenario(高レベル入力) → 自動レイアウト → ccfolia ルームZIP。
// 卓組のトップレベルAPI。

import type { Scenario } from './scenario.js'
import { layoutScenario } from './layout.js'
import { buildRoomZip } from './buildRoom.js'

/** Scenario から配置済みルームZIP(Uint8Array)を生成する。 */
export async function buildScenarioZip(
  scenario: Scenario,
  random: () => number = Math.random,
): Promise<Uint8Array> {
  const spec = layoutScenario(scenario)
  return buildRoomZip(spec, random)
}

export { layoutScenario }
