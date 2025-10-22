import { SessionGuard } from '@/features/session/ui/SessionGuard'
import { AuthCallbackPage } from '@/pages/auth-callback/ui/AuthCallbackPage'
import { DashboardPage } from '@/pages/dashboard/ui/DashboardPage'
import { LoginPage } from '@/pages/login/ui/LoginPage'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'


const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  {
    path: '/',
    element: (
      <SessionGuard>
        <DashboardPage />
      </SessionGuard>
    ),
  },
])


export function Router() {
  return <RouterProvider router={router} />
}