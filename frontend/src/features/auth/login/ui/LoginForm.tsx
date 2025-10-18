import { useToast } from '@/app/hooks/useToast'
import { Button } from '@/shared/ui/Button'
import { Form } from '@/shared/ui/Form'
import { Input } from '@/shared/ui/Input'
import { useState } from 'react'
import { loginSchema } from '../lib/validators'
import { useLogin } from '../model/useLogin'


export function LoginForm() {
  const m = useLogin()
  const { push } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})


  const onSubmit = () => {
    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    m.mutate(parsed.data, {
      onError: (e: Error) => {
        const msg = e?.message ?? '로그인에 실패했습니다'
        push(msg, 'error')
      },
      onSuccess: () => {
        push('로그인 성공', 'success')
      }
    })
  }


  return (
    <Form onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
      <h1>Sign in</h1>
      <div>
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {errors.email && <small style={{ color: '#e87979' }}>{errors.email}</small>}
      </div>
      <div>
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {errors.password && <small style={{ color: '#e87979' }}>{errors.password}</small>}
      </div>
      <Button type="submit" disabled={m.isPending}>{m.isPending ? 'Signing in…' : 'Login'}</Button>
    </Form>
  )
}