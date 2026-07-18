import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { initErrorLogger } from '@/lib/error-logger'

initErrorLogger()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)