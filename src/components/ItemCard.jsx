import { CATEGORIES } from '../lib/constants.js'
import { ExpiryBadge } from './ExpiryBadge.jsx'
import { CameraIcon } from './CameraIcon.jsx'

// A single ledger entry: monogram tile, name, meta line, expiry chip and the
// quantity / used controls.
export function ItemCard({ item, index = 0, onChangeQty, onMarkUsed, onEdit }) {
  const cat = CATEGORIES[item.category] ?? CATEGORIES.food
  const initial = (item.name.trim()[0] ?? '?').toUpperCase()

  return (
    <li className={`entry entry--${item.category}`} style={{ '--i': index }}>
      <button
        className={`entry__mono ${item.image ? 'entry__mono--photo' : ''}`}
        onClick={() => onEdit(item)}
        aria-label={`Edit ${item.name}`}
      >
        {item.image ? (
          <img className="entry__photo" src={item.image} alt="" loading="lazy" />
        ) : (
          <>
            {initial}
            <span className="entry__cam">
              <CameraIcon className="entry__cam-svg" />
            </span>
          </>
        )}
      </button>

      <div className="entry__col">
        <div className="entry__top">
          <button className="entry__name" onClick={() => onEdit(item)}>
            {item.name}
            <span className="entry__edit" aria-hidden="true">
              ✎
            </span>
          </button>
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
