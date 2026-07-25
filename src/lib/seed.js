import { todayISO } from './expiry.js'

// Build an expiration date N days from today as a YYYY-MM-DD string.
function inDays(n) {
  const d = new Date(todayISO() + 'T00:00:00')
  d.setDate(d.getDate() + n)
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

// First-run sample fridge so the app isn't empty. Dates are relative to today
// so there's always something fresh, something expiring, and something expired.
export function seedItems() {
  const now = new Date().toISOString()
  const mk = (name, category, quantity, unit, days) => ({
    id: crypto.randomUUID(),
    name,
    category,
    quantity,
    unit,
    expiration: inDays(days),
    addedAt: now,
    status: 'active',
  })

  return [
    mk('Spinach', 'food', 1, 'bunch', 1),
    mk('Greek yogurt', 'food', 4, 'pcs', 6),
    mk('Chicken breast', 'food', 500, 'g', 2),
    mk('Eggs', 'food', 8, 'pcs', 14),
    mk('Chili con carne', 'meal-prep', 3, 'servings', 4),
    mk('Overnight oats', 'meal-prep', 2, 'servings', 2),
    mk('Leftover pizza', 'leftovers', 2, 'slices', 0),
    mk('Roast veggies', 'leftovers', 1, 'servings', -1),
  ]
}
