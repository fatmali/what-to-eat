import { daysUntil, expiryStatus } from '../lib/expiry.js'

// Compact, stamp-style expiry label for a ledger row.
function stampLabel(expiration) {
  const d = daysUntil(expiration)
  if (d === Infinity) return 'KEEPS'
  if (d < -1) return `${Math.abs(d)}d OVERDUE`
  if (d === -1) return '1d OVERDUE'
  if (d === 0) return 'EAT TODAY'
  if (d === 1) return 'EAT BY TMRW'
  if (d <= 3) return `${d} DAYS LEFT`
  return `${d} DAYS`
}

// A small rubber-stamp pill communicating expiry urgency.
export function ExpiryBadge({ expiration }) {
  const status = expiryStatus(expiration)
  return (
    <span className={`stamp stamp--${status}`}>
      {stampLabel(expiration)}
    </span>
  )
}
