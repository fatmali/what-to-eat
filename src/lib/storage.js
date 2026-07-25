import { STORAGE_KEY } from './constants.js'
import { seedItems } from './seed.js'

// Load the fridge from localStorage, seeding on first run. Returns an array of
// items. Any parse/quirk falls back to a fresh seed so the app always renders.
export function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      const seeded = seedItems()
      saveItems(seeded)
      return seeded
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch (err) {
    console.warn('Could not read fridge from storage, starting empty.', err)
    return []
  }
}

export function saveItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (err) {
    console.warn('Could not persist fridge to storage.', err)
  }
}
