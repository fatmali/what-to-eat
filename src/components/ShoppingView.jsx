import { useMemo } from 'react'
import { CATEGORIES, LOW_STOCK_THRESHOLD } from '../lib/constants.js'

// The shopping list: things you've crossed off (to buy) plus a heads-up on
// items running low in the fridge.
export function ShoppingView({ used, active, onRestock, onRemove, onCrossOff, onGoFridge }) {
  const toBuy = useMemo(
    () => [...used].sort((a, b) => (b.usedAt || '').localeCompare(a.usedAt || '')),
    [used],
  )
  const low = useMemo(
    () => active.filter((it) => (Number(it.quantity) || 0) <= LOW_STOCK_THRESHOLD),
    [active],
  )

  if (toBuy.length === 0 && low.length === 0) {
    return (
      <section className="view">
        <div className="empty">
          <div className="empty__mark">✽</div>
          <p className="empty__title">Nothing to buy</p>
          <p className="empty__text">
            Cross items off in the fridge and they'll land here as a shopping list.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="view">
      {toBuy.length > 0 && (
        <>
          <h2 className="list-head">
            To buy <span className="list-head__count">{toBuy.length}</span>
          </h2>
          <ul className="buy-list">
            {toBuy.map((item) => (
              <BuyRow key={item.id} item={item}>
                <button className="buy-got" onClick={() => onRestock(item.id)}>
                  Got it
                </button>
                <button
                  className="buy-x"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.name} from the list`}
                >
                  ×
                </button>
              </BuyRow>
            ))}
          </ul>
        </>
      )}

      {low.length > 0 && (
        <>
          <h2 className="list-head list-head--low">Running low</h2>
          <ul className="buy-list">
            {low.map((item) => (
              <BuyRow key={item.id} item={item} note={`${item.quantity} ${item.unit} left`}>
                <button className="buy-got buy-got--soft" onClick={() => onCrossOff(item.id)}>
                  Add to list
                </button>
              </BuyRow>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function BuyRow({ item, note, children }) {
  const cat = CATEGORIES[item.category] ?? CATEGORIES.food
  const initial = (item.name.trim()[0] ?? '?').toUpperCase()
  return (
    <li className={`buy-row buy-row--${item.category}`}>
      <div className="buy-thumb" aria-hidden="true">
        {item.image ? <img src={item.image} alt="" /> : initial}
      </div>
      <div className="buy-body">
        <p className="buy-name">{item.name}</p>
        <p className="buy-meta">{note ?? cat.label}</p>
      </div>
      <div className="buy-actions">{children}</div>
    </li>
  )
}
