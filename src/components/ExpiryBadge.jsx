import { expiryStatus, expiryLabel } from '../lib/expiry.js'

// Small colored pill that communicates how urgent an item's expiry is.
export function ExpiryBadge({ expiration }) {
  const status = expiryStatus(expiration)
  return (
    <span className={`badge badge--${status}`}>
      <span className="badge__dot" aria-hidden="true" />
      {expiryLabel(expiration)}
    </span>
  )
}
