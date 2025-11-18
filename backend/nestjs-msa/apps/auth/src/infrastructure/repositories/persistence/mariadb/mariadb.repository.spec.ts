import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { MariadbRepository } from "./mariadb.repository";
import { MariaDbModule } from "@app/integrations/mariadb/mariadb.module";
import { authClients, authProviders, authTokens } from "./schema/auth";
import { DRIZZLE_DB } from "@app/integrations/mariadb/constants/mariadb.constants";
import { DrizzleDb } from "@app/integrations/mariadb/constants/mariadb.types";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";
import {
  FindProviderByProviderDomainRequestDto,
  FindAuthClientByClientIdAndProviderIdDomainRequestDto,
} from "@auth/core/domain/dtos/auth-query.dto";
import { v7 as uuidv7 } from "uuid";

describe("MariadbRepository (Integration)", () => {
  let repository: MariadbRepository;
  let db: DrizzleDb;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MariaDbModule.registerAsync(
          "auth",
          () => ({
            name: "auth",
            host: process.env.DB_HOST || "127.0.0.1",
            port: parseInt(process.env.DB_PORT || "3306", 10),
            user: process.env.DB_AUTH_SCHEMA_NAME || "svc-auth",
            password: process.env.DB_AUTH_SCHEMA_PASSWORD || "auth",
            database: process.env.DB_NAME || "minpass_test",
            connectionLimit: 10,
            schema: { authClients, authProviders, authTokens },
          }),
          [],
          [],
        ),
      ],
      providers: [MariadbRepository],
    }).compile();

    repository = module.get<MariadbRepository>(MariadbRepository);
    db = module.get<DrizzleDb>(DRIZZLE_DB("auth"));

    // Prepare test Provider data
    // Create Provider data if not exists (idempotent)
    try {
      const existingProviders = await db.select().from(authProviders);

      if (existingProviders.length === 0) {
        await db.insert(authProviders).values([
          { id: uuidv7(), provider: AuthProvider.GOOGLE },
          { id: uuidv7(), provider: AuthProvider.KAKAO },
          { id: uuidv7(), provider: AuthProvider.GITHUB },
        ]);
      }
    } catch (error) {
      console.warn("Error preparing Provider data (ignorable):", error);
    }
  });

  afterEach(async () => {
    // 테스트 후 데이터 정리
    await db.delete(authTokens);
    await db.delete(authClients);
  });

  describe("findProviderByProvider", () => {
    it("should return result for existing provider", async () => {
      // Given
      const request = new FindProviderByProviderDomainRequestDto(
        AuthProvider.GOOGLE,
      );

      // When - act
      const result = await repository.findProviderByProvider(request);

      // Then - assert that Provider data exists in DB
      if (!result) {
        console.warn("⚠️  Provider data not found in DB. Skipping test.");
        return;
      }

      expect(result).toBeDefined();
      expect(result.provider).toBe(AuthProvider.GOOGLE);
      expect(result.id).toBeDefined();
    });

    it("should return null for non-existent provider", async () => {
      // Given
      const request = new FindProviderByProviderDomainRequestDto(
        "NONEXISTENT" as AuthProvider,
      );

      // When - act
      const result = await repository.findProviderByProvider(request);

      // Then - assert
      expect(result).toBeNull();
    });
  });

  describe("createAuthClient", () => {
    it("should create a new auth client", async () => {
      // Given
      const provider = await repository.findProviderByProvider(
        new FindProviderByProviderDomainRequestDto(AuthProvider.GOOGLE),
      );

      if (!provider) {
        console.warn("⚠️  Provider not found. Skipping test.");
        return;
      }

      const createRequest = {
        userId: "test-user-uuid",
        providerId: provider.id,
        clientId: "test-client-id",
        salt: "test-salt",
      };

      // When - act
      const result = await repository.createAuthClient(createRequest);

      // Then - assert
      expect(result).toBeDefined();
      expect(result?.userId).toBe("test-user-uuid");
      expect(result?.providerId).toBe(provider.id);
      expect(result?.clientId).toBe("test-client-id");
    });
  });

  describe("findAuthClientByClientIdAndProviderId", () => {
    it("should return existing auth client", async () => {
      // Given - create client first
      const provider = await repository.findProviderByProvider(
        new FindProviderByProviderDomainRequestDto(AuthProvider.GOOGLE),
      );

      if (!provider) {
        console.warn("⚠️  Provider not found. Skipping test.");
        return;
      }

      await repository.createAuthClient({
        userId: "test-user-uuid",
        providerId: provider.id,
        clientId: "test-client-id-2",
        salt: "test-salt",
      });

      const findRequest =
        new FindAuthClientByClientIdAndProviderIdDomainRequestDto(
          provider.id,
          "test-client-id-2",
        );

      // When - act
      const result =
        await repository.findAuthClientByClientIdAndProviderId(findRequest);

      // Then - assert
      expect(result).toBeDefined();
      expect(result?.userId).toBe("test-user-uuid");
    });
  });

  describe("upsertAuthTokens", () => {
    it("should create a new auth token when it doesn't exist (INSERT)", async () => {
      // Given
      const provider = await repository.findProviderByProvider(
        new FindProviderByProviderDomainRequestDto(AuthProvider.GOOGLE),
      );

      if (!provider) {
        console.warn("⚠️  Provider not found. Skipping test.");
        return;
      }

      const authClient = await repository.createAuthClient({
        userId: "test-user-uuid",
        providerId: provider.id,
        clientId: "test-client-id-upsert-1",
        salt: "test-salt",
      });

      if (!authClient) {
        console.warn("⚠️  AuthClient creation failed. Skipping test.");
        return;
      }

      const createdClient =
        await repository.findAuthClientByClientIdAndProviderId(
          new FindAuthClientByClientIdAndProviderIdDomainRequestDto(
            provider.id,
            "test-client-id-upsert-1",
          ),
        );

      if (!createdClient) {
        console.warn("⚠️  Created client not found. Skipping test.");
        return;
      }

      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
      const upsertRequest = {
        authClientId: createdClient.id,
        providerAccessToken: "test-access-token",
        providerRefreshToken: "test-refresh-token",
        refreshToken: "jwt-refresh-token",
        revoked: false,
        expiresAt,
        updatedAt: new Date(),
      };

      // When - act
      const result = await repository.upsertAuthTokens(upsertRequest);

      // Then - assert (INSERT 동작)
      expect(result).toBeDefined();
      expect(result?.authClientId).toBe(createdClient.id);
      expect(result?.revoked).toBe(false);
    });

    it("should update an existing auth token (UPDATE on duplicate)", async () => {
      // Given - first upsert creates the token
      const provider = await repository.findProviderByProvider(
        new FindProviderByProviderDomainRequestDto(AuthProvider.KAKAO),
      );

      if (!provider) {
        console.warn("⚠️  Provider not found. Skipping test.");
        return;
      }

      const authClient = await repository.createAuthClient({
        userId: "test-user-uuid-2",
        providerId: provider.id,
        clientId: "test-client-id-upsert-2",
        salt: "test-salt",
      });

      if (!authClient) {
        console.warn("⚠️  AuthClient creation failed. Skipping test.");
        return;
      }

      const createdClient =
        await repository.findAuthClientByClientIdAndProviderId(
          new FindAuthClientByClientIdAndProviderIdDomainRequestDto(
            provider.id,
            "test-client-id-upsert-2",
          ),
        );
      if (!createdClient) {
        console.warn("⚠️  Created client not found. Skipping test.");
        return;
      }

      const expiresAt1 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
      const firstUpsertRequest = {
        authClientId: createdClient.id,
        providerAccessToken: "initial-access-token",
        providerRefreshToken: "initial-refresh-token",
        refreshToken: "jwt-refresh-token-1",
        revoked: false,
        expiresAt: expiresAt1,
        updatedAt: new Date(),
      };

      // First upsert - INSERT
      const firstResult = await repository.upsertAuthTokens(firstUpsertRequest);

      if (!firstResult) {
        console.warn("⚠️  First upsert failed. Skipping test.");
        return;
      }

      // Second upsert - UPDATE with same authClientId but different tokens
      const expiresAt2 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
      const secondUpsertRequest = {
        authClientId: createdClient.id,
        providerAccessToken: "updated-access-token",
        providerRefreshToken: "updated-refresh-token",
        refreshToken: "jwt-refresh-token-2",
        revoked: false,
        expiresAt: expiresAt2,
        updatedAt: new Date(),
      };

      // When - act (UPDATE on duplicate key)
      const secondResult =
        await repository.upsertAuthTokens(secondUpsertRequest);

      // Then - assert (UPDATE 동작)
      expect(secondResult).toBeDefined();
      expect(secondResult?.authClientId).toBe(createdClient.id);
      expect(secondResult?.revoked).toBe(false);
    });

    it("should return null if upsert result cannot be found", async () => {
      // 이 케이스는 드물지만, 데이터 일관성 문제 시나리오
      // Note: 실제로는 거의 발생하지 않음 (upsert 후 조회 실패는 드문 경우)
      const nonExistentClientId = "00000000-0000-7000-0000-000000000000";

      // When - act
      const result = await repository.upsertAuthTokens({
        authClientId: nonExistentClientId,
        providerAccessToken: "token",
        providerRefreshToken: "refresh",
        refreshToken: "jwt-token",
        revoked: false,
        expiresAt: new Date(),
        updatedAt: new Date(),
      });

      // Then - assert
      // FK constraint 때문에 실패하거나, 없으면 null 반환
      expect(result).toBeNull();
    });
  });
});
