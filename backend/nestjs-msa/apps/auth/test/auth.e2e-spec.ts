import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AuthModule } from "@auth/auth.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { auth } from "@app/contracts";
import { join } from "path";
import { ClientGrpc } from "@nestjs/microservices";

describe("Auth MS (E2E)", () => {
  let app: INestApplication;
  let client: ClientGrpc;
  let authService: auth.AuthServiceClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: auth.protobufPackage,
        protoPath: join(__dirname, "../../../proto/auth/v1/auth.proto"),
        url: "127.0.0.1:50051",
      },
    });

    await app.startAllMicroservices();
    await app.init();

    // gRPC Client 생성
    client = app.get<ClientGrpc>("AUTH_CLIENT");
    authService = client.getService<auth.AuthServiceClient>(
      auth.AUTH_SERVICE_NAME,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe("SocialLogin", () => {
    it("신규 사용자 소셜 로그인이 성공해야 함", (done) => {
      // Given
      const request: auth.SocialLoginRequest = {
        provider: "GOOGLE",
        code: "e2e-test-code",
        socialUserProfile: {
          nickname: "E2E Test User",
          profileImage: "https://example.com/profile.jpg",
          provider: "GOOGLE",
          clientId: "e2e-test-client-id",
          name: "E2E Test User",
          email: "e2e@example.com",
          providerAccessToken: "e2e-provider-access-token",
          providerRefreshToken: "e2e-provider-refresh-token",
        },
      };

      // When & Then
      authService.socialLogin(request).subscribe({
        next: (result) => {
          expect(result.userId).toBeDefined();
          expect(result.accessToken).toBeDefined();
          expect(result.isNewUser).toBe(true);
          done();
        },
        error: (err) => {
          done(err);
        },
      });
    });

    it("기존 사용자 소셜 로그인이 성공해야 함", (done) => {
      // Given - 동일한 clientId로 재로그인
      const request: auth.SocialLoginRequest = {
        provider: "GOOGLE",
        code: "e2e-test-code",
        socialUserProfile: {
          nickname: "E2E Test User",
          profileImage: "https://example.com/profile.jpg",
          provider: "GOOGLE",
          clientId: "e2e-test-client-id",
          name: "E2E Test User",
          email: "e2e@example.com",
          providerAccessToken: "e2e-provider-access-token-updated",
          providerRefreshToken: "e2e-provider-refresh-token-updated",
        },
      };

      // When & Then
      authService.socialLogin(request).subscribe({
        next: (result) => {
          expect(result.userId).toBeDefined();
          expect(result.accessToken).toBeDefined();
          expect(result.isNewUser).toBe(false); // 기존 사용자
          done();
        },
        error: (err) => {
          done(err);
        },
      });
    });
  });
});
