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
  });

  afterEach(async () => {
    // 테스트 후 데이터 정리
    await db.delete(authTokens);
    await db.delete(authClients);
  });

  describe("findProviderByProvider", () => {
    it("존재하는 provider를 조회하면 결과를 반환해야 함", async () => {
      // Given
      const request = new FindProviderByProviderDomainRequestDto(
        AuthProvider.GOOGLE,
      );

      // When
      const result = await repository.findProviderByProvider(request);

      // Then
      expect(result).toBeDefined();
      expect(result?.provider).toBe(AuthProvider.GOOGLE);
      expect(result?.id).toBeDefined();
    });

    it("존재하지 않는 provider를 조회하면 null을 반환해야 함", async () => {
      // Given
      const request = new FindProviderByProviderDomainRequestDto(
        "NONEXISTENT" as AuthProvider,
      );

      // When
      const result = await repository.findProviderByProvider(request);

      // Then
      expect(result).toBeNull();
    });
  });

  describe("createAuthClient", () => {
    it("새로운 auth client를 생성해야 함", async () => {
      // Given
      const provider = await repository.findProviderByProvider(
        new FindProviderByProviderDomainRequestDto(AuthProvider.GOOGLE),
      );

      const createRequest = {
        userId: "test-user-uuid",
        providerId: provider!.id,
        clientId: "test-client-id",
        salt: "test-salt",
      };

      // When
      const result = await repository.createAuthClient(createRequest);

      // Then
      expect(result).toBeDefined();
      expect(result?.userId).toBe("test-user-uuid");
      expect(result?.providerId).toBe(provider!.id);
      expect(result?.clientId).toBe("test-client-id");
    });
  });

  describe("findAuthClientByClientIdAndProviderId", () => {
    it("존재하는 auth client를 조회해야 함", async () => {
      // Given - 먼저 client 생성
      const provider = await repository.findProviderByProvider(
        new FindProviderByProviderDomainRequestDto(AuthProvider.GOOGLE),
      );

      await repository.createAuthClient({
        userId: "test-user-uuid",
        providerId: provider!.id,
        clientId: "test-client-id-2",
        salt: "test-salt",
      });

      const findRequest =
        new FindAuthClientByClientIdAndProviderIdDomainRequestDto(
          provider!.id,
          "test-client-id-2",
        );

      // When
      const result =
        await repository.findAuthClientByClientIdAndProviderId(findRequest);

      // Then
      expect(result).toBeDefined();
      expect(result?.userId).toBe("test-user-uuid");
    });
  });
});
