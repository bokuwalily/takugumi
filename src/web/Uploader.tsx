// 画像アップロード用の小さなコントロール。単一/複数、サムネ+削除に対応。

import { useRef } from 'react'
import { fileToSlot, isSupportedImage, type Slot } from './lib.js'

interface UploaderProps {
  label: string
  hint?: string
  slots: Slot[]
  multiple?: boolean
  withLabels?: boolean // チップ用: 各スロットにラベル入力
  onChange: (slots: Slot[]) => void
}

export function Uploader({
  label,
  hint,
  slots,
  multiple = false,
  withLabels = false,
  onChange,
}: UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return
    const files = Array.from(fileList).filter(isSupportedImage)
    const added = await Promise.all(files.map(fileToSlot))
    onChange(multiple ? [...slots, ...added] : added.slice(0, 1))
    if (inputRef.current) inputRef.current.value = ''
  }

  function remove(id: string) {
    onChange(slots.filter((s) => s.id !== id))
  }

  function setLabel(id: string, text: string) {
    onChange(slots.map((s) => (s.id === id ? { ...s, label: text } : s)))
  }

  return (
    <section className="uploader">
      <header className="uploader__head">
        <h3>{label}</h3>
        {hint && <p className="uploader__hint">{hint}</p>}
      </header>

      <div className="uploader__grid">
        {slots.map((s) => (
          <figure key={s.id} className="thumb">
            <img src={s.url} alt="" />
            <button
              type="button"
              className="thumb__remove"
              onClick={() => remove(s.id)}
              aria-label="削除"
            >
              ×
            </button>
            {withLabels && (
              <input
                className="thumb__label"
                placeholder="ラベル"
                value={s.label ?? ''}
                onChange={(e) => setLabel(s.id, e.target.value)}
              />
            )}
          </figure>
        ))}

        <button
          type="button"
          className="uploader__add"
          onClick={() => inputRef.current?.click()}
        >
          <span aria-hidden>＋</span>
          {multiple ? '追加' : slots.length ? '差し替え' : '選択'}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        multiple={multiple}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </section>
  )
}
