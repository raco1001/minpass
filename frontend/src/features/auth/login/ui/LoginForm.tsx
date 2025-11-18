import { useToast } from '@/app/hooks/useToast'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginSchema } from '../lib/validators'
import { useLogin } from '../model/useLogin'
import styles from './LoginForm.module.css'
import { SocialLoginButtons } from './SocialLoginButtons'

export function LoginForm() {
  const m = useLogin()
  const { push } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  )

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
        const msg = e?.message ?? 'Login failed. Please try again.'
        push(msg, 'error')
      },
      onSuccess: () => {
        push('Successfully logged in!', 'success')
        navigate('/calendar')
      },
    })
  }

  return (
    <div className={styles.container}>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <div>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to continue to MinPass</p>
        </div>

        <div className={styles.inputGroup}>
          <input
            type="email"
            className={styles.input}
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className={styles.error}>{errors.email}</p>}
        </div>

        <div className={styles.inputGroup}>
          <input
            type="password"
            className={styles.input}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className={styles.error}>{errors.password}</p>}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={m.isPending}
        >
          {m.isPending ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <span className={styles.dividerText}>or continue with</span>
        <div className={styles.dividerLine} />
      </div>

      <SocialLoginButtons />
    </div>
  )
}
