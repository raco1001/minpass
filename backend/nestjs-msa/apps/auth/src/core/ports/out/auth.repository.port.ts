import { AuthClientEntity } from "@auth/core/domain/entities/auth-client.entity";
import { AuthTokenEntity } from "@auth/core/domain/entities/token.entity";
import { AuthProviderEntity } from "@auth/core/domain/entities/auth-provider.entity";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";

export abstract class AuthRepositoryPort {
  abstract findProviderByProvider(
    provider: AuthProvider,
  ): Promise<AuthProviderEntity | null>;
  abstract findAuthClientByUserIdAndProviderId(
    providerId: string,
    userId: string,
  ): Promise<AuthClientEntity | null>;
  abstract createAuthClient(
    authClient: AuthClientEntity,
  ): Promise<AuthClientEntity | null>;
  abstract createAuthToken(
    authToken: AuthTokenEntity,
  ): Promise<AuthTokenEntity | null>;
}
