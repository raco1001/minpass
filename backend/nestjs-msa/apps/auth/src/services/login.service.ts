import { Inject, Injectable } from "@nestjs/common";
import { LoginServicePort } from "@auth/core/ports/in/login-service.port";
import { auth } from "@app/contracts";
import {
  AuthRepositoryPort,
  AuthTokenInfo,
} from "@auth/core/ports/out/auth.repository.port";
import { AuthTokenPort } from "@auth/core/ports/out/auth.token.port";
import { UserClientPort } from "@auth/core/ports/out/user-client.port";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";
import { AuthTokenEntity } from "@auth/core/domain/entities/token.entity";
import { firstValueFrom } from "rxjs";
import { SocialUserProfile } from "@auth/core/domain/dto/social-user-profile.dto";
@Injectable()
export class LoginService implements LoginServicePort {
  constructor(
    @Inject(AuthRepositoryPort)
    private readonly authRepository: AuthRepositoryPort,
    @Inject(AuthTokenPort)
    private readonly authToken: AuthTokenPort,
    @Inject(UserClientPort)
    private readonly userClient: UserClientPort,
  ) {}
  async socialLogin(dto: auth.SocialLoginRequest): Promise<auth.ILoginResult> {
    const provider = await this.authRepository.findProviderByProvider(
      dto.provider as AuthProvider,
    );
    if (!provider) {
      throw new Error("Provider not found");
    }
    if (!dto.socialUserProfile) {
      throw new Error("Social user profile not found");
    }
    const client =
      await this.authRepository.findAuthClientByClientIdAndProviderId(
        provider.id,
        dto.socialUserProfile.clientId,
      );
    if (client) {
      const isNewUser = false;
      const userId = client.userId;
      const user = await firstValueFrom(
        this.userClient.findOneUser({ id: userId }),
      );

      if (!user) {
        throw new Error("User not found");
      }

      const isClientUpdated =
        await this.authRepository.updateAuthClientTimestamp(client.id);
      if (!isClientUpdated) {
        throw new Error("Failed to update auth client timestamp");
      }

      const tokens = await this.authToken.generateTokens({
        userId: user.id,
        email: user.email,
      });
      const tokenInfo = await this.authRepository.findAuthTokenInfoByClientId(
        client.id,
      );
      if (!tokenInfo) {
        throw new Error("Failed to find auth token info");
      }
      await this.authRepository.updateAuthTokens({
        authClientId: client.id,
        providerAccessToken: dto.socialUserProfile.providerAccessToken,
        providerRefreshToken: dto.socialUserProfile.providerRefreshToken,
        refreshToken: tokens.refreshToken,
        revoked: false,
      } as AuthTokenInfo);

      const newTokenInfo =
        await this.authRepository.findAuthTokenInfoByClientId(client.id);
      if (!newTokenInfo) {
        throw new Error("Failed to find auth token info");
      }
      return {
        userId: user.id,
        accessToken: newTokenInfo.providerAccessToken,
        isNewUser: isNewUser,
      };
    } else {
      const isNewUser = true;
      const isUserExists = await this.userClient.findOneUserByEmail({
        email: dto.socialUserProfile.email,
      });
      if (isUserExists) {
        throw new Error("User already exists");
      }
      const newUser = await firstValueFrom(
        this.userClient.createUser({
          email: dto.socialUserProfile.email,
          locale: "KO",
          displayName: dto.socialUserProfile.name,
        }),
      );

      const provider = await this.authRepository.findProviderByProvider(
        dto.provider as AuthProvider,
      );
      if (!provider) {
        throw new Error("Provider not found");
      }

      const newAuthClient = await this.authRepository.createAuthClient({
        userId: newUser.id,
        providerId: provider.id,
        clientId: dto.socialUserProfile.clientId,
        id: null,
        salt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      if (!newAuthClient) {
        throw new Error("Failed to create auth client");
      }
      const tokens = await this.authToken.generateTokens({
        userId: newUser.id,
        email: newUser.email,
      });
      const tokenInfo = await this.authRepository.createAuthToken({
        authClientId: newAuthClient.id,
        providerAccessToken: dto.socialUserProfile.providerAccessToken,
        providerRefreshToken: dto.socialUserProfile.providerRefreshToken,
        refreshToken: tokens.refreshToken,
        revoked: false,
      } as AuthTokenEntity);
      if (!tokenInfo) {
        throw new Error("Failed to create auth token");
      }
      return {
        userId: newUser.id,
        accessToken: tokenInfo.providerAccessToken,
        isNewUser: isNewUser,
      };
    }
  }
}
