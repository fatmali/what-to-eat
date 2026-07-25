import { useEffect, useState } from 'react'

// Deferred feature. Reads the mock recipes.json (which a future job will
// populate based on the fridge) and renders whatever is there. Kept intentionally
// simple — matching / ranking logic is a later task.
export function RecipesView() {
  const [state, setState] = useState({ status: 'loading', recipes: [], generatedAt: null })

  useEffect(() => {
    let alive = true
    fetch(`${import.meta.env.BASE_URL}recipes.json`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((data) => {
        if (!alive) return
        setState({
          status: 'ready',
          recipes: Array.isArray(data.recipes) ? data.recipes : [],
          generatedAt: data.generatedAt ?? null,
        })
      })
      .catch(() => alive && setState((s) => ({ ...s, status: 'error' })))
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className="view">
      <div className="recipes__banner">
        <span aria-hidden="true">🧪</span>
        <div>
          <strong>Suggestions preview</strong>
          <p>
            These are placeholder recipes from <code>recipes.json</code>. Smart matching to your
            fridge comes in a later update.
          </p>
        </div>
      </div>

      {state.status === 'loading' && <p className="muted">Loading suggestions…</p>}
      {state.status === 'error' && <p className="muted">Couldn't load recipes right now.</p>}

      {state.status === 'ready' && state.recipes.length === 0 && (
        <div className="empty">
          <div className="empty__emoji">🍽️</div>
          <p className="empty__title">No suggestions yet</p>
          <p className="empty__text">They'll show up here once the feed is populated.</p>
        </div>
      )}

      <ul className="recipes">
        {state.recipes.map((r) => (
          <li key={r.id} className="recipe">
            <div className="recipe__emoji" aria-hidden="true">
              {r.emoji ?? '🍲'}
            </div>
            <div className="recipe__body">
              <div className="recipe__top">
                <h3 className="recipe__title">{r.title}</h3>
                {r.timeMinutes != null && <span className="recipe__time">{r.timeMinutes} min</span>}
              </div>
              {r.description && <p className="recipe__desc">{r.description}</p>}
              {Array.isArray(r.usesFridgeItems) && r.usesFridgeItems.length > 0 && (
                <div className="recipe__uses">
                  {r.usesFridgeItems.map((name) => (
                    <span key={name} className="recipe__tag">
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
