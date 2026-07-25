import { STORAGE_KEY } from './constants.js'

// Load the fridge from localStorage. Returns an array of items; first-run users
// start empty and are greeted by onboarding (they can load sample data there).
export function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []
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
