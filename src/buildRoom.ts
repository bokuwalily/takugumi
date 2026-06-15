// RoomSpec(入力) → ccfolia ルームZIP のバイト列。
// ZIP 構成: __data.json / .token / <sha256>.<ext> (画像)

import JSZip from 'jszip'
import type {
  RoomSpec,
  RoomImage,
  ItemSpec,
  CcfoliaData,
  CcfoliaItem,
} from './types.js'
import { sha256Hex, extForMime } from './hash.js'
import { generateId } from './ids.js'

const VERSION = '1.1.0' as const
const DEFAULT_FIELD_W = 67
const DEFAULT_FIELD_H = 37

interface ResolvedImage {
  /** ZIP内ファイル名 = <sha256>.<ext> */
  fileName: string
  data: Uint8Array
  mime: RoomImage['mime']
}

/** 画像をハッシュ名に解決し、同一内容は重複排除する。 */
async function resolveImage(
  img: RoomImage,
  cache: Map<string, ResolvedImage>,
): Promise<ResolvedImage> {
  const hash = await sha256Hex(img.data)
  const fileName = `${hash}.${extForMime(img.mime)}`
  const existing = cache.get(fileName)
  if (existing) return existing
  const resolved: ResolvedImage = { fileName, data: img.data, mime: img.mime }
  cache.set(fileName, resolved)
  return resolved
}

/** ItemSpec → ccfolia item オブジェクト。 */
function toCcfoliaItem(
  spec: ItemSpec,
  imageUrl: string,
  index: number,
): CcfoliaItem {
  return {
    x: spec.x,
    y: spec.y,
    z: spec.z ?? index + 1,
    angle: spec.angle ?? 0,
    width: spec.width,
    height: spec.height,
    deckId: null,
    locked: spec.locked ?? true,
    visible: spec.visible ?? true,
    closed: false,
    freezed: spec.freezed ?? false,
    type: 'plane',
    active: true,
    memo: spec.memo ?? '',
    imageUrl,
    coverImageUrl: null,
    order: spec.order ?? index,
  }
}

/** `.token` 値("0.<64hex>")を生成する。export時のメタトークン。 */
async function makeToken(): Promise<string> {
  const seed = new Uint8Array(32)
  crypto.getRandomValues(seed)
  const hex = await sha256Hex(seed)
  return `0.${hex}`
}

/** RoomSpec から ccfolia ルームZIP(Uint8Array)を生成する。 */
export async function buildRoomZip(
  spec: RoomSpec,
  random: () => number = Math.random,
): Promise<Uint8Array> {
  const imageCache = new Map<string, ResolvedImage>()
  const resources: CcfoliaData['resources'] = {}

  // 背景
  let backgroundUrl: string | null = null
  if (spec.background) {
    const bg = await resolveImage(spec.background, imageCache)
    backgroundUrl = bg.fileName
    resources[bg.fileName] = { type: bg.mime }
  }

  // パネル
  const items: Record<string, CcfoliaItem> = {}
  const specItems = spec.items ?? []
  for (let i = 0; i < specItems.length; i++) {
    const it = specItems[i]
    const img = await resolveImage(it.image, imageCache)
    resources[img.fileName] = { type: img.mime }
    items[generateId(random)] = toCcfoliaItem(it, img.fileName, i)
  }

  const data: CcfoliaData = {
    meta: { version: VERSION },
    entities: {
      room: {
        backgroundUrl,
        foregroundUrl: null,
        thumbnailUrl: null,
        mapType: null,
        fieldWidth: spec.fieldWidth ?? DEFAULT_FIELD_W,
        fieldHeight: spec.fieldHeight ?? DEFAULT_FIELD_H,
        messageChannels: [],
        markers: {},
        monitored: false,
        sceneId: null,
        archived: false,
        underConstruction: false,
      },
      items,
      decks: {},
      characters: {},
      effects: {},
      scenes: {},
    },
    resources,
  }

  const zip = new JSZip()
  zip.file('__data.json', JSON.stringify(data))
  zip.file('.token', await makeToken())
  for (const img of imageCache.values()) {
    zip.file(img.fileName, img.data)
  }

  return zip.generateAsync({ type: 'uint8array' })
}
