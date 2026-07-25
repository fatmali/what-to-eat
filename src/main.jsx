import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Distinctive, self-hosted type: Fraunces (wonky old-style serif) + DM Mono.
import '@fontsource-variable/fraunces/full.css'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'
import App from './App.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
