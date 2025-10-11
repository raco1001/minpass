import { AuthClientEntity } from "@auth/core/domain/entities/auth-client.entity";
import { authClients, authProviders, authTokens } from "../schema/auth";
import { AuthTokenEntity } from "@auth/core/domain/entities/token.entity";
import { v7 as uuidv7 } from "uuid";
import { AuthProviderEntity } from "@auth/core/domain/entities/auth-provider.entity";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";
import { AuthTokenInfo } from "@auth/core/ports/out/auth.repository.port";

import {
  CreateAuthTokenDto,
  UpdateAuthTokenDto,
  FindAuthTokenDto,
  CreateAuthClientDto,
  UpdateAuthClientDto,
} from "../dtos/auth-tokens-request.dtos";

export class OAuthRepositoryMapper {
  static toDomainAuthClient(
    row: typeof authClients.$inferSelect,
  ): AuthClientEntity {
    return new AuthClientEntity(
      row.id,
      row.userId,
      row.providerId,
      row.clientId,
      row.salt,
      row.createdAt,
      row.updatedAt,
    );
  }

  static toDomainAuthProvider(
    row: typeof authProviders.$inferSelect,
  ): AuthProviderEntity {
    return new AuthProviderEntity(
      row.id,
      row.provider as AuthProvider,
      row.imgUrl ?? "",
      row.createdAt,
      row.updatedAt,
    );
  }

  static toDomainAuthToken(
    row: typeof authTokens.$inferSelect,
  ): AuthTokenEntity {
    return new AuthTokenEntity(
      row.id,
      row.authClientId,
      row.providerAccessToken ?? "",
      row.providerRefreshToken ?? "",
      row.refreshToken ?? "",
      row.revoked ?? false,
      row.expiresAt ?? new Date(),
      row.createdAt,
      row.updatedAt,
    );
  }

  static toRowAuthClient(
    authClient: AuthClientEntity,
  ): typeof authClients.$inferInsert {
    return {
      id: authClient.id ?? uuidv7(),
      userId: authClient.userId,
      providerId: authClient.providerId,
      clientId: authClient.clientId,
      salt: authClient.salt ?? "",
    };
  }

  static toRowAuthProvider(
    authProvider: AuthProviderEntity,
  ): typeof authProviders.$inferInsert {
    return {
      id: authProvider.id,
      provider: authProvider.provider,
      imgUrl: authProvider.imgUrl,
    };
  }

  static toRowAuthToken(
    authToken: AuthTokenEntity,
  ): typeof authTokens.$inferInsert {
    return {
      id: authToken.id ?? uuidv7(),
      authClientId: authToken.authClientId || "",
      providerAccessToken: authToken.providerAccessToken,
      providerRefreshToken: authToken.providerRefreshToken,
      refreshToken: authToken.refreshToken,
      revoked: authToken.revoked ?? false,
      expiresAt: authToken.expiresAt ?? new Date(),
      createdAt: authToken.createdAt ?? new Date(),
      updatedAt: authToken.updatedAt ?? new Date(),
    };
  }

  static toRowUpdateAuthToken(
    authToken: AuthTokenInfo,
  ): typeof authTokens.$inferSelect {
    return {
      id: authToken.id,
      authClientId: authToken.authClientId ?? "",
      providerAccessToken: authToken.providerAccessToken,
      providerRefreshToken: authToken.providerRefreshToken,
      refreshToken: authToken.refreshToken,
      revoked: authToken.revoked ?? false,
    };
  }
}
