import { useEffect, useRef, useState } from 'react'
import { CATEGORY_ORDER, CATEGORIES } from '../lib/constants.js'
import { recognizeText } from '../lib/ocr.js'
import { parseReceipt } from '../lib/receipt.js'
import { todayISO } from '../lib/expiry.js'
import { defaultExpiration } from '../lib/shelfLife.js'
import { fileToThumbnail } from '../lib/image.js'
import { CameraIcon } from './CameraIcon.jsx'

let uid = 0

// Bottom-sheet flow: photograph a receipt → OCR on-device → review/edit the
// detected items (name, category, quantity, expiry) → file the chosen ones.
export function ScanReceiptSheet({ open, onClose, onAdd }) {
  const [phase, setPhase] = useState('intro') // intro | working | review | error
  const [progress, setProgress] = useState(0)
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const fileRef = useRef(null)
  const photoRef = useRef(null)
  const photoForId = useRef(null)

  useEffect(() => {
    if (open) {
      setPhase('intro')
      setProgress(0)
      setRows([])
      setError('')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const onPick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return
    const hadRows = rows.length > 0
    setPhase('working')
    setProgress(0)
    try {
      const text = await recognizeText(file, setProgress)
      const items = parseReceipt(text)
      if (items.length === 0) {
        // On a first scan show the error screen; on a re-scan keep what we have.
        if (hadRows) {
          setError('')
          setPhase('review')
        } else {
          setError("Couldn't make out any items. Try a flatter, brighter photo.")
          setPhase('error')
        }
        return
      }
      setRows((prev) => {
        const seen = new Set(prev.map((r) => r.name.trim().toLowerCase()))
        const fresh = items
          .filter((it) => !seen.has(it.name.trim().toLowerCase()))
          .map((it) => ({
            id: ++uid,
            include: true,
            name: it.name,
            category: 'food',
            quantity: it.quantity,
            expiration: defaultExpiration(it.name, 'food'),
            image: '',
          }))
        return [...prev, ...fresh]
      })
      setPhase('review')
    } catch (err) {
      console.error(err)
      if (hadRows) {
        setPhase('review')
      } else {
        setError('Something went wrong reading that image.')
        setPhase('error')
      }
    }
  }

  const patch = (id, next) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...next } : r)))
  const removeRow = (id) => setRows((rs) => rs.filter((r) => r.id !== id))

  const openPhoto = (id) => {
    photoForId.current = id
    photoRef.current?.click()
  }
  const onRowPhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    const id = photoForId.current
    if (!file || id == null) return
    try {
      const thumb = await fileToThumbnail(file)
      patch(id, { image: thumb })
    } catch {
      /* ignore a bad image */
    }
  }
  const cycleCat = (id) =>
    setRows((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r
        const i = CATEGORY_ORDER.indexOf(r.category)
        return { ...r, category: CATEGORY_ORDER[(i + 1) % CATEGORY_ORDER.length] }
      }),
    )

  const chosen = rows.filter((r) => r.include && r.name.trim())
  const commit = () => {
    for (const r of chosen) {
      onAdd({
        name: r.name,
        category: r.category,
        quantity: r.quantity,
        unit: 'pcs',
        expiration: r.expiration || '',
        image: r.image || '',
      })
    }
    onClose()
  }

  return (
    <div className="scrim" onClick={onClose}>
      <div
        className="ticket ticket--scan"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Scan a receipt"
      >
        <div className="ticket__grip" aria-hidden="true" />
        <div className="ticket__head">
          <h2 className="ticket__title">Scan a receipt</h2>
          {phase === 'review' && (
            <span className="ticket__no">
              {rows.length} item{rows.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPick}
          hidden
        />
        <input ref={photoRef} type="file" accept="image/*" capture="environment" onChange={onRowPhoto} hidden />

        {phase === 'intro' && (
          <div className="scan-intro">
            <p className="scan-intro__lead">
              Snap your grocery receipt and it'll be read on your device — the photo
              never leaves your phone.
            </p>
            <button className="btn btn--primary btn--block" onClick={() => fileRef.current?.click()}>
              Take / choose photo
            </button>
            <p className="scan-intro__hint">Works best on a flat, well-lit receipt.</p>
          </div>
        )}

        {phase === 'working' && (
          <div className="scan-working">
            <div className="scan-spinner" aria-hidden="true" />
            <p className="scan-working__label">Reading your receipt…</p>
            <div className="scan-bar">
              <div className="scan-bar__fill" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="scan-intro">
            <p className="scan-intro__lead">{error}</p>
            <button className="btn btn--primary btn--block" onClick={() => fileRef.current?.click()}>
              Try another photo
            </button>
          </div>
        )}

        {phase === 'review' && (
          <>
            <div className="scan-review__top">
              <p className="scan-review__hint">Tick what to add · edit names, category, expiry.</p>
              <button className="scan-again" onClick={() => fileRef.current?.click()}>
                + Scan another
              </button>
            </div>
            <ul className="scan-list">
              {rows.map((r) => {
                const cat = CATEGORIES[r.category]
                return (
                  <li key={r.id} className={`scan-row ${r.include ? '' : 'scan-row--off'}`}>
                    <div className="scan-row__main">
                      <button
                        className={`scan-check ${r.include ? 'scan-check--on' : ''}`}
                        onClick={() => patch(r.id, { include: !r.include })}
                        aria-pressed={r.include}
                        aria-label={r.include ? `Exclude ${r.name}` : `Include ${r.name}`}
                      >
                        {r.include ? '✓' : ''}
                      </button>
                      <button
                        className={`scan-photo ${r.image ? 'scan-photo--has' : ''}`}
                        onClick={() => openPhoto(r.id)}
                        aria-label={`Add a photo for ${r.name}`}
                      >
                        {r.image ? (
                          <img src={r.image} alt="" />
                        ) : (
                          <CameraIcon className="scan-photo__icon" />
                        )}
                      </button>
                      <input
                        className="scan-name"
                        value={r.name}
                        onChange={(e) => patch(r.id, { name: e.target.value })}
                        aria-label="Item name"
                      />
                      <button
                        className="scan-remove"
                        onClick={() => removeRow(r.id)}
                        aria-label={`Remove ${r.name}`}
                      >
                        ×
                      </button>
                    </div>
                    <div className="scan-row__meta">
                      <button
                        className={`scan-cat scan-cat--${r.category}`}
                        onClick={() => cycleCat(r.id)}
                        aria-label={`Category: ${cat.label}. Tap to change.`}
                      >
                        <span className="scan-cat__dot" aria-hidden="true" />
                        {cat.label}
                      </button>
                      <div className="scan-qty">
                        <button
                          onClick={() => patch(r.id, { quantity: Math.max(1, r.quantity - 1) })}
                          aria-label="Decrease quantity"
                        >
                          –
                        </button>
                        <span>{r.quantity}</span>
                        <button
                          onClick={() => patch(r.id, { quantity: Math.min(99, r.quantity + 1) })}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <input
                        className="scan-date"
                        type="date"
                        min={todayISO()}
                        value={r.expiration}
                        onChange={(e) => patch(r.id, { expiration: e.target.value })}
                        aria-label={`Expiry date for ${r.name}`}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="ticket__actions">
              <button className="btn btn--ghost" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn--primary" onClick={commit} disabled={chosen.length === 0}>
                Add {chosen.length || ''} to fridge
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
