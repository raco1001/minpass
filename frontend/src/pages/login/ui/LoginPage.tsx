import { LoginForm } from '@/features/auth/login/ui/LoginForm'
import { Header } from '@/widgets/header'
import styles from './LoginPage.module.css'

export function LoginPage() {
  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.content}>
        <div className={styles.container}>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}