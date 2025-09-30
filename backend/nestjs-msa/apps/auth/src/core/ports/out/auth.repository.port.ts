import { OAuthClient } from "@src/core/domain/entities/oauth-client.entity";
import { OAuthToken } from "@src/core/domain/entities/oauth-token.entity";
import {
  AuthProvider,
  AuthProviderType,
} from "@src/core/domain/entities/auth-provider.entity";
export const IAuthRepositoryPort = Symbol("IAuthRepositoryPort");
export interface IAuthRepositoryPort {
  findProviderByProvider(
    provider: AuthProviderType,
  ): Promise<AuthProvider | null>;
  findOAuthClientByUserIdAndProviderId(
    providerId: string,
    userId: string,
  ): Promise<OAuthClient | null>;
  createOAuthClient(oauthClient: OAuthClient): Promise<OAuthClient | null>;
  createOAuthToken(oauthToken: OAuthToken): Promise<OAuthToken | null>;
}
