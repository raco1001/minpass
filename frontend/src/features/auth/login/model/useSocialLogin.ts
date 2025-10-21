import { mapAuthUser } from '@/entities/users/lib/mapUser'
import { useUserStore } from '@/entities/users/model/user.store'
import {
  socialLogin,
  initiateLogin,
  type AuthUser,
  type Provider,
  type SocialLoginRequest,
} from '@/shared/apis/auth.api'
import { useMutation, type UseMutationResult } from '@tanstack/react-query'

export function useInitiateSocialLogin(): UseMutationResult<
  void,
  Error,
  Provider
> {
  return useMutation({
    mutationFn: (provider: Provider) => initiateLogin(provider),
  })
}

export function useSocialLogin(): UseMutationResult<
  AuthUser,
  Error,
  SocialLoginRequest
> {
  const setUser = useUserStore((s) => s.setUser)
  return useMutation({
    mutationFn: (request: SocialLoginRequest) => socialLogin(request),
    onSuccess: (authUser) => setUser(mapAuthUser(authUser)),
  })
}
