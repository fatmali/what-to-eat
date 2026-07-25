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

// Bottom-sheet modal for adding a new fridge item.
export function AddItemSheet({ open, onClose, onAdd }) {
  const [form, setForm] = useState(empty)
  const nameRef = useRef(null)

  useEffect(() => {
    if (open) {
      setForm(empty)
      // Focus the name field once the sheet has animated in.
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
    <div className="sheet__scrim" onClick={onClose}>
      <form
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-label="Add item to fridge"
      >
        <div className="sheet__grip" aria-hidden="true" />
        <h2 className="sheet__title">Add to fridge</h2>

        <label className="field">
          <span className="field__label">Name</span>
          <input
            ref={nameRef}
            className="field__input"
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Carrots, Lasagna, Curry"
            autoComplete="off"
          />
        </label>

        <div className="field">
          <span className="field__label">Category</span>
          <div className="chips">
            {CATEGORY_ORDER.map((id) => (
              <button
                type="button"
                key={id}
                className={`chip ${form.category === id ? 'chip--on' : ''}`}
                onClick={() => setForm((f) => ({ ...f, category: id }))}
              >
                <span aria-hidden="true">{CATEGORIES[id].emoji}</span> {CATEGORIES[id].label}
              </button>
            ))}
          </div>
        </div>

        <div className="field-row">
          <label className="field field--qty">
            <span className="field__label">Quantity</span>
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
          <span className="field__label">Expiration date</span>
          <input
            className="field__input"
            type="date"
            min={todayISO()}
            value={form.expiration}
            onChange={set('expiration')}
          />
          <span className="field__hint">Leave empty if it doesn't really expire.</span>
        </label>

        <div className="sheet__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            Add item
          </button>
        </div>
      </form>
    </div>
  )
}
