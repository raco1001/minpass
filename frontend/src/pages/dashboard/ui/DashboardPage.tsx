import { useUserStore } from '@/entities/users/model/user.store'
import { Button } from '@/shared/ui/Button'


export function DashboardPage() {
  const user = useUserStore((s) => s.user)
  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Welcome{user ? `, ${user.name ?? user.email}` : ''}!</p>
      <Button onClick={() => alert('TODO: add real actions')}>Do something</Button>
    </div>
  )
}