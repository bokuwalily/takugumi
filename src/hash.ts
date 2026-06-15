// 画像はコンテンツアドレス(中身のSHA-256 16進)でファイル名が決まる。
// Web Crypto API を使い Node(>=20) / ブラウザ両方で動かす。

/** バイト列の SHA-256 を 16進小文字で返す。 */
export async function sha256Hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** MIME から拡張子を返す。 */
export function extForMime(mime: 'image/png' | 'image/jpeg'): string {
  return mime === 'image/jpeg' ? 'jpeg' : 'png'
}
