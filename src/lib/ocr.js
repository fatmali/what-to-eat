// On-device OCR via Tesseract.js. The engine (worker, WASM core, and English
// model) is self-hosted under <base>/tesseract/ so nothing is fetched from a
// third-party CDN and it works offline once cached. Tesseract.js itself is
// dynamically imported so it stays out of the initial app bundle.

const base = import.meta.env.BASE_URL

// Read text from an image File/Blob. onProgress receives 0..1 during recognition.
export async function recognizeText(file, onProgress) {
  const { createWorker } = await import('tesseract.js')

  const worker = await createWorker('eng', 1, {
    workerPath: `${base}tesseract/worker.min.js`,
    corePath: `${base}tesseract/tesseract-core-simd-lstm.wasm.js`,
    langPath: `${base}tesseract`,
    gzip: true,
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof onProgress === 'function') {
        onProgress(m.progress)
      }
    },
  })

  try {
    const { data } = await worker.recognize(file)
    return data.text ?? ''
  } finally {
    await worker.terminate()
  }
}
