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