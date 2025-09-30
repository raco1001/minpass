import { OAuthClient } from "@src/core/domain/entities/oauth-client.entity";
import { authClients, authProviders, authTokens } from "../schema/auth";
import { OAuthToken } from "@src/core/domain/entities/oauth-token.entity";
import { v7 as uuidv7 } from "uuid";
import {
  AuthProvider,
  AuthProviderType,
} from "@src/core/domain/entities/auth-provider.entity";

export class OAuthRepositoryMapper {
  static toDomainOAuthClient(
    row: typeof authClients.$inferSelect,
  ): OAuthClient {
    return new OAuthClient(
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
  ): AuthProvider {
    return new AuthProvider(
      row.id,
      row.provider as AuthProviderType,
      row.imgUrl ?? "",
      row.createdAt,
      row.updatedAt,
    );
  }

  static toDomainOAuthToken(row: typeof authTokens.$inferSelect): OAuthToken {
    return new OAuthToken(
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

  static toRowOAuthClient(
    oauthClient: OAuthClient,
  ): typeof authClients.$inferInsert {
    return {
      id: oauthClient.id ?? uuidv7(),
      userId: oauthClient.userId,
      providerId: oauthClient.providerId,
      clientId: oauthClient.clientId,
      salt: oauthClient.salt,
    };
  }

  static toRowAuthProvider(
    authProvider: AuthProvider,
  ): typeof authProviders.$inferInsert {
    return {
      id: authProvider.id,
      provider: authProvider.provider,
      imgUrl: authProvider.imgUrl,
    };
  }

  static toRowOAuthToken(
    oauthToken: OAuthToken,
  ): typeof authTokens.$inferInsert {
    return {
      id: oauthToken.id ?? uuidv7(),
      authClientId: oauthToken.oauthClientId,
      providerAccessToken: oauthToken.providerAccessToken,
      providerRefreshToken: oauthToken.providerRefreshToken,
      refreshToken: oauthToken.refreshToken,
      revoked: oauthToken.revoked,
      expiresAt: oauthToken.expiresAt,
      createdAt: oauthToken.createdAt,
      updatedAt: oauthToken.updatedAt,
    };
  }
}
