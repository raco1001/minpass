import type { User } from '@/entities/users/model/user.types'
import type { AuthUser } from '@/shared/apis/auth.api'


export function mapAuthUser(u: AuthUser): Partial<User> {
  return {
    id: u.id,
    isNewUser: u.isNewUser,
  }
}