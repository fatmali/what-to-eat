import { SOON_THRESHOLD_DAYS } from './constants.js'

// Normalize a date to local midnight so day math ignores the time of day.
function atMidnight(d) {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

// Whole days from today until the given expiration date string (YYYY-MM-DD).
// Negative = already expired, 0 = expires today.
export function daysUntil(expiration) {
  if (!expiration) return Infinity
  const today = atMidnight(new Date())
  const exp = atMidnight(new Date(expiration + 'T00:00:00'))
  const ms = exp.getTime() - today.getTime()
  return Math.round(ms / 86_400_000)
}

// Bucket an item by how urgent its expiry is.
export function expiryStatus(expiration) {
  const days = daysUntil(expiration)
  if (days === Infinity) return 'none'
  if (days < 0) return 'expired'
  if (days === 0) return 'today'
  if (days <= SOON_THRESHOLD_DAYS) return 'soon'
  return 'fresh'
}

// Human friendly label for an expiry, e.g. "2 days left", "Expired 1 day ago".
export function expiryLabel(expiration) {
  const days = daysUntil(expiration)
  if (days === Infinity) return 'No expiry'
  if (days < -1) return `Expired ${Math.abs(days)} days ago`
  if (days === -1) return 'Expired yesterday'
  if (days === 0) return 'Expires today'
  if (days === 1) return 'Expires tomorrow'
  return `${days} days left`
}

// Sort comparator: soonest to expire first, no-expiry items last.
export function byExpiry(a, b) {
  return daysUntil(a.expiration) - daysUntil(b.expiration)
}

// True when an item should trigger an expiry alert (expired or expiring soon).
export function needsAttention(item) {
  const s = expiryStatus(item.expiration)
  return s === 'expired' || s === 'today' || s === 'soon'
}

export function todayISO() {
  const d = atMidnight(new Date())
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

// A YYYY-MM-DD date n days from today (local).
export function isoInDays(n) {
  const d = atMidnight(new Date())
  d.setDate(d.getDate() + n)
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}
