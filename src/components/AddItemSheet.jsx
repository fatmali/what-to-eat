import { useEffect, useRef, useState } from 'react'
import { CATEGORY_ORDER, CATEGORIES, UNITS } from '../lib/constants.js'
import { todayISO } from '../lib/expiry.js'

const empty = {
  name: '',
  category: 'food',
  quantity: '1',
  unit: 'pcs',
  expiration: '',
}

// A bottom-sheet "order ticket" for writing a new item into the ledger.
export function AddItemSheet({ open, onClose, onAdd }) {
  const [form, setForm] = useState(empty)
  const nameRef = useRef(null)

  useEffect(() => {
    if (open) {
      setForm(empty)
      const t = setTimeout(() => nameRef.current?.focus(), 120)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      nameRef.current?.focus()
      return
    }
    onAdd(form)
    onClose()
  }

  return (
    <div className="scrim" onClick={onClose}>
      <form
        className="ticket"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-label="Add item to the ledger"
      >
        <div className="ticket__grip" aria-hidden="true" />
        <div className="ticket__head">
          <h2 className="ticket__title">New entry</h2>
          <span className="ticket__no">{todayISO()}</span>
        </div>

        <label className="field">
          <span className="field__label">Item</span>
          <input
            ref={nameRef}
            className="field__input field__input--display"
            value={form.name}
            onChange={set('name')}
            placeholder="Carrots, lasagne, that curry…"
            autoComplete="off"
          />
        </label>

        <div className="field">
          <span className="field__label">Filed under</span>
          <div className="chips">
            {CATEGORY_ORDER.map((id) => (
              <button
                type="button"
                key={id}
                className={`chip chip--${id} ${form.category === id ? 'chip--on' : ''}`}
                onClick={() => setForm((f) => ({ ...f, category: id }))}
              >
                <span className="chip__dot" aria-hidden="true" /> {CATEGORIES[id].label}
              </button>
            ))}
          </div>
        </div>

        <div className="field-row">
          <label className="field field--qty">
            <span className="field__label">Qty</span>
            <input
              className="field__input"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={form.quantity}
              onChange={set('quantity')}
            />
          </label>
          <label className="field field--unit">
            <span className="field__label">Unit</span>
            <select className="field__input" value={form.unit} onChange={set('unit')}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span className="field__label">Best before</span>
          <input
            className="field__input"
            type="date"
            min={todayISO()}
            value={form.expiration}
            onChange={set('expiration')}
          />
          <span className="field__hint">Leave blank for things that keep.</span>
        </label>

        <div className="ticket__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Discard
          </button>
          <button type="submit" className="btn btn--primary">
            File it
          </button>
        </div>
      </form>
    </div>
  )
}
