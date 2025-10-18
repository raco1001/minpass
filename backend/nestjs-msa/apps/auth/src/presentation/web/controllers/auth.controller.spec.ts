import { Test, TestingModule } from "@nestjs/testing";

import { LoginServicePort } from "@auth/core/ports/in/login-service.port";
import { AuthController } from "./auth.controller";
import { auth } from "@app/contracts";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";

describe("AuthController (Unit)", () => {
  let controller: AuthController;
  let loginService: jest.Mocked<LoginServicePort>;

  const mockLoginService = {
    socialLogin: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginServicePort,
          useValue: mockLoginService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    loginService = module.get(LoginServicePort);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("socialLogin", () => {
    it("should call LoginService and return result for valid request", async () => {
      // Given
      const request: auth.SocialLoginRequest = {
        provider: AuthProvider.GOOGLE,
        code: "test-auth-code",
        socialUserProfile: {
          provider: AuthProvider.GOOGLE,
          clientId: "google-client-id",
          name: "Test User",
          nickname: "TestNick",
          email: "test@example.com",
          profileImage: "https://example.com/profile.jpg",
          providerAccessToken: "provider-access-token",
          providerRefreshToken: "provider-refresh-token",
        },
      };

      const expectedResult: auth.ILoginResult = {
        userId: "user-uuid",
        accessToken: "test-access-token",
        isNewUser: false,
      };

      loginService.socialLogin.mockResolvedValue(expectedResult);

      // When - act
      const result = await controller.socialLogin(request);

      // Then - assert
      expect(result).toEqual(expectedResult);
      expect(loginService.socialLogin).toHaveBeenCalledTimes(1);
      expect(loginService.socialLogin).toHaveBeenCalledWith(request);
    });

    it("should return result with isNewUser true for new user login", async () => {
      // Given
      const request: auth.SocialLoginRequest = {
        provider: AuthProvider.GOOGLE,
        code: "test-auth-code",
        socialUserProfile: {
          provider: AuthProvider.GOOGLE,
          clientId: "new-google-client-id",
          name: "New User",
          nickname: "NewNick",
          email: "newuser@example.com",
          profileImage: "https://example.com/profile.jpg",
          providerAccessToken: "provider-access-token",
          providerRefreshToken: "provider-refresh-token",
        },
      };

      const expectedResult: auth.ILoginResult = {
        userId: "new-user-uuid",
        accessToken: "new-access-token",
        isNewUser: true,
      };

      loginService.socialLogin.mockResolvedValue(expectedResult);

      // When - act
      const result = await controller.socialLogin(request);

      // Then - assert
      expect(result).toMatchObject({
        userId: expect.any(String),
        accessToken: expect.any(String),
        isNewUser: true,
      });
      expect(loginService.socialLogin).toHaveBeenCalledWith(request);
    });

    it("should propagate error from LoginService", async () => {
      // Given
      const request: auth.SocialLoginRequest = {
        provider: AuthProvider.GOOGLE,
        code: "test-auth-code",
        socialUserProfile: {
          provider: AuthProvider.GOOGLE,
          clientId: "google-client-id",
          name: "Test User",
          nickname: "TestNick",
          email: "test@example.com",
          profileImage: "https://example.com/profile.jpg",
          providerAccessToken: "provider-access-token",
          providerRefreshToken: "provider-refresh-token",
        },
      };

      const error = new Error("Provider not found");
      loginService.socialLogin.mockRejectedValue(error);

      // When & Then - act and assert
      await expect(controller.socialLogin(request)).rejects.toThrow(
        "Provider not found",
      );
      expect(loginService.socialLogin).toHaveBeenCalledWith(request);
    });

    it("should correctly handle different providers (KAKAO)", async () => {
      // Given
      const request: auth.SocialLoginRequest = {
        provider: AuthProvider.KAKAO,
        code: "kakao-auth-code",
        socialUserProfile: {
          provider: AuthProvider.KAKAO,
          clientId: "kakao-client-id",
          name: "KAKAO User",
          nickname: "KAKAO Nickname",
          email: "kakao@example.com",
          profileImage: "https://example.com/kakao.jpg",
          providerAccessToken: "kakao-access-token",
          providerRefreshToken: "kakao-refresh-token",
        },
      };

      const expectedResult: auth.ILoginResult = {
        userId: "kakao-user-uuid",
        accessToken: "kakao-access-token",
        isNewUser: false,
      };

      loginService.socialLogin.mockResolvedValue(expectedResult);

      // When - act
      const result = await controller.socialLogin(request);

      // Then - assert
      expect(result).toEqual(expectedResult);
      expect(loginService.socialLogin).toHaveBeenCalledWith(request);
    });
  });
});
