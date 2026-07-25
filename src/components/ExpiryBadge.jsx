import { daysUntil, expiryStatus } from '../lib/expiry.js'

// Compact, quiet expiry label for a ledger row.
function shortLabel(expiration) {
  const d = daysUntil(expiration)
  if (d === Infinity) return 'Keeps'
  if (d < -1) return `${Math.abs(d)} days over`
  if (d === -1) return '1 day over'
  if (d === 0) return 'Today'
  if (d === 1) return 'Tomorrow'
  return `${d} days`
}

// A soft, rounded chip communicating expiry urgency (no stamp styling).
export function ExpiryBadge({ expiration }) {
  const status = expiryStatus(expiration)
  return (
    <span className={`chip-exp chip-exp--${status}`}>
      <span className="chip-exp__dot" aria-hidden="true" />
      {shortLabel(expiration)}
    </span>
  )
}
