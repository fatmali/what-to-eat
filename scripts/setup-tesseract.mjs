// Regenerates public/tesseract/ (the self-hosted OCR engine) from installed
// packages, downloading the English model once if missing. Runs on `prebuild`
// so the committed docs/ output always contains the engine, without tracking
// these large binaries as source.
import { createRequire } from 'node:module'
import { mkdirSync, existsSync, copyFileSync, writeFileSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'tesseract')
mkdirSync(outDir, { recursive: true })

// Copy the worker + a single SIMD-LSTM core from the installed packages.
const copies = [
  ['tesseract.js/dist/worker.min.js', 'worker.min.js'],
  ['tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js'],
  ['tesseract.js-core/tesseract-core-simd-lstm.wasm', 'tesseract-core-simd-lstm.wasm'],
]
for (const [pkgPath, name] of copies) {
  const src = require.resolve(pkgPath)
  copyFileSync(src, join(outDir, name))
}

// English "fast" model, gzipped (Tesseract expects eng.traineddata.gz).
const lang = join(outDir, 'eng.traineddata.gz')
if (!existsSync(lang) || statSync(lang).size < 100_000) {
  const url = 'https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/eng.traineddata'
  process.stdout.write('Fetching eng.traineddata… ')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download traineddata: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(lang, gzipSync(buf, { level: 9 }))
  process.stdout.write('done\n')
}

console.log('tesseract assets ready in public/tesseract/')
