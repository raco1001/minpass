import type { User } from '@/entities/users/model/user.types'
import type { AuthUser } from '@/shared/apis/auth.api'


export function mapAuthUser(u: AuthUser): User {
  return { id: u.id, email: u.email, name: u.name, roles: u.roles }
}