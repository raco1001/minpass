import { authClients, authProviders, authTokens } from "../schema/auth";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";

export class FindProviderByProviderPersistenceRequestDto
  implements Partial<typeof authProviders.$inferSelect>
{
  provider: (typeof authProviders.$inferSelect)["provider"];

  constructor(provider: (typeof authProviders.$inferSelect)["provider"]) {
    this.provider = provider;
  }

  // 정적 팩토리 메서드 사용 예시
  static from(params: {
    provider: (typeof authProviders.$inferSelect)["provider"];
  }): FindProviderByProviderPersistenceRequestDto {
    return new FindProviderByProviderPersistenceRequestDto(
      params.provider as AuthProvider,
    );
  }
}

export class FindAuthTokenInfoPersistenceRequestDto {
  authClientId: (typeof authClients.$inferSelect)["id"];

  constructor(authClientId: (typeof authClients.$inferSelect)["id"]) {
    this.authClientId = authClientId;
  }
}

export class FindAuthClientByClientIdAndProviderIdPersistenceRequestDto {
  providerId: (typeof authClients.$inferSelect)["providerId"];
  clientId: (typeof authClients.$inferSelect)["clientId"];

  constructor(
    providerId: (typeof authClients.$inferSelect)["providerId"],
    clientId: (typeof authClients.$inferSelect)["clientId"],
  ) {
    this.providerId = providerId;
    this.clientId = clientId;
  }
}

export class FindProviderByProviderDomainResponseDto {
  id: (typeof authProviders.$inferSelect)["id"];
  provider: (typeof authProviders.$inferSelect)["provider"];

  constructor(
    id: (typeof authProviders.$inferSelect)["id"],
    provider: (typeof authProviders.$inferSelect)["provider"],
  ) {
    this.id = id;
    this.provider = provider;
  }
}

export class FindAuthTokenDomainResponseDto {
  id: (typeof authTokens.$inferSelect)["id"];
  authClientId: (typeof authTokens.$inferSelect)["authClientId"];
  revoked: (typeof authTokens.$inferSelect)["revoked"];
  expiresAt: (typeof authTokens.$inferSelect)["expiresAt"];
  createdAt: (typeof authTokens.$inferSelect)["createdAt"];

  constructor(
    id: (typeof authTokens.$inferSelect)["id"],
    authClientId: (typeof authTokens.$inferSelect)["authClientId"],
    revoked: (typeof authTokens.$inferSelect)["revoked"],
    expiresAt: (typeof authTokens.$inferSelect)["expiresAt"],
    createdAt: (typeof authTokens.$inferSelect)["createdAt"],
  ) {
    this.id = id;
    this.authClientId = authClientId;
    this.revoked = revoked;
    this.expiresAt = expiresAt;
    this.createdAt = createdAt;
  }
}

export class FindAuthClientByClientIdAndProviderIdDomainResponseDto {
  id: (typeof authClients.$inferSelect)["id"];
  userId: (typeof authClients.$inferSelect)["userId"];

  constructor(
    id: (typeof authClients.$inferSelect)["id"],
    userId: (typeof authClients.$inferSelect)["userId"],
  ) {
    this.id = id;
    this.userId = userId;
  }
}
