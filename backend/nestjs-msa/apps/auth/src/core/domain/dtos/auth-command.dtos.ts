import { AuthTokenEntity } from "@auth/core/domain/entities/token.entity";
import { AuthClientEntity } from "@auth/core/domain/entities/auth-client.entity";
import { AuthProviderEntity } from "@auth/core/domain/entities/auth-provider.entity";
import { User } from "@app/contracts/generated/users/v1/users";

export class CreateAuthTokenDomainRequestDto {
  authClientId: AuthClientEntity["id"];
  providerAccessToken: AuthTokenEntity["providerAccessToken"];
  providerRefreshToken: AuthTokenEntity["providerRefreshToken"];
  refreshToken: AuthTokenEntity["refreshToken"];

  constructor(
    authClientId: AuthClientEntity["id"],
    providerAccessToken: AuthTokenEntity["providerAccessToken"],
    providerRefreshToken: AuthTokenEntity["providerRefreshToken"],
    refreshToken: AuthTokenEntity["refreshToken"],
  ) {
    this.authClientId = authClientId;
    this.providerAccessToken = providerAccessToken;
    this.providerRefreshToken = providerRefreshToken;
    this.refreshToken = refreshToken;
  }
}

export class UpdateAuthTokensInfoDomainRequestDto {
  authClientId: AuthClientEntity["id"];
  providerAccessToken: AuthTokenEntity["providerAccessToken"];
  providerRefreshToken: AuthTokenEntity["providerRefreshToken"];
  refreshToken: AuthTokenEntity["refreshToken"];
  revoked: AuthTokenEntity["revoked"];
  expiresAt: AuthTokenEntity["expiresAt"];
  updatedAt: AuthTokenEntity["updatedAt"];

  constructor(
    authClientId: AuthClientEntity["id"],
    providerAccessToken: AuthTokenEntity["providerAccessToken"],
    providerRefreshToken: AuthTokenEntity["providerRefreshToken"],
    refreshToken: AuthTokenEntity["refreshToken"],
    revoked: AuthTokenEntity["revoked"],
    expiresAt: AuthTokenEntity["expiresAt"],
    updatedAt: AuthTokenEntity["updatedAt"],
  ) {
    this.authClientId = authClientId;
    this.providerAccessToken = providerAccessToken;
    this.providerRefreshToken = providerRefreshToken;
    this.refreshToken = refreshToken;
    this.revoked = revoked;
    this.expiresAt = expiresAt;
    this.updatedAt = updatedAt;
  }
}

export class CreateAuthClientDomainRequestDto {
  userId: User["id"];
  providerId: AuthProviderEntity["id"];
  clientId: AuthClientEntity["clientId"];
  salt: AuthClientEntity["salt"] | null;

  constructor(
    userId: User["id"],
    providerId: AuthProviderEntity["id"],
    clientId: AuthClientEntity["clientId"],
    salt: AuthClientEntity["salt"] | null,
  ) {
    this.userId = userId;
    this.providerId = providerId;
    this.clientId = clientId;
    this.salt = salt;
  }
}

export class CreateAuthTokenDomainResponseDto {
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

export class CreateAuthClientDomainResponseDto {
  userId: AuthClientEntity["userId"];
  providerId: AuthClientEntity["providerId"];
  clientId: AuthClientEntity["clientId"];

  constructor(
    userId: AuthClientEntity["userId"],
    providerId: AuthClientEntity["providerId"],
    clientId: AuthClientEntity["clientId"],
  ) {
    this.userId = userId;
    this.providerId = providerId;
    this.clientId = clientId;
  }
}

export class UpdateAuthClientDomainResponseDto {
  userId: AuthClientEntity["userId"];
  providerId: AuthClientEntity["providerId"];
  clientId: AuthClientEntity["clientId"];
  updatedAt: AuthClientEntity["updatedAt"];

  constructor(
    userId: AuthClientEntity["userId"],
    providerId: AuthClientEntity["providerId"],
    clientId: AuthClientEntity["clientId"],
    updatedAt: AuthClientEntity["updatedAt"],
  ) {
    this.userId = userId;
    this.providerId = providerId;
    this.clientId = clientId;
    this.updatedAt = updatedAt;
  }
}

export class UpdateAuthTokensInfoDomainResponseDto {
  id: AuthTokenEntity["id"];
  authClientId: AuthTokenEntity["authClientId"];
  revoked: AuthTokenEntity["revoked"];
  expiresAt: AuthTokenEntity["expiresAt"];
  updatedAt: AuthTokenEntity["updatedAt"];

  constructor(
    id: AuthTokenEntity["id"],
    authClientId: AuthTokenEntity["authClientId"],
    revoked: AuthTokenEntity["revoked"],
    expiresAt: AuthTokenEntity["expiresAt"],
    updatedAt: AuthTokenEntity["updatedAt"],
  ) {
    this.id = id;
    this.authClientId = authClientId;
    this.revoked = revoked;
    this.expiresAt = expiresAt;
    this.updatedAt = updatedAt;
  }
}
