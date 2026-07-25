import { CATEGORIES } from '../lib/constants.js'
import { ExpiryBadge } from './ExpiryBadge.jsx'

// A single ledger entry: monogram tile, name, meta line, expiry chip and the
// quantity / used controls.
export function ItemCard({ item, index = 0, onChangeQty, onMarkUsed }) {
  const cat = CATEGORIES[item.category] ?? CATEGORIES.food
  const initial = (item.name.trim()[0] ?? '?').toUpperCase()

  return (
    <li className={`entry entry--${item.category}`} style={{ '--i': index }}>
      <div className="entry__mono" aria-hidden="true">
        {initial}
      </div>

      <div className="entry__col">
        <div className="entry__top">
          <h3 className="entry__name">{item.name}</h3>
          <ExpiryBadge expiration={item.expiration} />
        </div>

        <p className="entry__meta">
          <span className="entry__cat">{cat.label}</span>
          <span className="entry__sep">·</span>
          <span className="entry__qty">
            {item.quantity}&nbsp;{item.unit}
          </span>
        </p>

        <div className="entry__tools">
          <div className="stepper" role="group" aria-label={`Quantity of ${item.name}`}>
            <button
              className="stepper__btn"
              onClick={() => onChangeQty(item.id, -1)}
              aria-label={`Decrease ${item.name}`}
              disabled={item.quantity <= 0}
            >
              –
            </button>
            <span className="stepper__val">
              {item.quantity}
              <i>{item.unit}</i>
            </span>
            <button
              className="stepper__btn"
              onClick={() => onChangeQty(item.id, 1)}
              aria-label={`Increase ${item.name}`}
            >
              +
            </button>
          </div>
          <button className="entry__used" onClick={() => onMarkUsed(item.id)}>
            Cross&nbsp;off
          </button>
        </div>
      </div>
    </li>
  )
}
