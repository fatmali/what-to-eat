import { useEffect, useState } from 'react'

// Deferred feature. Reads the mock recipes.json (which a future job will
// populate based on the fridge) and renders whatever is there. Matching /
// ranking logic is a later task.
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
      <div className="preview-slip">
        <span className="preview-slip__stamp" aria-hidden="true">
          Preview
        </span>
        <p>
          Placeholder dishes from <code>recipes.json</code>. Suggestions matched to your ledger
          arrive in a later edition.
        </p>
      </div>

      {state.status === 'loading' && <p className="muted">Setting the table…</p>}
      {state.status === 'error' && <p className="muted">Couldn't fetch today's specials.</p>}

      {state.status === 'ready' && state.recipes.length === 0 && (
        <div className="empty">
          <div className="empty__mark">✽</div>
          <p className="empty__title">No specials yet</p>
          <p className="empty__text">They'll be posted here once the kitchen writes them up.</p>
        </div>
      )}

      <ul className="specials">
        {state.recipes.map((r, i) => (
          <li key={r.id} className="special" style={{ '--i': i }}>
            <div className="special__head">
              <span className="special__emoji" aria-hidden="true">
                {r.emoji ?? '🍲'}
              </span>
              <h3 className="special__title">{r.title}</h3>
              {r.timeMinutes != null && (
                <span className="special__time">{r.timeMinutes}′</span>
              )}
            </div>
            {r.description && <p className="special__desc">{r.description}</p>}
            {Array.isArray(r.usesFridgeItems) && r.usesFridgeItems.length > 0 && (
              <div className="special__uses">
                <span className="special__uses-label">uses</span>
                {r.usesFridgeItems.map((name) => (
                  <span key={name} className="special__tag">
                    {name}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
