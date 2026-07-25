import { useState } from 'react'
import { STAPLES, guessCategory } from '../lib/staples.js'
import { defaultExpiration } from '../lib/shelfLife.js'

// First-run welcome. Three low-friction ways to stock the fridge fast: scan a
// receipt, tap common staples, or paste a list. Expiries are auto-estimated so
// nobody has to type dates during setup.
export function Onboarding({ onScan, onAddMany, onSeed, onDismiss }) {
  const [mode, setMode] = useState('menu') // menu | staples | paste

  return (
    <div className="onb">
      <div className="onb__inner">
        {mode === 'menu' && <Menu setMode={setMode} onScan={onScan} />}
        {mode === 'staples' && (
          <Staples onBack={() => setMode('menu')} onAddMany={onAddMany} onDone={onDismiss} />
        )}
        {mode === 'paste' && (
          <Paste onBack={() => setMode('menu')} onAddMany={onAddMany} onDone={onDismiss} />
        )}

        {mode === 'menu' && (
          <div className="onb__foot">
            <button className="onb__link" onClick={onSeed}>
              Explore with sample data
            </button>
            <span className="onb__dot" aria-hidden="true" />
            <button className="onb__link" onClick={onDismiss}>
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Menu({ setMode, onScan }) {
  return (
    <>
      <p className="onb__kicker">Welcome</p>
      <h1 className="onb__title">
        What's in your <span className="onb__accent">fridge?</span>
      </h1>
      <p className="onb__lead">
        You don't need to log everything. Start with what you just bought or what's about to
        go off — dates are filled in for you.
      </p>
      <div className="onb__options">
        <button className="onb-card onb-card--primary" onClick={onScan}>
          <span className="onb-card__title">Scan a receipt</span>
          <span className="onb-card__sub">Add a whole shop in seconds</span>
        </button>
        <button className="onb-card" onClick={() => setMode('staples')}>
          <span className="onb-card__title">Tap common staples</span>
          <span className="onb-card__sub">Pick from a list — no typing</span>
        </button>
        <button className="onb-card" onClick={() => setMode('paste')}>
          <span className="onb-card__title">Paste a list</span>
          <span className="onb-card__sub">“milk, eggs, spinach…”</span>
        </button>
      </div>
    </>
  )
}

function Staples({ onBack, onAddMany, onDone }) {
  const [picked, setPicked] = useState(() => new Set())
  const toggle = (name) =>
    setPicked((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })

  const add = () => {
    const items = [...picked].map((name) => ({
      name,
      category: 'food',
      quantity: 1,
      expiration: defaultExpiration(name, 'food'),
    }))
    if (items.length) onAddMany(items)
    onDone()
  }

  return (
    <>
      <button className="onb__back" onClick={onBack}>
        ← Back
      </button>
      <h2 className="onb__h2">Tap what you have</h2>
      <div className="onb-grid">
        {STAPLES.map((name) => (
          <button
            key={name}
            className={`onb-chip ${picked.has(name) ? 'onb-chip--on' : ''}`}
            onClick={() => toggle(name)}
            aria-pressed={picked.has(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <button className="btn btn--primary btn--block onb__cta" onClick={add} disabled={picked.size === 0}>
        Add {picked.size || ''} to fridge
      </button>
    </>
  )
}

function Paste({ onBack, onAddMany, onDone }) {
  const [text, setText] = useState('')

  const parse = () =>
    [...new Set(
      text
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1),
    )]

  const items = parse()
  const add = () => {
    const built = items.map((name) => ({
      name,
      category: guessCategory(name),
      quantity: 1,
      expiration: defaultExpiration(name, guessCategory(name)),
    }))
    if (built.length) onAddMany(built)
    onDone()
  }

  return (
    <>
      <button className="onb__back" onClick={onBack}>
        ← Back
      </button>
      <h2 className="onb__h2">Paste your list</h2>
      <p className="onb__hint">One per line, or separated by commas.</p>
      <textarea
        className="onb-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'milk\neggs\nspinach\nchicken thighs\nleftover curry'}
        autoFocus
      />
      <button
        className="btn btn--primary btn--block onb__cta"
        onClick={add}
        disabled={items.length === 0}
      >
        Add {items.length || ''} to fridge
      </button>
    </>
  )
}
