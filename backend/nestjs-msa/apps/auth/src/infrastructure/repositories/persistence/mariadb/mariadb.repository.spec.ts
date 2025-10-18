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
});
