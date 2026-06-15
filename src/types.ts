// ccfolia ルームデータ(version 1.1.0)の型。
// 実サンプル(BOOTH無料配布部屋ZIPの __data.json)をリバースエンジニアして定義。
// fixtures/golden__data.json が一次資料。

export type ImageMime = 'image/png' | 'image/jpeg'

/** 入力用の画像。data はバイト列、mime は MIME タイプ。 */
export interface RoomImage {
  data: Uint8Array
  mime: ImageMime
}

/** 盤面に置くパネル/画像(ccfolia の "item")の入力仕様。 */
export interface ItemSpec {
  image: RoomImage
  x: number
  y: number
  width: number
  height: number
  /** 重なり順(大きいほど手前)。未指定なら自動採番。 */
  z?: number
  /** 一覧の並び順。未指定なら自動採番。 */
  order?: number
  memo?: string
  /** 移動ロック。既定 true(配置済み部屋として固定したいため)。 */
  locked?: boolean
  /** シーン切替で消えないよう固定。既定 false。 */
  freezed?: boolean
  angle?: number
  visible?: boolean
}

/** 部屋全体の入力仕様。 */
export interface RoomSpec {
  fieldWidth?: number
  fieldHeight?: number
  /** 背景画像(任意)。 */
  background?: RoomImage
  /** 盤面パネル群。 */
  items?: ItemSpec[]
}

// ---- 出力 __data.json の構造(ccfolia 仕様) ----

export interface CcfoliaItem {
  x: number
  y: number
  z: number
  angle: number
  width: number
  height: number
  deckId: null
  locked: boolean
  visible: boolean
  closed: boolean
  freezed: boolean
  type: 'plane'
  active: boolean
  memo: string
  imageUrl: string | null
  coverImageUrl: null
  order: number
}

export interface CcfoliaRoom {
  backgroundUrl: string | null
  foregroundUrl: null
  thumbnailUrl: null
  mapType: null
  fieldWidth: number
  fieldHeight: number
  messageChannels: unknown[]
  markers: Record<string, unknown>
  monitored: boolean
  sceneId: null
  archived: boolean
  underConstruction: boolean
}

export interface CcfoliaData {
  meta: { version: '1.1.0' }
  entities: {
    room: CcfoliaRoom
    items: Record<string, CcfoliaItem>
    decks: Record<string, unknown>
    characters: Record<string, unknown>
    effects: Record<string, unknown>
    scenes: Record<string, unknown>
  }
  resources: Record<string, { type: ImageMime }>
}
