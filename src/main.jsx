import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initAdBlocker } from './services/adblocker'

// Initialize built-in AdBlock Shield to intercept popups and ads
initAdBlocker()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
