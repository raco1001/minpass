import { mapAuthUser } from '@/entities/users/lib/mapUser'
import { useUserStore } from '@/entities/users/model/user.store'
import { me } from '@/shared/apis/auth.api'
import { keys } from '@/shared/libs/keys'
import { useQuery } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'


export function SessionGuard({ children }: { children: ReactNode }) {
  const user = useUserStore((s) => s.user)
  const setUser = useUserStore((s) => s.setUser)


  const q = useQuery({ queryKey: keys.me(), queryFn: me, retry: 0, staleTime: 60_000 })


  useEffect(() => {
    if (q.data) setUser(mapAuthUser(q.data))
  }, [q.data, setUser])


  if (q.isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}