import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/auth'
import App from './App.tsx'
import './styles/tailwind.css'
import './styles/animations.css'
import CookieBanner from './components/CookieBanner'
import { NetworkStatusIndicator } from './components/NetworkStatusIndicator'

// Disabilita service worker se presente
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(const registration of registrations) {
      registration.unregister()
      console.log('🔧 Service worker unregistered:', registration)
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
        <CookieBanner />
        <NetworkStatusIndicator />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)