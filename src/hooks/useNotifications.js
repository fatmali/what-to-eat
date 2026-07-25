import { useCallback, useEffect, useRef, useState } from 'react'
import { NOTIFIED_KEY, NOTIFY_PREF_KEY } from '../lib/constants.js'
import { needsAttention, expiryLabel, todayISO } from '../lib/expiry.js'

const supported = typeof window !== 'undefined' && 'Notification' in window

function loadNotified() {
  try {
    return JSON.parse(localStorage.getItem(NOTIFIED_KEY)) || {}
  } catch {
    return {}
  }
}

function saveNotified(map) {
  try {
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

// Manages OS-level expiry reminders via the Web Notifications API. Permission
// and a user preference toggle gate whether anything fires. De-dupes so each
// item alerts at most once per day.
export function useNotifications(activeItems) {
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported')
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(NOTIFY_PREF_KEY) === 'true'
    } catch {
      return false
    }
  })
  const itemsRef = useRef(activeItems)
  itemsRef.current = activeItems

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFY_PREF_KEY, String(enabled))
    } catch {
      /* ignore */
    }
  }, [enabled])

  const requestPermission = useCallback(async () => {
    if (!supported) return 'unsupported'
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') setEnabled(true)
    return result
  }, [])

  const disable = useCallback(() => setEnabled(false), [])

  // Fire a single summary notification for items that newly need attention.
  const check = useCallback(() => {
    if (!supported || !enabled || Notification.permission !== 'granted') return
    const today = todayISO()
    const notified = loadNotified()
    const due = itemsRef.current.filter(
      (it) => needsAttention(it) && notified[it.id] !== today,
    )
    if (due.length === 0) return

    const title =
      due.length === 1
        ? `${due[0].name} — ${expiryLabel(due[0].expiration).toLowerCase()}`
        : `${due.length} items need eating soon`
    const body =
      due.length === 1
        ? 'Open What To Eat to use it before it goes off.'
        : due
            .slice(0, 4)
            .map((it) => `${it.name} · ${expiryLabel(it.expiration).toLowerCase()}`)
            .join('\n')

    try {
      const n = new Notification(title, {
        body,
        tag: 'whattoeat-expiry',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
      })
      n.onclick = () => {
        window.focus()
        n.close()
      }
    } catch (err) {
      console.warn('Notification failed', err)
    }

    for (const it of due) notified[it.id] = today
    saveNotified(notified)
  }, [enabled])

  // Check on enable, when items change, when the tab regains focus, and hourly
  // (so a day rollover eventually re-alerts).
  useEffect(() => {
    if (!enabled) return
    check()
    const onVisible = () => document.visibilityState === 'visible' && check()
    document.addEventListener('visibilitychange', onVisible)
    const id = setInterval(check, 60 * 60 * 1000)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(id)
    }
  }, [enabled, activeItems, check])

  return { supported, permission, enabled, requestPermission, disable }
}
