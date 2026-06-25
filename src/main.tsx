import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import { AppProvider } from './context/AppContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </Router>
    </AppProvider>
  </React.StrictMode>,
)
