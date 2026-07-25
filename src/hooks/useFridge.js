import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadItems, saveItems } from '../lib/storage.js'
import { todayISO } from '../lib/expiry.js'

// Central store for the fridge. Owns the item list, persists every change to
// localStorage, and exposes the mutations the UI needs.
export function useFridge() {
  const [items, setItems] = useState(() => loadItems())

  useEffect(() => {
    saveItems(items)
  }, [items])

  const addItem = useCallback((data) => {
    const item = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      category: data.category,
      quantity: Number(data.quantity) || 1,
      unit: data.unit || 'pcs',
      expiration: data.expiration || '',
      addedAt: new Date().toISOString(),
      status: 'active',
    }
    setItems((prev) => [item, ...prev])
    return item
  }, [])

  const updateItem = useCallback((id, patch) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }, [])

  const changeQuantity = useCallback((id, delta) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it
        const next = Math.max(0, (Number(it.quantity) || 0) + delta)
        return { ...it, quantity: next }
      }),
    )
  }, [])

  // Mark an item as used (archived, not deleted, so it can be surfaced later).
  const markUsed = useCallback((id) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, status: 'used', usedAt: new Date().toISOString() } : it,
      ),
    )
  }, [])

  const restoreItem = useCallback((id) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: 'active', usedAt: undefined } : it)),
    )
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }, [])

  const active = useMemo(() => items.filter((it) => it.status === 'active'), [items])
  const used = useMemo(() => items.filter((it) => it.status === 'used'), [items])

  return {
    items,
    active,
    used,
    addItem,
    updateItem,
    changeQuantity,
    markUsed,
    restoreItem,
    removeItem,
    todayISO,
  }
}
