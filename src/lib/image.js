// Image helpers for item photos. Photos are downscaled to a small square
// JPEG thumbnail (a data URL) so they persist in localStorage alongside the
// rest of the item and work fully offline.

const THUMB = 224
const QUALITY = 0.72

function drawThumbnail(source, size = THUMB, quality = QUALITY) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  // Center-crop to a square ("cover").
  const s = Math.min(source.width, source.height)
  const sx = (source.width - s) / 2
  const sy = (source.height - s) / 2
  ctx.drawImage(source, sx, sy, s, s, 0, 0, size, size)
  return canvas.toDataURL('image/jpeg', quality)
}

// A File/Blob (e.g. a camera capture) → small JPEG data URL.
export async function fileToThumbnail(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  try {
    return drawThumbnail(bitmap)
  } finally {
    bitmap.close?.()
  }
}

// A remote image URL → data URL (needs CORS). Throws if it can't be read;
// callers fall back to storing the URL directly.
export async function urlToThumbnail(url) {
  const res = await fetch(url, { mode: 'cors' })
  if (!res.ok) throw new Error(`image ${res.status}`)
  const blob = await res.blob()
  const bitmap = await createImageBitmap(blob)
  try {
    return drawThumbnail(bitmap)
  } finally {
    bitmap.close?.()
  }
}

// Best-effort auto-fetch of a food photo by name via Open Food Facts (keyless,
// CORS-enabled). Returns an image URL or null. Best for packaged groceries.
export async function findFoodImage(name) {
  const q = encodeURIComponent(name.trim())
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${q}` +
    `&search_simple=1&action=process&json=1&page_size=10` +
    `&fields=image_front_small_url,image_small_url,image_url`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`search ${res.status}`)
  const data = await res.json()
  for (const p of data.products || []) {
    const img = p.image_front_small_url || p.image_small_url || p.image_url
    if (img) return img
  }
  return null
}
