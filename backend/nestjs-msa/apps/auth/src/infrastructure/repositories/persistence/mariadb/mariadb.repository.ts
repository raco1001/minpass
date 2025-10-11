import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { DRIZZLE_DB } from "@app/integrations/mariadb/constants/mariadb.constants";
import {
  AuthRepositoryPort,
  AuthTokenInfo,
} from "@auth/core/ports/out/auth.repository.port";
import * as authSchema from "./schema/auth";
import { AuthClientEntity } from "@auth/core/domain/entities/auth-client.entity";
import { OAuthRepositoryMapper } from "./mappers/oauth-repository.mapper";
import { AuthTokenEntity } from "@auth/core/domain/entities/token.entity";
import { AuthProviderEntity } from "@auth/core/domain/entities/auth-provider.entity";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";
import { DrizzleDb } from "@app/integrations/mariadb/constants/mariadb.types";
import {
  CreateAuthTokenDto,
  UpdateAuthTokenDto,
  FindAuthTokenDto,
  CreateAuthClientDto,
  UpdateAuthClientDto,
} from "./dtos/auth-tokens-request.dtos";

@Injectable()
export class MariadbRepository implements AuthRepositoryPort {
  constructor(
    @Inject(DRIZZLE_DB("auth"))
    private readonly db: DrizzleDb,
  ) {}

  async findProviderByProvider(
    provider: AuthProvider,
  ): Promise<AuthProviderEntity | null> {
    const providers = await this.db
      .select()
      .from(authSchema.authProviders)
      .where(eq(authSchema.authProviders.provider, provider))
      .then((providers) =>
        providers.map(OAuthRepositoryMapper.toDomainAuthProvider),
      );
    return providers[0] ?? null;
  }

  async findAuthClientByClientIdAndProviderId(
    providerId: string,
    clientId: string,
  ): Promise<AuthClientEntity | null> {
    const client = await this.db
      .select()
      .from(authSchema.authClients)
      .where(
        and(
          eq(authSchema.authClients.providerId, providerId),
          eq(authSchema.authClients.clientId, clientId),
        ),
      )
      .then((clients) => clients.map(OAuthRepositoryMapper.toDomainAuthClient))
      .then((clients) => clients[0] ?? null);
    return client ?? null;
  }

  async createAuthClient(
    authClient: AuthClientEntity,
  ): Promise<AuthClientEntity | null> {
    const client = await this.db
      .insert(authSchema.authClients)
      .values(OAuthRepositoryMapper.toRowAuthClient(authClient))
      .$returningId()
      .then((clients) => clients.map(OAuthRepositoryMapper.toDomainAuthClient))
      .then((clients) => clients[0] ?? null);
    return client ?? null;
  }

  async createAuthToken(
    authToken: AuthTokenEntity,
  ): Promise<AuthTokenEntity | null> {
    const token = await this.db
      .insert(authSchema.authTokens)
      .values(OAuthRepositoryMapper.toRowAuthToken(authToken))
      .$returningId()
      .then((tokens) => tokens.map(OAuthRepositoryMapper.toDomainAuthToken))
      .then((tokens) => tokens[0] ?? null);
    return token ?? null;
  }

  async updateAuthClientTimestamp(
    authClientId: UpdateAuthClientDto,
  ): Promise<boolean> {
    const isUpdated = await this.db
      .update(authSchema.authClients)
      .set({ updatedAt: new Date() })
      .where(eq(authSchema.authClients.id, authClientId.id ?? ""))
      .then((clients) => clients[0] ?? null);
    return isUpdated ? true : false;
  }

  async updateAuthTokens(authTokenInfo: AuthTokenInfo): Promise<boolean> {
    const isUpdated = await this.db
      .update(authSchema.authTokens)
      .set(
        OAuthRepositoryMapper.toRowAuthToken(authTokenInfo as AuthTokenEntity),
      )
      .where(eq(authSchema.authTokens.id, authTokenInfo.id ?? ""))
      .then((tokens) => tokens[0] ?? null);
    return isUpdated ? true : false;
  }

  async findAuthTokenInfoByClientId(
    clientId: AuthClientEntity["id"],
  ): Promise<AuthTokenInfo | null> {
    const token = await this.db
      .select()
      .from(authSchema.authTokens)
      .where(eq(authSchema.authTokens.authClientId, clientId))
      .then((tokens) => tokens.map(OAuthRepositoryMapper.toDomainAuthToken))
      .then((tokens) => tokens[0] ?? null);
    return token ?? null;
  }
}
