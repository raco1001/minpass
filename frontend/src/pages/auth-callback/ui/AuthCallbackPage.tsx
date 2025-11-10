import { useUserStore } from '@/entities/users/model/user.store'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setUser = useUserStore((s) => s.setUser)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const userId = searchParams.get('userId')
      const isNewUser = searchParams.get('isNewUser') === 'true'

      try {
        // URL 파라미터 검증
        if (!token || !userId) {
          throw new Error('Missing authentication parameters')
        }

        // 토큰과 userId 저장
        localStorage.setItem('accessToken', token)
        localStorage.setItem('userId', userId)

        // 사용자 상태 설정 (URL 파라미터의 정보 직접 사용)
        setUser({
          id: userId,
          isNewUser: isNewUser,
        })

        // 로그인 성공 후 캘린더 페이지로 이동
        navigate('/calendar')
      } catch (e) {
        console.error('Auth callback error:', e)
        setError('Login processing failed. Please try again.')
        setTimeout(() => navigate('/login'), 2000)
      }
    }

    handleCallback()
  }, [searchParams, navigate, setUser])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      display: 'grid',
      placeItems: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        {error ? (
          <div>
            <p style={{ color: '#ef4444', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              {error}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
              Redirecting to login page...
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(59, 130, 246, 0.2)',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1.5rem'
            }} />
            <p style={{ color: 'white', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              Processing login...
            </p>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
              Please wait a moment.
            </p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

