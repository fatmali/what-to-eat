import { useMemo, useState } from 'react'
import { useFridge } from './hooks/useFridge.js'
import { useNotifications } from './hooks/useNotifications.js'
import { needsAttention } from './lib/expiry.js'
import { FridgeView } from './components/FridgeView.jsx'
import { RecipesView } from './components/RecipesView.jsx'
import { AddItemSheet } from './components/AddItemSheet.jsx'
import { AlertBanner } from './components/AlertBanner.jsx'
import { NotifyButton } from './components/NotifyButton.jsx'

const DATE_FMT = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

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

  const today = DATE_FMT.format(new Date()).toUpperCase()

  // Jump to the ledger with the "Going off" filter selected.
  const reviewExpiring = () => {
    setTab('fridge')
    setExpiringFilter(true)
  }

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead__rule masthead__rule--top" />
        <div className="masthead__row">
          <div className="masthead__brand">
            <p className="masthead__kicker">The daily</p>
            <h1 className="masthead__title">
              What&nbsp;to&nbsp;<span className="masthead__eat">Eat</span>
            </h1>
          </div>
          <NotifyButton notify={notify} />
        </div>
        <div className="masthead__meta">
          <span>
            {fridge.active.length} item{fridge.active.length === 1 ? '' : 's'} in store
          </span>
          <span className="masthead__dot">✶</span>
          <span>{today}</span>
        </div>
        <div className="masthead__rule masthead__rule--double" />
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
        <button className="fab" onClick={() => setSheetOpen(true)}>
          <span className="fab__plus" aria-hidden="true">
            +
          </span>
          Log item
        </button>
      )}

      <nav className="footer-index" aria-label="Primary">
        <button
          className={`foot ${tab === 'fridge' ? 'foot--on' : ''}`}
          onClick={() => {
            setTab('fridge')
            setExpiringFilter(false)
          }}
          aria-current={tab === 'fridge'}
        >
          <span className="foot__no">i</span>
          <span className="foot__label">The Ledger</span>
          {attentionCount > 0 && <span className="foot__badge">{attentionCount}</span>}
        </button>
        <button
          className={`foot ${tab === 'recipes' ? 'foot--on' : ''}`}
          onClick={() => setTab('recipes')}
          aria-current={tab === 'recipes'}
        >
          <span className="foot__no">ii</span>
          <span className="foot__label">The Specials</span>
        </button>
      </nav>

      <AddItemSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onAdd={fridge.addItem} />
    </div>
  )
}
