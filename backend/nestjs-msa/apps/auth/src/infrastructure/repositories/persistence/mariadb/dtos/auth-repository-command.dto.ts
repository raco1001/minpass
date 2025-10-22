import { authClients, authProviders, authTokens } from "../schema/auth";

export class CreateAuthTokensInfoPersistenceRequestDto
  implements Partial<typeof authTokens.$inferInsert>
{
  id?: (typeof authTokens.$inferSelect)["id"];
  authClientId: (typeof authClients.$inferSelect)["id"];
  providerAccessToken: (typeof authTokens.$inferSelect)["providerAccessToken"];
  providerRefreshToken: (typeof authTokens.$inferSelect)["providerRefreshToken"];
  refreshToken: (typeof authTokens.$inferSelect)["refreshToken"];

  constructor(
    authClientId: (typeof authClients.$inferSelect)["id"],
    providerAccessToken: (typeof authTokens.$inferSelect)["providerAccessToken"],
    providerRefreshToken: (typeof authTokens.$inferSelect)["providerRefreshToken"],
    refreshToken: (typeof authTokens.$inferSelect)["refreshToken"],
    id?: (typeof authTokens.$inferSelect)["id"],
  ) {
    this.id = id;
    this.authClientId = authClientId;
    this.providerAccessToken = providerAccessToken;
    this.providerRefreshToken = providerRefreshToken;
    this.refreshToken = refreshToken;
  }
}

export class UpsertAuthTokensInfoPersistenceRequestDto {
  authClientId: (typeof authClients.$inferSelect)["id"];
  providerAccessToken: (typeof authTokens.$inferSelect)["providerAccessToken"];
  providerRefreshToken: (typeof authTokens.$inferSelect)["providerRefreshToken"];
  refreshToken: (typeof authTokens.$inferSelect)["refreshToken"];
  revoked: (typeof authTokens.$inferSelect)["revoked"];
  expiresAt: (typeof authTokens.$inferSelect)["expiresAt"];
  updatedAt: (typeof authTokens.$inferSelect)["updatedAt"];

  constructor(
    authClientId: (typeof authClients.$inferSelect)["id"],
    providerAccessToken: (typeof authTokens.$inferSelect)["providerAccessToken"],
    providerRefreshToken: (typeof authTokens.$inferSelect)["providerRefreshToken"],
    refreshToken: (typeof authTokens.$inferSelect)["refreshToken"],
    revoked: (typeof authTokens.$inferSelect)["revoked"],
    expiresAt: (typeof authTokens.$inferSelect)["expiresAt"],
    updatedAt: (typeof authTokens.$inferSelect)["updatedAt"],
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

export class CreateAuthClientPersistenceRequestDto {
  userId: (typeof authClients.$inferSelect)["userId"];
  providerId: (typeof authClients.$inferSelect)["providerId"];
  clientId: (typeof authClients.$inferSelect)["clientId"];
  salt: (typeof authClients.$inferSelect)["salt"] | null;

  constructor(
    userId: (typeof authClients.$inferSelect)["userId"],
    providerId: (typeof authClients.$inferSelect)["providerId"],
    clientId: (typeof authClients.$inferSelect)["clientId"],
    salt: (typeof authClients.$inferSelect)["salt"] | null,
  ) {
    this.userId = userId;
    this.providerId = providerId;
    this.clientId = clientId;
    this.salt = salt ?? null;
  }
}

export class CreateAuthTokensInfoPersistenceResponseDto {
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

export class CreateAuthClientPersistenceResponseDto {
  userId: (typeof authClients.$inferSelect)["userId"];
  providerId: (typeof authClients.$inferSelect)["providerId"];
  clientId: (typeof authClients.$inferSelect)["clientId"];

  constructor(
    userId: (typeof authClients.$inferSelect)["userId"],
    providerId: (typeof authClients.$inferSelect)["providerId"],
    clientId: (typeof authClients.$inferSelect)["clientId"],
  ) {
    this.userId = userId;
    this.providerId = providerId;
    this.clientId = clientId;
  }
}

export class UpdateAuthClientPersistenceResponseDto {
  userId: (typeof authClients.$inferSelect)["userId"];
  providerId: (typeof authClients.$inferSelect)["providerId"];
  clientId: (typeof authClients.$inferSelect)["clientId"];
  updatedAt: (typeof authClients.$inferSelect)["updatedAt"];

  constructor(
    userId: (typeof authClients.$inferSelect)["userId"],
    providerId: (typeof authClients.$inferSelect)["providerId"],
    clientId: (typeof authClients.$inferSelect)["clientId"],
    updatedAt: (typeof authClients.$inferSelect)["updatedAt"],
  ) {
    this.userId = userId;
    this.providerId = providerId;
    this.clientId = clientId;
    this.updatedAt = updatedAt;
  }
}

export class UpdateAuthTokensInfoPersistenceResponseDto {
  id: (typeof authTokens.$inferSelect)["id"];
  authClientId: (typeof authTokens.$inferSelect)["authClientId"];
  revoked: (typeof authTokens.$inferSelect)["revoked"];
  expiresAt: (typeof authTokens.$inferSelect)["expiresAt"];
  updatedAt: (typeof authTokens.$inferSelect)["updatedAt"];

  constructor(
    id: (typeof authTokens.$inferSelect)["id"],
    authClientId: (typeof authTokens.$inferSelect)["authClientId"],
    revoked: (typeof authTokens.$inferSelect)["revoked"],
    expiresAt: (typeof authTokens.$inferSelect)["expiresAt"],
    updatedAt: (typeof authTokens.$inferSelect)["updatedAt"],
  ) {
    this.id = id;
    this.authClientId = authClientId;
    this.revoked = revoked;
    this.expiresAt = expiresAt;
    this.updatedAt = updatedAt;
  }
}
