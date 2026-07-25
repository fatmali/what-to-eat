import { useMemo, useState } from 'react'
import { CATEGORY_ORDER, CATEGORIES } from '../lib/constants.js'
import { byExpiry, needsAttention } from '../lib/expiry.js'
import { ItemCard } from './ItemCard.jsx'

const FILTERS = [
  { id: 'all', label: 'Everything' },
  { id: 'expiring', label: 'Going off' },
  ...CATEGORY_ORDER.map((id) => ({ id, label: CATEGORIES[id].label })),
]

// The main ledger screen: an index of filters + the sorted list of entries.
export function FridgeView({ items, onChangeQty, onMarkUsed, onEdit, onAdd, initialFilter = 'all' }) {
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
      <div className="index" role="tablist" aria-label="Filter the ledger">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={`index__tab ${filter === f.id ? 'index__tab--on' : ''} ${
              f.id === 'expiring' && counts.expiring > 0 ? 'index__tab--alert' : ''
            }`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            {counts[f.id] > 0 && <sup className="index__count">{counts[f.id]}</sup>}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState filter={filter} onAdd={onAdd} hasAny={items.length > 0} />
      ) : (
        <ul className="entries">
          {visible.map((item, i) => (
            <ItemCard
              key={item.id}
              item={item}
              index={i}
              onChangeQty={onChangeQty}
              onMarkUsed={onMarkUsed}
              onEdit={onEdit}
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
        <div className="empty__mark">✽</div>
        <p className="empty__title">Nothing going off</p>
        <p className="empty__text">The whole ledger is fresh. A rare and beautiful thing.</p>
      </div>
    )
  }
  if (!hasAny) {
    return (
      <div className="empty">
        <div className="empty__mark">✵</div>
        <p className="empty__title">The ledger is bare</p>
        <p className="empty__text">Write in what you have, so you always know what to eat.</p>
        <button className="btn btn--primary" onClick={onAdd}>
          Log the first item
        </button>
      </div>
    )
  }
  return (
    <div className="empty">
      <div className="empty__mark">◦</div>
      <p className="empty__title">No entries here</p>
      <p className="empty__text">Nothing filed under this heading yet.</p>
    </div>
  )
}
