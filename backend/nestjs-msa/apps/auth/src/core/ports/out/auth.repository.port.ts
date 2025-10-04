import { OAuthClient } from "@src/core/domain/entities/oauth-client.entity";
import { OAuthToken } from "@src/core/domain/entities/oauth-token.entity";
import {
  AuthProvider,
  AuthProviderType,
} from "@src/core/domain/entities/auth-provider.entity";

export abstract class AuthRepositoryPort {
  abstract findProviderByProvider(
    provider: AuthProviderType,
  ): Promise<AuthProvider | null>;
  abstract findOAuthClientByUserIdAndProviderId(
    providerId: string,
    userId: string,
  ): Promise<OAuthClient | null>;
  abstract createOAuthClient(
    oauthClient: OAuthClient,
  ): Promise<OAuthClient | null>;
  abstract createOAuthToken(oauthToken: OAuthToken): Promise<OAuthToken | null>;
}
