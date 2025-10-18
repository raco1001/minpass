import { mapAuthUser } from '@/entities/users/lib/mapUser'
import { useUserStore } from '@/entities/users/model/user.store'
import { login, type AuthUser, type LoginDto } from '@/shared/apis/auth.api'
import { useMutation, type UseMutationResult } from '@tanstack/react-query'


export function useLogin(): UseMutationResult<AuthUser, Error, LoginDto> {
  const setUser = useUserStore((s) => s.setUser)
  return useMutation({
    mutationFn: (dto: LoginDto) => login(dto),
    onSuccess: (authUser) => setUser(mapAuthUser(authUser)),
  })
}