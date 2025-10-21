import { useToast } from '@/app/hooks/useToast'
import { Button } from '@/shared/ui/Button'
import type { Provider } from '@/shared/apis/auth.api'
import { useInitiateSocialLogin, useSocialLogin } from '../model/useSocialLogin'
import { useEffect } from 'react'

const POPUP_WIDTH = 500
const POPUP_HEIGHT = 600

export function SocialLoginButtons() {
  const { push } = useToast()
  const initiate = useInitiateSocialLogin()
  const complete = useSocialLogin()

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'social_auth_callback') {
        const { provider, code, state } = event.data
        complete.mutate(
          { provider, code, state },
          {
            onError: (e) => {
              const msg = e?.message ?? '소셜 로그인에 실패했습니다'
              push(msg, 'error')
            },
            onSuccess: () => {
              push('로그인 성공', 'success')
            },
          },
        )
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [complete, push])

  const handleSocialLogin = async (provider: Provider) => {
    const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2
    const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2

    const popup = window.open(
      'about:blank',
      'social_auth',
      `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top}`,
    )

    try {
      await initiate.mutateAsync(provider)
      // 백엔드에서 리다이렉트 응답을 받으면 팝업이 자동으로 해당 URL로 이동합니다
    } catch (e) {
      popup?.close()
      const msg =
        e instanceof Error ? e.message : '소셜 로그인을 시작할 수 없습니다'
      push(msg, 'error')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        onClick={() => handleSocialLogin('google')}
        disabled={initiate.isPending || complete.isPending}
      >
        Google로 로그인
      </Button>
      <Button
        variant="outline"
        onClick={() => handleSocialLogin('github')}
        disabled={initiate.isPending || complete.isPending}
      >
        Github로 로그인
      </Button>
      <Button
        variant="outline"
        onClick={() => handleSocialLogin('kakao')}
        disabled={initiate.isPending || complete.isPending}
      >
        Kakao로 로그인
      </Button>
    </div>
  )
}
