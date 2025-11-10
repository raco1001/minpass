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
}

export async function login(dto: LoginDto): Promise<AuthUser> {
  const { data } = await api.post('/auth/login', dto)
  return data.user
}

/**
 * OAuth 로그인 시작 (전체 페이지 리디렉션)
 * 백엔드의 OAuth 엔드포인트로 리디렉션합니다.
 */
export function initiateLogin(provider: Provider): void {
  // 현재 페이지 저장 (로그인 후 돌아오기 위해)
  localStorage.setItem('returnUrl', window.location.pathname)

  // OAuth 로그인 페이지로 리디렉션
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
