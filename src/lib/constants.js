// Shared constants for the app.

export const STORAGE_KEY = 'whattoeat.fridge.v1'
export const NOTIFIED_KEY = 'whattoeat.notified.v1'
export const NOTIFY_PREF_KEY = 'whattoeat.notifyEnabled.v1'

// Items expiring within this many days count as "expiring soon".
export const SOON_THRESHOLD_DAYS = 3

export const CATEGORIES = {
  food: { id: 'food', label: 'Food', emoji: '🥦', hint: 'Raw ingredients & groceries' },
  'meal-prep': { id: 'meal-prep', label: 'Meal prep', emoji: '🍱', hint: 'Prepped meals ready to go' },
  leftovers: { id: 'leftovers', label: 'Leftovers', emoji: '🍲', hint: 'Cooked food to finish' },
}

export const CATEGORY_ORDER = ['food', 'meal-prep', 'leftovers']

export const UNITS = ['pcs', 'servings', 'g', 'kg', 'ml', 'L', 'pack', 'bunch', 'slices', 'cups']
