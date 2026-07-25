import { expiryStatus } from '../lib/expiry.js'

// A stamped notice slip summarizing what needs eating. Tapping it jumps to the
// "Going off" filter.
export function AlertBanner({ items, onReview }) {
  const expired = items.filter((it) => expiryStatus(it.expiration) === 'expired')
  const soon = items.filter((it) => {
    const s = expiryStatus(it.expiration)
    return s === 'today' || s === 'soon'
  })

  if (expired.length === 0 && soon.length === 0) return null

  const parts = []
  if (expired.length) parts.push(`${expired.length} overdue`)
  if (soon.length) parts.push(`${soon.length} on the clock`)

  return (
    <button
      className={`notice ${expired.length ? 'notice--danger' : 'notice--warn'}`}
      onClick={onReview}
    >
      <span className="notice__mark" aria-hidden="true">
        {expired.length ? '!' : '⏳'}
      </span>
      <span className="notice__body">
        <span className="notice__kicker">Kitchen bulletin</span>
        <span className="notice__text">{parts.join(' · ')} — review the ledger</span>
      </span>
      <span className="notice__arrow" aria-hidden="true">
        →
      </span>
    </button>
  )
}
