import { mapAuthUser } from '@/entities/users/lib/mapUser'
import { useUserStore } from '@/entities/users/model/user.store'
import { me } from '@/shared/apis/auth.api'
import { useQuery } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'


export function SessionGuard({ children }: { children: ReactNode }) {
  const user = useUserStore((s) => s.user)
  const setUser = useUserStore((s) => s.setUser)
  const token = localStorage.getItem('accessToken')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: me,
    enabled: !!token && !user,
    retry: false,
  })

  useEffect(() => {
    if (data) {
      setUser(mapAuthUser(data))
    }
  }, [data, setUser])

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        display: 'grid',
        placeItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(59, 130, 246, 0.2)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto'
          }} />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  if (!token || isError) {
    return <Navigate to="/login" replace />
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}