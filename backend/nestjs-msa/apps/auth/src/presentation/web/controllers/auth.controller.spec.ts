import { Test, TestingModule } from "@nestjs/testing";

import { LoginService } from "@auth/services/login.service";

import { AuthController } from "./auth.controller";

describe("AuthController", () => {
  let authController: AuthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [LoginService],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(
        authController.socialLogin({
          provider: "google",
          code: "code",
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
        }),
      ).toBe("Hello World!");
    });
  });
});
