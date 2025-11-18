import { AuthClientServicePort } from "@apis/core/ports/in/auth.client.service.port";
import {
  Controller,
  Get,
  Inject,
  Param,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { firstValueFrom } from "rxjs";
import { auth } from "@app/contracts";
import { DynamicAuthGuard } from "@apis/infrastructure/auth-provider/guards/dynamic-auth.guard";

/**
 * AuthClientController
 *
 * Handles OAuth authentication flows for the API Gateway.
 * This controller acts as the entry point for social login,
 * coordinating between OAuth providers and the Auth microservice.
 */
@Controller("auth")
export class AuthClientController {
  constructor(
    @Inject(AuthClientServicePort)
    private readonly authClientService: AuthClientServicePort,
  ) {}

  /**
   * Initiates OAuth authentication flow
   * Redirects user to the OAuth provider's authorization page
   *
   * @param provider - OAuth provider name (google, github, kakao)
   * @example GET /auth/login/google
   */
  @Get("login/:provider")
  @UseGuards(DynamicAuthGuard)
  initiateOAuth(@Param("provider") provider: string) {
    // This method won't be reached because the Guard redirects to OAuth provider
    // Kept for documentation purposes
  }

  /**
   * Handles OAuth callback after user authorizes
   * Receives authorization code, exchanges for access token,
   * and creates/updates user account
   *
   * @param provider - OAuth provider name
   * @param req - Request object with user profile injected by Passport
   * @param res - Response object for redirection
   * @returns Redirects to frontend with tokens
   * @example GET /auth/login/google/callback?code=...
   */
  @Get("login/:provider/callback")
  @UseGuards(DynamicAuthGuard)
  async handleOAuthCallback(
    @Param("provider") provider: string,
    @Req() req: { user: auth.SocialUserProfile },
    @Res() res: Response,
  ): Promise<void> {
    // Passport strategy has already validated and populated req.user
    const socialProfile = req.user;

    const request: auth.SocialLoginRequest = {
      provider: socialProfile.provider,
      socialUserProfile: {
        clientId: socialProfile.clientId,
        email: socialProfile.email,
        name: socialProfile.name,
        nickname: socialProfile.nickname,
        profileImage: socialProfile.profileImage,
        provider: socialProfile.provider,
        providerAccessToken: socialProfile.providerAccessToken,
        providerRefreshToken: socialProfile.providerRefreshToken,
      },
    };

    const result = await firstValueFrom(
      this.authClientService.socialLogin(request),
    );

    // 프론트엔드 URL (환경변수로 설정 권장)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";

    // 방법 1: Query string으로 토큰 전달 (간단하지만 보안상 권장하지 않음)
    // const redirectUrl = `${frontendUrl}/auth/callback?token=${result.accessToken}&userId=${result.userId}&isNewUser=${result.isNewUser}`;

    // 방법 2: 팝업 창을 위한 HTML 페이지 반환
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>로그인 완료</title>
        <script>
          // 부모 창(opener)이 있으면 메시지 전달
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth-success',
              accessToken: '${result.accessToken}',
              userId: '${result.userId}',
              isNewUser: ${result.isNewUser}
            }, '${frontendUrl}');
            window.close();
          } else {
            // 리디렉션 방식인 경우
            window.location.href = '${frontendUrl}/auth/callback?token=${result.accessToken}&userId=${result.userId}&isNewUser=${result.isNewUser}';
          }
        </script>
      </head>
      <body>
        <p>로그인 처리 중...</p>
      </body>
      </html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  }
}
