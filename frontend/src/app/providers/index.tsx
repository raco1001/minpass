import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type PropsWithChildren } from 'react'
import { ToastProvider } from './toast'


export function Providers({ children }: PropsWithChildren) {
  const [client] = useState(() => new QueryClient())
  return (
    <ToastProvider>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ToastProvider>
  )
} 