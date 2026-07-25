import { useCallback, useEffect, useMemo, useState } from 'react'
import { MEALS_KEY } from '../lib/constants.js'
import { todayISO } from '../lib/expiry.js'

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(MEALS_KEY))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function isoOf(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

// Count consecutive logged days ending today (a day's grace: an unlogged today
// doesn't break a streak that ran through yesterday).
function computeStreak(days) {
  const DAY = 86_400_000
  let cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  if (!days.has(isoOf(cursor))) cursor = new Date(cursor.getTime() - DAY)
  let streak = 0
  while (days.has(isoOf(cursor))) {
    streak += 1
    cursor = new Date(cursor.getTime() - DAY)
  }
  return streak
}

// Tracks logged meals (for the streak / habit loop). Persisted to localStorage.
export function useMeals() {
  const [meals, setMeals] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(MEALS_KEY, JSON.stringify(meals))
    } catch {
      /* ignore */
    }
  }, [meals])

  const logMeal = useCallback((entry = {}) => {
    setMeals((prev) => [
      { id: crypto.randomUUID(), at: new Date().toISOString(), day: todayISO(), ...entry },
      ...prev,
    ])
  }, [])

  const days = useMemo(() => new Set(meals.map((m) => m.day)), [meals])
  const loggedToday = days.has(todayISO())
  const streak = useMemo(() => computeStreak(days), [days])

  return { meals, logMeal, loggedToday, streak }
}
