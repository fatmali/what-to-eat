import { useMemo, useState } from 'react'
import { CATEGORY_ORDER, CATEGORIES } from '../lib/constants.js'
import { byExpiry, needsAttention } from '../lib/expiry.js'
import { ItemCard } from './ItemCard.jsx'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'expiring', label: 'Expiring' },
  ...CATEGORY_ORDER.map((id) => ({ id, label: CATEGORIES[id].label })),
]

// The main fridge screen: filter chips + the sorted list of active items.
export function FridgeView({ items, onChangeQty, onMarkUsed, onAdd, initialFilter = 'all' }) {
  const [filter, setFilter] = useState(initialFilter)

  const counts = useMemo(() => {
    const c = { all: items.length, expiring: 0 }
    for (const id of CATEGORY_ORDER) c[id] = 0
    for (const it of items) {
      if (needsAttention(it)) c.expiring += 1
      c[it.category] = (c[it.category] ?? 0) + 1
    }
    return c
  }, [items])

  const visible = useMemo(() => {
    let list = items
    if (filter === 'expiring') list = items.filter(needsAttention)
    else if (filter !== 'all') list = items.filter((it) => it.category === filter)
    return [...list].sort(byExpiry)
  }, [items, filter])

  return (
    <section className="view">
      <div className="filters" role="tablist" aria-label="Filter fridge">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={`filter ${filter === f.id ? 'filter--on' : ''} ${
              f.id === 'expiring' && counts.expiring > 0 ? 'filter--alert' : ''
            }`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            {counts[f.id] > 0 && <span className="filter__count">{counts[f.id]}</span>}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState filter={filter} onAdd={onAdd} hasAny={items.length > 0} />
      ) : (
        <ul className="items">
          {visible.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onChangeQty={onChangeQty}
              onMarkUsed={onMarkUsed}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function EmptyState({ filter, onAdd, hasAny }) {
  if (filter === 'expiring') {
    return (
      <div className="empty">
        <div className="empty__emoji">🌱</div>
        <p className="empty__title">Nothing about to expire</p>
        <p className="empty__text">Everything in your fridge is still fresh. Nice.</p>
      </div>
    )
  }
  if (!hasAny) {
    return (
      <div className="empty">
        <div className="empty__emoji">🧊</div>
        <p className="empty__title">Your fridge is empty</p>
        <p className="empty__text">Add what you have so you always know what to eat.</p>
        <button className="btn btn--primary" onClick={onAdd}>
          + Add your first item
        </button>
      </div>
    )
  }
  return (
    <div className="empty">
      <div className="empty__emoji">🔍</div>
      <p className="empty__title">Nothing here</p>
      <p className="empty__text">No items in this category yet.</p>
    </div>
  )
}
