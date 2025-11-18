import { SessionGuard } from '@/features/session/ui/SessionGuard'
import { AuthCallbackPage } from '@/pages/auth-callback/ui/AuthCallbackPage'
import { CalendarPage } from '@/pages/calendar'
import { DashboardPage } from '@/pages/dashboard/ui/DashboardPage'
import { LandingPage } from '@/pages/landing'
import { LoginPage } from '@/pages/login/ui/LoginPage'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'


const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  {
    path: '/calendar',
    element: (
      <SessionGuard>
        <CalendarPage />
      </SessionGuard>
    ),
  },
  {
    path: '/dashboard',
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