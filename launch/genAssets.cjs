// 体験版「雰囲気部屋」のプレースホルダ素材を sharp で生成する。
// テキストはベイクしない(日本語グリフ崩れ回避)。背景＋装飾枠＋小アクセントのみ。
// 実行: NODE_PATH=$(npm root -g) node launch/genAssets.cjs

// global/local どちらの sharp でも解決(SHARP_PATH優先)
const sharp = require(process.env.SHARP_PATH || 'sharp')
const { mkdirSync } = require('node:fs')
const { join } = require('node:path')

const dir = join(__dirname, 'assets')
mkdirSync(dir, { recursive: true })

// 背景: 夜霧の祭壇めいた暗いラジアルグラデ＋ヴィネット(汎用・システム不問)
const bg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">
  <defs>
    <radialGradient id="g" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="#3a3350"/>
      <stop offset="45%" stop-color="#211b30"/>
      <stop offset="100%" stop-color="#0d0a14"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="34%" r="40%">
      <stop offset="0%" stop-color="#e8a24a" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#e8a24a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#g)"/>
  <rect width="1600" height="900" fill="url(#glow)"/>
  <rect x="0" y="0" width="1600" height="900" fill="none"
        stroke="#000" stroke-opacity="0.55" stroke-width="160"/>
</svg>`

// タイトル枠: 中央透過の金二重枠(GMがタイトル画像/テキストを後で乗せる)
const titleFrame = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="460">
  <g fill="none" stroke="#e8a24a">
    <rect x="14" y="14" width="772" height="432" stroke-width="2" stroke-opacity="0.9"/>
    <rect x="26" y="26" width="748" height="408" stroke-width="1" stroke-opacity="0.5"/>
  </g>
  <g fill="#e8a24a" opacity="0.9">
    <circle cx="20" cy="20" r="4"/><circle cx="780" cy="20" r="4"/>
    <circle cx="20" cy="440" r="4"/><circle cx="780" cy="440" r="4"/>
  </g>
</svg>`

// 小アクセント枠(参照チップ位置に置く無地パネル。テキストはGMが乗せる前提)
const chip = `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100">
  <rect x="2" y="2" width="296" height="96" rx="10"
        fill="#1a1524" fill-opacity="0.92" stroke="#e8a24a" stroke-opacity="0.7" stroke-width="2"/>
</svg>`

;(async () => {
  await sharp(Buffer.from(bg)).jpeg({ quality: 86 }).toFile(join(dir, 'bg.jpg'))
  await sharp(Buffer.from(titleFrame)).png().toFile(join(dir, 'title-frame.png'))
  await sharp(Buffer.from(chip)).png().toFile(join(dir, 'chip.png'))
  console.log('assets生成:', dir)
})()
