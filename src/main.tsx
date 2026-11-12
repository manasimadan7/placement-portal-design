import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { applyScale } from './useScrollReveal'
import './styles.css'

applyScale() // size the canvas before first paint

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
