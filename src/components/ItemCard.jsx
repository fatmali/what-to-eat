import { CATEGORIES } from '../lib/constants.js'
import { expiryStatus } from '../lib/expiry.js'
import { ExpiryBadge } from './ExpiryBadge.jsx'

// A single fridge item: name, quantity stepper, expiry badge, and actions.
export function ItemCard({ item, onChangeQty, onMarkUsed }) {
  const cat = CATEGORIES[item.category] ?? CATEGORIES.food
  const status = expiryStatus(item.expiration)
  const attention = status === 'expired' || status === 'today' || status === 'soon'

  return (
    <li className={`item ${attention ? 'item--attention' : ''}`}>
      <div className="item__emoji" aria-hidden="true">
        {cat.emoji}
      </div>

      <div className="item__body">
        <h3 className="item__name">{item.name}</h3>
        <div className="item__meta">
          <ExpiryBadge expiration={item.expiration} />
          <span className="item__cat">{cat.label}</span>
        </div>
      </div>

      <div className="item__actions">
        <div className="stepper" role="group" aria-label={`Quantity of ${item.name}`}>
          <button
            className="stepper__btn"
            onClick={() => onChangeQty(item.id, -1)}
            aria-label={`Decrease ${item.name}`}
            disabled={item.quantity <= 0}
          >
            −
          </button>
          <span className="stepper__value">
            {item.quantity}
            <small>{item.unit}</small>
          </span>
          <button
            className="stepper__btn"
            onClick={() => onChangeQty(item.id, 1)}
            aria-label={`Increase ${item.name}`}
          >
            +
          </button>
        </div>
        <button className="item__used" onClick={() => onMarkUsed(item.id)}>
          ✓ Used
        </button>
      </div>
    </li>
  )
}
