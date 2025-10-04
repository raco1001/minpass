import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { DRIZZLE_DB } from "@mariadb/constants/mariadb.constants";
import { AuthRepositoryPort } from "@src/core/ports/out/auth.repository.port";
import * as authSchema from "./schema/auth";
import { OAuthClient } from "@src/core/domain/entities/oauth-client.entity";
import { OAuthRepositoryMapper } from "./mappers/oauth-repository.mapper";
import { OAuthToken } from "@src/core/domain/entities/oauth-token.entity";
import {
  AuthProvider,
  AuthProviderType,
} from "@src/core/domain/entities/auth-provider.entity";
import { DrizzleDb } from "@mariadb/constants/mariadb.types";

@Injectable()
export class MariadbRepository implements AuthRepositoryPort {
  constructor(
    @Inject(DRIZZLE_DB("auth"))
    private readonly db: DrizzleDb,
  ) {}

  async findProviderByProvider(
    provider: AuthProviderType,
  ): Promise<AuthProvider | null> {
    const providers = await this.db
      .select()
      .from(authSchema.authProviders)
      .where(eq(authSchema.authProviders.provider, provider))
      .then((providers) =>
        providers.map(OAuthRepositoryMapper.toDomainAuthProvider),
      );
    return providers[0] ?? null;
  }

  async findOAuthClientByUserIdAndProviderId(
    providerId: string,
    userId: string,
  ): Promise<OAuthClient | null> {
    const client = await this.db
      .select()
      .from(authSchema.authClients)
      .where(
        and(
          eq(authSchema.authClients.providerId, providerId),
          eq(authSchema.authClients.userId, userId),
        ),
      )
      .then((clients) => clients.map(OAuthRepositoryMapper.toDomainOAuthClient))
      .then((clients) => clients[0] ?? null);
    return client ?? null;
  }

  async findRoleIdByName(name: string): Promise<string | null> {
    const role = await this.db
      .select()
      .from(authSchema.authProviders)
      .where(eq(authSchema.authProviders.provider, name));
    return role[0]?.id ?? null;
  }

  async createOAuthClient(
    oauthClient: OAuthClient,
  ): Promise<OAuthClient | null> {
    const client = await this.db
      .insert(authSchema.authClients)
      .values(OAuthRepositoryMapper.toRowOAuthClient(oauthClient))
      .$returningId()
      .then((clients) => clients.map(OAuthRepositoryMapper.toDomainOAuthClient))
      .then((clients) => clients[0] ?? null);
    return client ?? null;
  }

  async createOAuthToken(oauthToken: OAuthToken): Promise<OAuthToken | null> {
    const token = await this.db
      .insert(authSchema.authTokens)
      .values(OAuthRepositoryMapper.toRowOAuthToken(oauthToken))
      .$returningId()
      .then((tokens) => tokens.map(OAuthRepositoryMapper.toDomainOAuthToken))
      .then((tokens) => tokens[0] ?? null);
    return token ?? null;
  }
}
