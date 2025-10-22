import { initiateLogin, type Provider } from '@/shared/apis/auth.api'
import { Button } from '@/shared/ui/Button'

export function SocialLoginButtons() {
  const handleSocialLogin = (provider: Provider) => {
    // 전체 페이지 리디렉션 방식으로 OAuth 로그인 시작
    initiateLogin(provider)
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        onClick={() => handleSocialLogin('google')}
      >
        Google로 로그인
      </Button>
      <Button
        variant="outline"
        onClick={() => handleSocialLogin('github')}
      >
        Github로 로그인
      </Button>
      <Button
        variant="outline"
        onClick={() => handleSocialLogin('kakao')}
      >
        Kakao로 로그인
      </Button>
    </div>
  )
}
