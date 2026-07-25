import { useMemo, useState } from 'react'
import { useFridge } from './hooks/useFridge.js'
import { useNotifications } from './hooks/useNotifications.js'
import { needsAttention } from './lib/expiry.js'
import { FridgeView } from './components/FridgeView.jsx'
import { RecipesView } from './components/RecipesView.jsx'
import { AddItemSheet } from './components/AddItemSheet.jsx'
import { AlertBanner } from './components/AlertBanner.jsx'
import { NotifyButton } from './components/NotifyButton.jsx'

export default function App() {
  const fridge = useFridge()
  const notify = useNotifications(fridge.active)
  const [tab, setTab] = useState('fridge')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [expiringFilter, setExpiringFilter] = useState(false)

  const attentionCount = useMemo(
    () => fridge.active.filter(needsAttention).length,
    [fridge.active],
  )

  // Jump to the fridge tab with the "Expiring" filter selected.
  const reviewExpiring = () => {
    setTab('fridge')
    setExpiringFilter(true)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__logo" aria-hidden="true">🍴</span>
          <div>
            <h1 className="topbar__title">What To Eat</h1>
            <p className="topbar__sub">
              {fridge.active.length} item{fridge.active.length === 1 ? '' : 's'} in your fridge
            </p>
          </div>
        </div>
        <NotifyButton notify={notify} />
      </header>

      <main className="main">
        {tab === 'fridge' && (
          <>
            <AlertBanner items={fridge.active} onReview={reviewExpiring} />
            <FridgeView
              key={expiringFilter ? 'expiring' : 'default'}
              items={fridge.active}
              onChangeQty={fridge.changeQuantity}
              onMarkUsed={fridge.markUsed}
              onAdd={() => setSheetOpen(true)}
              initialFilter={expiringFilter ? 'expiring' : 'all'}
            />
          </>
        )}
        {tab === 'recipes' && <RecipesView />}
      </main>

      {tab === 'fridge' && (
        <button className="fab" onClick={() => setSheetOpen(true)} aria-label="Add item">
          +
        </button>
      )}

      <nav className="tabbar" aria-label="Primary">
        <button
          className={`tab ${tab === 'fridge' ? 'tab--on' : ''}`}
          onClick={() => {
            setTab('fridge')
            setExpiringFilter(false)
          }}
          aria-current={tab === 'fridge'}
        >
          <span className="tab__icon" aria-hidden="true">🧊</span>
          <span className="tab__label">Fridge</span>
          {attentionCount > 0 && <span className="tab__badge">{attentionCount}</span>}
        </button>
        <button
          className={`tab ${tab === 'recipes' ? 'tab--on' : ''}`}
          onClick={() => setTab('recipes')}
          aria-current={tab === 'recipes'}
        >
          <span className="tab__icon" aria-hidden="true">📖</span>
          <span className="tab__label">Recipes</span>
        </button>
      </nav>

      <AddItemSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onAdd={fridge.addItem} />
    </div>
  )
}
