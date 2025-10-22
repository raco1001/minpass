import { env } from '@/shared/config/env'
import axios from 'axios'


export type ApiErrorShape = {
  code?: string
  message: string
  status?: number
  details?: unknown
}


export const api = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
  timeout: 10000,
})


// Request interceptor: Authorization 헤더에 토큰 추가 (JWT 방식)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)


// Response interceptor: 에러 처리
api.interceptors.response.use(
  r => r,
  (error) => {
    const status = error?.response?.status
    const data = error?.response?.data
    const mapped: ApiErrorShape = {
      code: data?.code ?? undefined,
      message: data?.message ?? error?.message ?? 'Request failed',
      status,
      details: data?.details ?? data ?? undefined,
    }
    return Promise.reject(mapped)
  }
)