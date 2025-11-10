import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { DRIZZLE_DB } from "@app/integrations/mariadb/constants/mariadb.constants";
import { v7 as uuidv7 } from "uuid";
import { AuthRepositoryPort } from "@auth/core/ports/out/auth.repository.port";
import * as authSchema from "./schema/auth";
import { AuthQueryMapper } from "./mappers/oauth-query.mapper";
import { DrizzleDb } from "@app/integrations/mariadb/constants/mariadb.types";
import { AuthCommandMapper } from "./mappers/auth-command.mapper";
import {
  FindProviderByProviderDomainRequestDto,
  FindProviderByProviderDomainResponseDto,
  FindAuthClientByClientIdAndProviderIdDomainRequestDto,
  FindAuthTokenDomainRequestDto,
  FindAuthTokenDomainResponseDto,
} from "@auth/core/domain/dtos/auth-query.dto";
import { FindAuthClientByClientIdAndProviderIdDomainResponseDto } from "./dtos/auth-repository-query.dto";
import {
  CreateAuthClientDomainRequestDto,
  CreateAuthClientDomainResponseDto,
  CreateAuthTokenDomainRequestDto,
  CreateAuthTokenDomainResponseDto,
  UpdateAuthClientDomainResponseDto,
  UpsertAuthTokensInfoDomainRequestDto,
  UpsertAuthTokensInfoDomainResponseDto,
} from "@auth/core/domain/dtos/auth-command.dtos";

@Injectable()
export class MariadbRepository implements AuthRepositoryPort {
  constructor(
    @Inject(DRIZZLE_DB("auth"))
    private readonly db: DrizzleDb,
  ) {}

  async findProviderByProvider(
    provider: FindProviderByProviderDomainRequestDto,
  ): Promise<FindProviderByProviderDomainResponseDto | null> {
    const providers = await this.db
      .select({
        id: authSchema.authProviders.id,
        provider: authSchema.authProviders.provider,
      })
      .from(authSchema.authProviders)
      .where(eq(authSchema.authProviders.provider, provider.provider))
      .then((providers) =>
        providers.map(AuthQueryMapper.toDomainFindProviderByProvider),
      );
    return (providers[0] as FindProviderByProviderDomainResponseDto) ?? null;
  }

  async findAuthClientByClientIdAndProviderId(
    authClient: FindAuthClientByClientIdAndProviderIdDomainRequestDto,
  ): Promise<FindAuthClientByClientIdAndProviderIdDomainResponseDto | null> {
    const client = await this.db
      .select({
        id: authSchema.authClients.id,
        userId: authSchema.authClients.userId,
        providerId: authSchema.authClients.providerId,
        clientId: authSchema.authClients.clientId,
      })
      .from(authSchema.authClients)
      .where(
        and(
          eq(authSchema.authClients.providerId, authClient.providerId),
          eq(authSchema.authClients.clientId, authClient.clientId),
        ),
      )
      .then((clients) =>
        clients.map(
          AuthQueryMapper.toDomainFindAuthClientByClientIdAndProviderId,
        ),
      )
      .then(
        (clients) =>
          clients[0] as FindAuthClientByClientIdAndProviderIdDomainResponseDto,
      );
    return client ?? null;
  }

  async createAuthClient(
    authClient: CreateAuthClientDomainRequestDto,
  ): Promise<CreateAuthClientDomainResponseDto | null> {
    await this.db.insert(authSchema.authClients).values({
      id: uuidv7(),
      userId: authClient.userId,
      providerId: authClient.providerId,
      clientId: authClient.clientId,
      salt: authClient.salt ?? "",
    });

    const result = await this.db
      .select({
        userId: authSchema.authClients.userId,
        providerId: authSchema.authClients.providerId,
        clientId: authSchema.authClients.clientId,
      })
      .from(authSchema.authClients)
      .where(
        and(
          eq(authSchema.authClients.userId, authClient.userId),
          eq(authSchema.authClients.providerId, authClient.providerId),
          eq(authSchema.authClients.clientId, authClient.clientId),
        ),
      )
      .then((clients) =>
        clients.map(AuthCommandMapper.toDomainCreateAuthClient),
      );

    return result[0] ?? null;
  }

  async createAuthToken(
    authToken: CreateAuthTokenDomainRequestDto,
  ): Promise<CreateAuthTokenDomainResponseDto | null> {
    await this.db.insert(authSchema.authTokens).values({
      id: uuidv7(),
      authClientId: authToken.authClientId,
      providerAccessToken: authToken.providerAccessToken ?? "",
      providerRefreshToken: authToken.providerRefreshToken ?? "",
      refreshToken: authToken.refreshToken ?? "",
      revoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    });

    const tokens = await this.db
      .select({
        id: authSchema.authTokens.id,
        authClientId: authSchema.authTokens.authClientId,
        revoked: authSchema.authTokens.revoked,
        expiresAt: authSchema.authTokens.expiresAt,
        createdAt: authSchema.authTokens.createdAt,
      })
      .from(authSchema.authTokens)
      .where(eq(authSchema.authTokens.authClientId, authToken.authClientId))
      .then((tokens) =>
        tokens.map(AuthCommandMapper.toDomainCreateAuthTokensInfo),
      );

    return tokens[0] ?? null;
  }

  async updateAuthClientTimestamp(
    authClient: UpdateAuthClientDomainResponseDto,
  ): Promise<UpdateAuthClientDomainResponseDto | null> {
    await this.db
      .update(authSchema.authClients)
      .set({ updatedAt: new Date() })
      .where(
        and(
          eq(authSchema.authClients.userId, authClient.userId),
          eq(authSchema.authClients.providerId, authClient.providerId),
          eq(authSchema.authClients.clientId, authClient.clientId),
        ),
      );

    const updated = await this.db
      .select({
        userId: authSchema.authClients.userId,
        providerId: authSchema.authClients.providerId,
        clientId: authSchema.authClients.clientId,
        updatedAt: authSchema.authClients.updatedAt,
      })
      .from(authSchema.authClients)
      .where(
        and(
          eq(authSchema.authClients.userId, authClient.userId),
          eq(authSchema.authClients.providerId, authClient.providerId),
          eq(authSchema.authClients.clientId, authClient.clientId),
        ),
      )
      .then((clients) =>
        clients.map(AuthCommandMapper.toDomainUpdateAuthClient),
      );

    return updated[0] ?? null;
  }

  async upsertAuthTokens(
    authTokenInfo: UpsertAuthTokensInfoDomainRequestDto,
  ): Promise<UpsertAuthTokensInfoDomainResponseDto | null> {
    const existingToken = await this.db
      .select({ id: authSchema.authTokens.id })
      .from(authSchema.authTokens)
      .where(eq(authSchema.authTokens.authClientId, authTokenInfo.authClientId))
      .then((tokens) => tokens[0] ?? null);

    if (existingToken) {
      await this.db
        .update(authSchema.authTokens)
        .set({
          providerAccessToken: authTokenInfo.providerAccessToken,
          providerRefreshToken: authTokenInfo.providerRefreshToken,
          refreshToken: authTokenInfo.refreshToken,
          revoked: authTokenInfo.revoked,
          expiresAt: authTokenInfo.expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(authSchema.authTokens.id, existingToken.id));
    } else {
      await this.db.insert(authSchema.authTokens).values({
        id: uuidv7(),
        authClientId: authTokenInfo.authClientId,
        providerAccessToken: authTokenInfo.providerAccessToken,
        providerRefreshToken: authTokenInfo.providerRefreshToken,
        refreshToken: authTokenInfo.refreshToken,
        revoked: authTokenInfo.revoked,
        expiresAt: authTokenInfo.expiresAt,
      });
    }

    // Step 3: upsert 후 결과 조회
    const result = await this.db
      .select({
        id: authSchema.authTokens.id,
        authClientId: authSchema.authTokens.authClientId,
        revoked: authSchema.authTokens.revoked,
        expiresAt: authSchema.authTokens.expiresAt,
        updatedAt: authSchema.authTokens.updatedAt,
      })
      .from(authSchema.authTokens)
      .where(eq(authSchema.authTokens.authClientId, authTokenInfo.authClientId))
      .then((tokens) =>
        tokens.map(AuthCommandMapper.toDomainUpsertAuthTokensInfo),
      );

    return result[0] ?? null;
  }

  async findAuthTokenInfoByClientId(
    request: FindAuthTokenDomainRequestDto,
  ): Promise<FindAuthTokenDomainResponseDto | null> {
    const tokens = await this.db
      .select({
        id: authSchema.authTokens.id,
        authClientId: authSchema.authTokens.authClientId,
        revoked: authSchema.authTokens.revoked,
        expiresAt: authSchema.authTokens.expiresAt,
        createdAt: authSchema.authTokens.createdAt,
      })
      .from(authSchema.authTokens)
      .where(eq(authSchema.authTokens.authClientId, request.authClientId))
      .then((tokens) => tokens.map(AuthQueryMapper.toDomainFindAuthTokenInfo));

    return tokens[0] ?? null;
  }
}
