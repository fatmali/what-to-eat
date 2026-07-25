import { useEffect, useRef, useState } from 'react'
import { byExpiry } from '../lib/expiry.js'
import { defaultExpiration } from '../lib/shelfLife.js'
import { fileToThumbnail } from '../lib/image.js'
import { CameraIcon } from './CameraIcon.jsx'

const AMOUNTS = [
  { id: 'bit', label: 'A bit' },
  { id: 'half', label: 'Half' },
  { id: 'all', label: 'Used up' },
]

// "Cooked today" quick-log: pick what you used and roughly how much (it's
// deducted from the fridge), optionally save leftovers, and record the meal so
// the streak keeps going.
export function CookSheet({ open, onClose, active, markUsed, updateItem, addItem, logMeal }) {
  const [picks, setPicks] = useState({}) // id -> 'bit' | 'half' | 'all'
  const [leftoverOn, setLeftoverOn] = useState(false)
  const [leftover, setLeftover] = useState({ name: '', image: '' })
  const photoRef = useRef(null)

  useEffect(() => {
    if (open) {
      setPicks({})
      setLeftoverOn(false)
      setLeftover({ name: '', image: '' })
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const items = [...active].sort(byExpiry)
  const setAmount = (id, amount) =>
    setPicks((p) => (p[id] === amount ? removeKey(p, id) : { ...p, [id]: amount }))

  const onLeftoverPhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const thumb = await fileToThumbnail(file)
      setLeftover((l) => ({ ...l, image: thumb }))
    } catch {
      /* ignore */
    }
  }

  const applyAmount = (item, amount) => {
    if (amount === 'all') {
      markUsed(item.id)
      return
    }
    const q = Number(item.quantity) || 0
    const next = amount === 'half' ? Math.floor(q / 2) : q - 1
    if (next <= 0) markUsed(item.id)
    else updateItem(item.id, { quantity: next })
  }

  const pickedIds = Object.keys(picks)
  const commit = () => {
    for (const id of pickedIds) {
      const item = items.find((it) => it.id === id)
      if (item) applyAmount(item, picks[id])
    }
    let leftoverName = ''
    if (leftoverOn && leftover.name.trim()) {
      leftoverName = leftover.name.trim()
      addItem({
        name: leftoverName,
        category: 'leftovers',
        quantity: 1,
        unit: 'servings',
        expiration: defaultExpiration(leftoverName, 'leftovers'),
        image: leftover.image,
      })
    }
    logMeal({ used: pickedIds.length, leftover: leftoverName || undefined })
    onClose()
  }

  return (
    <div className="scrim" onClick={onClose}>
      <div
        className="ticket ticket--cook"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Log what you cooked"
      >
        <div className="ticket__grip" aria-hidden="true" />
        <div className="ticket__head">
          <h2 className="ticket__title">Cooked today?</h2>
          <span className="ticket__no">{pickedIds.length} used</span>
        </div>

        <p className="cook-hint">Tap what you used and roughly how much — it comes off the fridge.</p>

        {items.length === 0 ? (
          <p className="muted">Your fridge is empty — nothing to log yet.</p>
        ) : (
          <ul className="cook-list">
            {items.map((item) => (
              <li key={item.id} className={`cook-row ${picks[item.id] ? 'cook-row--on' : ''}`}>
                <div className="cook-row__name">
                  <span className="cook-row__title">{item.name}</span>
                  <span className="cook-row__qty">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <div className="cook-amounts" role="group" aria-label={`How much ${item.name}`}>
                  {AMOUNTS.map((a) => (
                    <button
                      key={a.id}
                      className={`cook-amt ${picks[item.id] === a.id ? 'cook-amt--on' : ''}`}
                      onClick={() => setAmount(item.id, a.id)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="cook-leftover">
          <button
            className={`cook-toggle ${leftoverOn ? 'cook-toggle--on' : ''}`}
            onClick={() => setLeftoverOn((v) => !v)}
            aria-pressed={leftoverOn}
          >
            <span className="cook-toggle__box" aria-hidden="true">
              {leftoverOn ? '✓' : ''}
            </span>
            Made leftovers?
          </button>
          {leftoverOn && (
            <div className="cook-leftover__row">
              <button
                className={`scan-photo ${leftover.image ? 'scan-photo--has' : ''}`}
                onClick={() => photoRef.current?.click()}
                aria-label="Add a photo of the leftovers"
              >
                {leftover.image ? <img src={leftover.image} alt="" /> : <CameraIcon className="scan-photo__icon" />}
              </button>
              <input
                className="scan-name"
                value={leftover.name}
                onChange={(e) => setLeftover((l) => ({ ...l, name: e.target.value }))}
                placeholder="Leftover curry, roast veg…"
              />
            </div>
          )}
          <input ref={photoRef} type="file" accept="image/*" capture="environment" onChange={onLeftoverPhoto} hidden />
        </div>

        <div className="ticket__actions">
          <button className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary" onClick={commit}>
            Log meal
          </button>
        </div>
      </div>
    </div>
  )
}

function removeKey(obj, key) {
  const next = { ...obj }
  delete next[key]
  return next
}
