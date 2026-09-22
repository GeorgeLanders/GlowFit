import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts, bundled into the app rather than fetched from a CDN. A
// fitness app gets used in gyms and basements with no signal, and a CDN link
// would leave 58 serif headings rendering in Georgia on first paint. @theme in
// index.css declares these exact family names, so they must be loaded here
// first. Latin subsets only, to keep the bundle small.
import '@fontsource/playfair-display/latin-400.css'
import '@fontsource/playfair-display/latin-400-italic.css'
import '@fontsource/playfair-display/latin-500.css'
import '@fontsource/playfair-display/latin-600.css'
import '@fontsource/playfair-display/latin-700.css'
import '@fontsource/inter/latin-300.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-400-italic.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
