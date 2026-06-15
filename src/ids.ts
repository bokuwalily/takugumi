// ccfolia の item/character ID は Firebase push ID 風の 20 文字
// (英大小文字・数字・- _)。衝突しない一意IDを生成する。

const ID_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

/** 20文字のランダムID(Firebase push ID 風)を生成する。 */
export function generateId(random: () => number = Math.random): string {
  let id = ''
  for (let i = 0; i < 20; i++) {
    id += ID_ALPHABET[Math.floor(random() * ID_ALPHABET.length)]
  }
  return id
}
