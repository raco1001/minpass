import { useUserStore } from '@/entities/users/model/user.store'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './Header.module.css'

export function Header() {
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false)
  const user = useUserStore((s) => s.user)
  const setUser = useUserStore((s) => s.setUser)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userId')
    setUser(null)
    navigate('/')
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span>MinPass</span>
        </Link>

        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>
            Home
          </Link>
          <Link to="/about" className={styles.navLink}>
            About MinPass
          </Link>
          <div
            className={styles.dropdown}
            onMouseEnter={() => setIsFeaturesOpen(true)}
            onMouseLeave={() => setIsFeaturesOpen(false)}
          >
            <button className={styles.navLink}>
              Features
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.chevron}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isFeaturesOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownContent}>
                  <Link to="/calendar" className={styles.dropdownItem}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Calendar
                  </Link>
                  <Link to="/tasks" className={styles.dropdownItem}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    Tasks
                  </Link>
                  <Link to="/ontology" className={styles.dropdownItem}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    Ontology
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Link to="/contact" className={styles.navLink}>
            Contact
          </Link>
        </nav>

        <div className={styles.actions}>
          {user ? (
            <button onClick={handleLogout} className={styles.logoutButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className={styles.signInButton}>
                Sign In
              </Link>
              <Link to="/login" className={styles.signUpButton}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

