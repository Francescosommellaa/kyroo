import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.tsx'
import './styles/tailwind.css'
import CookieBanner from './components/CookieBanner'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
        <CookieBanner />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)