import { AuthClientEntity } from "@auth/core/domain/entities/auth-client.entity";
import { AuthTokenEntity } from "@auth/core/domain/entities/token.entity";
import { AuthProviderEntity } from "@auth/core/domain/entities/auth-provider.entity";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";
import { CreateAuthTokenDto } from "@auth/infrastructure/repositories/persistence/mariadb/dtos/auth-tokens-request.dtos";
import { UpdateAuthTokenDto } from "@auth/infrastructure/repositories/persistence/mariadb/dtos/auth-tokens-request.dtos";
import { FindAuthTokenDto } from "@auth/infrastructure/repositories/persistence/mariadb/dtos/auth-tokens-request.dtos";
import { CreateAuthClientDto } from "@auth/infrastructure/repositories/persistence/mariadb/dtos/auth-tokens-request.dtos";
import { UpdateAuthClientDto } from "@auth/infrastructure/repositories/persistence/mariadb/dtos/auth-tokens-request.dtos";

export class AuthTokenInfo implements Partial<AuthTokenEntity> {
  id?: AuthTokenEntity["id"];
  authClientId: AuthTokenEntity["authClientId"];
  providerAccessToken: AuthTokenEntity["providerAccessToken"];
  providerRefreshToken: AuthTokenEntity["providerRefreshToken"];
  refreshToken: AuthTokenEntity["refreshToken"];
  revoked: AuthTokenEntity["revoked"];
}

export abstract class AuthRepositoryPort {
  abstract findProviderByProvider(
    provider: AuthProvider,
  ): Promise<AuthProviderEntity | null>;

  abstract findAuthClientByClientIdAndProviderId(
    providerId: string,
    clientId: string,
  ): Promise<AuthClientEntity | null>;

  abstract findAuthTokenInfoByClientId(
    clientId: AuthClientEntity["id"],
  ): Promise<AuthTokenInfo | null>;

  abstract createAuthClient(
    authClient: CreateAuthClientDto,
  ): Promise<AuthClientEntity | null>;

  abstract createAuthToken(
    authToken: CreateAuthTokenDto,
  ): Promise<AuthTokenEntity | null>;

  abstract updateAuthClientTimestamp(
    authClientId: UpdateAuthClientDto,
  ): Promise<boolean>;

  abstract updateAuthTokens(authTokenInfo: AuthTokenInfo): Promise<boolean>;
}
