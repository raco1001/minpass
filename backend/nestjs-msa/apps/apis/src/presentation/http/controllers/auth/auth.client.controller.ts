import { AuthClientServicePort } from "@apis/core/ports/in/auth.client.service.port";
import { Controller, Get, Inject, Param, Req, UseGuards } from "@nestjs/common";
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
   * @returns Login result with JWT tokens
   * @example GET /auth/login/google/callback?code=...
   */
  @Get("login/:provider/callback")
  @UseGuards(DynamicAuthGuard)
  async handleOAuthCallback(
    @Param("provider") provider: string,
    @Req() req: { user: auth.SocialUserProfile },
  ): Promise<auth.LoginResult> {
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

    return await firstValueFrom(this.authClientService.socialLogin(request));
  }
}
