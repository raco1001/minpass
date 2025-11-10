import { api } from './base'

export type Provider = 'google' | 'github' | 'kakao'

export type LoginDto = {
  email: string
  password: string
}

export type SocialLoginRequest = {
  provider: Provider
  code: string
  state?: string
}

export type AuthUser = {
  id: string
  email: string
  name?: string
  roles?: string[]
  accessToken?: string
  isNewUser?: boolean
}

export async function login(dto: LoginDto): Promise<AuthUser> {
  const { data } = await api.post('/auth/login', dto)
  return data.user
}

export function initiateLogin(provider: Provider): void {
  localStorage.setItem('returnUrl', window.location.pathname)

  const apiUrl = import.meta.env.VITE_API_URL as string
  window.location.href = `${apiUrl}/auth/login/${provider}`
}

export async function socialLogin(
  request: SocialLoginRequest,
): Promise<AuthUser> {
  const { data } = await api.post(
    `/auth/login/${request.provider}/callback`,
    request,
  )
  return data.user
}

export async function me(): Promise<AuthUser> {
  const { data } = await api.get('/users/me')
  return data.user
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout', {})
}
