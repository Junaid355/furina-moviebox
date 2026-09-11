import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initAdBlocker } from './services/adblocker'
import { initAiUpdater } from './services/aiUpdater'
import { initGlobalSoundListeners } from './services/soundFx'

// Initialize built-in AdBlock Shield, AI Movie Auto-Updater & Cozy Sound Effects
initAdBlocker()
initAiUpdater()
initGlobalSoundListeners()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
