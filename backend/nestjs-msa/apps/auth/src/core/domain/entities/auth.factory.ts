import { OAuthClient } from "@src/core/domain/entities/oauth-client.entity";
import { OAuthToken } from "@src/core/domain/entities/oauth-token.entity";
import { SocialUserProfile } from "@src/core/domain/dto/social-user-profile.dto";
import { v7 as uuidv7 } from "uuid";
import { AuthProviderType } from "./auth-provider.entity";

export class OAuthClientFactory {
  static getProviderId(provider: AuthProviderType): string {
    switch (provider) {
      case AuthProviderType.GOOGLE:
        return "google";
      case AuthProviderType.GITHUB:
        return "github";
      default:
        throw new Error(`Invalid provider: ${provider}`);
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
  ): { client: OAuthClient; token: OAuthToken } {
    const now = new Date();
    const clientId = profile.clientId.toString();

    const client = new OAuthClient(
      uuidv7(),
      userId,
      providerId,
      clientId,
      salt,
      now,
      now,
    );

    const token = new OAuthToken(
      uuidv7(),
      client.id ?? "",
      providerAccessToken,
      providerRefreshToken,
      refreshToken,
      false,
      expiresAt,
      now,
      now,
    );

    return { client, token };
  }
}
