import { AuthClientEntity } from "@auth/core/domain/entities/auth-client.entity";
import { AuthProviderEntity } from "@auth/core/domain/entities/auth-provider.entity";
import { AuthTokenEntity } from "@auth/core/domain/entities/token.entity";

export class FindProviderByProviderDomainRequestDto {
  provider: AuthProviderEntity["provider"];

  constructor(provider: AuthProviderEntity["provider"]) {
    this.provider = provider;
  }
}

export class FindAuthTokenDomainRequestDto {
  authClientId: AuthClientEntity["id"];

  constructor(authClientId: AuthClientEntity["id"]) {
    this.authClientId = authClientId;
  }
}

export class FindAuthClientByClientIdAndProviderIdDomainRequestDto {
  providerId: AuthProviderEntity["id"];
  clientId: AuthClientEntity["clientId"];

  constructor(
    providerId: AuthProviderEntity["id"],
    clientId: AuthClientEntity["clientId"],
  ) {
    this.providerId = providerId;
    this.clientId = clientId;
  }
}

export class FindProviderByProviderDomainResponseDto {
  id: AuthProviderEntity["id"];
  provider: AuthProviderEntity["provider"];

  constructor(
    id: AuthProviderEntity["id"],
    provider: AuthProviderEntity["provider"],
  ) {
    this.id = id;
    this.provider = provider;
  }
}

export class FindAuthTokenDomainResponseDto {
  id: AuthTokenEntity["id"];
  authClientId: AuthTokenEntity["authClientId"];
  revoked: AuthTokenEntity["revoked"];
  expiresAt: AuthTokenEntity["expiresAt"];
  createdAt: AuthTokenEntity["createdAt"];

  constructor(
    id: AuthTokenEntity["id"],
    authClientId: AuthTokenEntity["authClientId"],
    revoked: AuthTokenEntity["revoked"],
    expiresAt: AuthTokenEntity["expiresAt"],
    createdAt: AuthTokenEntity["createdAt"],
  ) {
    this.id = id;
    this.authClientId = authClientId;
    this.revoked = revoked;
    this.expiresAt = expiresAt;
    this.createdAt = createdAt;
  }
}

export class FindAuthClientByClientIdAndProviderIdDomainResponseDto {
  id: AuthClientEntity["id"];
  userId: AuthClientEntity["userId"];

  constructor(id: AuthClientEntity["id"], userId: AuthClientEntity["userId"]) {
    this.id = id;
    this.userId = userId;
  }
}
