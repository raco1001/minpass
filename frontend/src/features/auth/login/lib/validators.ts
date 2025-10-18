import { z } from '@/shared/libs/zod'


export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상'),
})

export type LoginForm = z.infer<typeof loginSchema> 