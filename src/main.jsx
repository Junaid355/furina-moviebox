import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initAdBlocker } from './services/adblocker'
import { initAiUpdater } from './services/aiUpdater'

// Initialize built-in AdBlock Shield & AI Movie Auto-Updater
initAdBlocker()
initAiUpdater()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
