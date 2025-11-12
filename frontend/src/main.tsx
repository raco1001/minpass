import App from '@/app/App'
import { Providers } from '@/app/providers'
import '@/app/styles/index.css'
import { worker } from '@/shared/mocks/browser'
import React from 'react'
import ReactDOM from 'react-dom/client'

if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: 'bypass',
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
)
