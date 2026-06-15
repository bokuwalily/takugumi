// シナリオ入力の高レベル型。GMはこれを書くだけで、座標は layout が自動計算する。
// 画像は RoomImage(バイト+mime)で渡す。座標・サイズは指定しない（自動レイアウトの責務）。

import type { RoomImage } from './types.js'

/** 参照チップ(ハウスルール/狂気/戦闘 等の小さな見出しパネル)。 */
export interface ReferenceChip {
  image: RoomImage
  label?: string
}

/** ハンドアウト(HO)や情報パネル。 */
export interface Handout {
  image: RoomImage
  label?: string
}

/** NPC立ち絵などの大きめパネル。 */
export interface Stand {
  image: RoomImage
  label?: string
}

/** シナリオ1本ぶんの部屋の中身。 */
export interface Scenario {
  /** 盤面の大きさ(マス)。未指定なら内容に合わせて自動拡張。 */
  fieldWidth?: number
  fieldHeight?: number
  /** 背景画像。 */
  background?: RoomImage
  /** タイトル画像(中央上部に大きく配置)。 */
  title?: RoomImage
  /** NPC立ち絵など(中段に横並び)。 */
  stands?: Stand[]
  /** ハンドアウト/情報パネル(グリッド配置)。 */
  handouts?: Handout[]
  /** 参照チップ(最下段に横並び)。 */
  referenceChips?: ReferenceChip[]
}
