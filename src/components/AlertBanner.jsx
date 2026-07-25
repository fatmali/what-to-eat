import { expiryStatus } from '../lib/expiry.js'

// Sticky banner summarizing what needs eating. Tapping it jumps to the
// "Expiring" filter on the fridge screen.
export function AlertBanner({ items, onReview }) {
  const expired = items.filter((it) => expiryStatus(it.expiration) === 'expired')
  const soon = items.filter((it) => {
    const s = expiryStatus(it.expiration)
    return s === 'today' || s === 'soon'
  })

  if (expired.length === 0 && soon.length === 0) return null

  const parts = []
  if (expired.length) parts.push(`${expired.length} expired`)
  if (soon.length) parts.push(`${soon.length} expiring soon`)

  return (
    <button
      className={`alert ${expired.length ? 'alert--danger' : 'alert--warn'}`}
      onClick={onReview}
    >
      <span className="alert__icon" aria-hidden="true">
        {expired.length ? '⚠️' : '⏰'}
      </span>
      <span className="alert__text">
        {parts.join(' · ')} — tap to review
      </span>
      <span className="alert__chevron" aria-hidden="true">
        ›
      </span>
    </button>
  )
}
