import { mapAuthUser } from '@/entities/users/lib/mapUser'
import { useUserStore } from '@/entities/users/model/user.store'
import { me } from '@/shared/apis/auth.api'
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
        // URL 파라미터에 토큰이 있으면 저장 (JWT 토큰 방식)
        if (token && userId) {
          localStorage.setItem('accessToken', token)
          localStorage.setItem('userId', userId)
        }

        // HttpOnly 쿠키 방식인 경우 토큰이 URL에 없을 수 있음
        // 어떤 방식이든 /auth/me로 사용자 정보를 조회하여 확인

        // 사용자 정보 조회 및 store 업데이트
        const authUser = await me()
        setUser(mapAuthUser(authUser))

        // 원래 페이지로 복귀 또는 대시보드로
        const returnUrl = localStorage.getItem('returnUrl') || '/'
        localStorage.removeItem('returnUrl')

        if (isNewUser) {
          // 신규 사용자는 온보딩 페이지로 (현재는 대시보드로)
          navigate('/')
        } else {
          navigate(returnUrl)
        }
      } catch (e) {
        console.error('Auth callback error:', e)
        setError('로그인 처리 중 오류가 발생했습니다.')
        setTimeout(() => navigate('/login'), 2000)
      }
    }

    handleCallback()
  }, [searchParams, navigate, setUser])

  return (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        {error ? (
          <div>
            <p style={{ color: 'red' }}>{error}</p>
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
              로그인 페이지로 이동합니다...
            </p>
          </div>
        ) : (
          <div>
            <p>로그인 처리 중...</p>
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
              잠시만 기다려주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

