import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import { DRIZZLE_DB } from "@mariadb/constants/mariadb.constants";
import { IAuthRepositoryPort } from "@src/core/ports/out/auth.repository.port";
import * as dbSchema from "./schema/auth";
import { OAuthClient } from "@src/core/domain/entities/oauth-client.entity";
import { OAuthRepositoryMapper } from "./mappers/oauth-repository.mapper";
import { OAuthToken } from "@src/core/domain/entities/oauth-token.entity";
import {
  AuthProvider,
  AuthProviderType,
} from "@src/core/domain/entities/auth-provider.entity";

@Injectable()
export class MariadbRepository implements IAuthRepositoryPort {
  constructor(
    @Inject(DRIZZLE_DB("auth"))
    private readonly db: MySql2Database<typeof dbSchema>,
  ) {}

  async findProviderByProvider(
    provider: AuthProviderType,
  ): Promise<AuthProvider | null> {
    const providers = await this.db
      .select()
      .from(dbSchema.authProviders)
      .where(eq(dbSchema.authProviders.provider, provider))
      .limit(1)
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
      .from(dbSchema.authClients)
      .where(
        and(
          eq(dbSchema.authClients.providerId, providerId),
          eq(dbSchema.authClients.userId, userId),
        ),
      )
      .limit(1)
      .then((clients) => clients.map(OAuthRepositoryMapper.toDomainOAuthClient))
      .then((clients) => clients[0] ?? null);
    return client ?? null;
  }

  async findRoleIdByName(name: string): Promise<string | null> {
    const role = await this.db
      .select()
      .from(dbSchema.authProviders)
      .where(eq(dbSchema.authProviders.provider, name));
    return role[0]?.id ?? null;
  }

  async createOAuthClient(
    oauthClient: OAuthClient,
  ): Promise<OAuthClient | null> {
    const client = await this.db
      .insert(dbSchema.authClients)
      .values(OAuthRepositoryMapper.toRowOAuthClient(oauthClient))
      .$returningId()
      .then((clients) => clients.map(OAuthRepositoryMapper.toDomainOAuthClient))
      .then((clients) => clients[0] ?? null);
    return client ?? null;
  }

  async createOAuthToken(oauthToken: OAuthToken): Promise<OAuthToken | null> {
    const token = await this.db
      .insert(dbSchema.authTokens)
      .values(OAuthRepositoryMapper.toRowOAuthToken(oauthToken))
      .$returningId()
      .then((tokens) => tokens.map(OAuthRepositoryMapper.toDomainOAuthToken))
      .then((tokens) => tokens[0] ?? null);
    return token ?? null;
  }
}
