import { OAuthClient } from "@/core/auth/core/domain/entities/oauth-client.entity";
import { OAuthToken } from "@/core/auth/core/domain/entities/oauth-token.entity";
import { SocialUserProfile } from "@/core/auth/core/domain/types/social-user-profile.interface";
import { v4 as uuidv4 } from "uuid";
import { AuthProviderType } from "../entities/auth-provider.entity";

export class OAuthClientFactory {
  static getProviderId(provider: AuthProviderType): string {
    switch (provider) {
      case AuthProviderType.KAKAO:
        return "kakao";
      case AuthProviderType.GOOGLE:
        return "google";
      case AuthProviderType.GITHUB:
        return "github";
    }
  }

  static createWithTokens(
    userId: string,
    profile: SocialUserProfile,
    salt: string,
    providerId: string,
    providerAccessToken: string,
    providerRefreshToken: string,
    refreshToken: string,
    expiresAt: Date,
  ): OAuthClient {
    const now = new Date();
    const clientId = profile.clientId.toString();

    const client = new OAuthClient(
      uuidv4(),
      userId,
      providerId,
      clientId,
      salt,
      now,
      now,
    );

    const token = new OAuthToken(
      uuidv4(),
      client.id ?? "",
      userId,
      providerAccessToken,
      providerRefreshToken,
      refreshToken,
      false,
      expiresAt,
      now,
      now,
    );

    client.attachToken(token);

    return client;
  }
}
