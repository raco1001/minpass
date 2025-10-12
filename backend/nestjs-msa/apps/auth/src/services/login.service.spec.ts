import { Test, TestingModule } from "@nestjs/testing";
import { LoginService } from "./login.service";
import { AuthRepositoryPort } from "@auth/core/ports/out/auth.repository.port";
import { AuthTokenPort } from "@auth/core/ports/out/auth.token.port";
import { UserClientPort } from "@auth/core/ports/out/user-client.port";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";
import { of } from "rxjs";
import { auth } from "@app/contracts";

describe("LoginService (Unit)", () => {
  let service: LoginService;
  let authRepository: jest.Mocked<AuthRepositoryPort>;
  let authToken: jest.Mocked<AuthTokenPort>;
  let userClient: jest.Mocked<UserClientPort>;

  // Mock Port 생성
  const mockAuthRepository = {
    findProviderByProvider: jest.fn(),
    findAuthClientByClientIdAndProviderId: jest.fn(),
    findAuthTokenInfoByClientId: jest.fn(),
    createAuthClient: jest.fn(),
    createAuthToken: jest.fn(),
    updateAuthClientTimestamp: jest.fn(),
    updateAuthTokens: jest.fn(),
  };

  const mockAuthToken = {
    generateTokens: jest.fn(),
    verifyToken: jest.fn(),
  };

  const mockUserClient = {
    createUser: jest.fn(),
    findOneUser: jest.fn(),
    findOneUserByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        {
          provide: AuthRepositoryPort,
          useValue: mockAuthRepository,
        },
        {
          provide: AuthTokenPort,
          useValue: mockAuthToken,
        },
        {
          provide: UserClientPort,
          useValue: mockUserClient,
        },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
    authRepository = module.get(AuthRepositoryPort);
    authToken = module.get(AuthTokenPort);
    userClient = module.get(UserClientPort);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("socialLogin", () => {
    describe("기존 사용자 로그인", () => {
      it("존재하는 사용자가 로그인하면 토큰을 반환해야 함", async () => {
        // Given - 테스트 데이터 준비
        const mockProvider = {
          id: "provider-uuid",
          provider: AuthProvider.GOOGLE,
        };

        const mockClient = {
          id: "client-uuid",
          userId: "user-uuid",
        };

        const mockUser = {
          id: "user-uuid",
          email: "test@example.com",
          displayName: "Test User",
          locale: "KO",
        };

        const mockTokenInfo = {
          id: "token-uuid",
          authClientId: "client-uuid",
          revoked: false,
          expiresAt: new Date(),
          createdAt: new Date(),
        };

        const mockTokens = {
          accessToken: "access-token",
          refreshToken: "refresh-token",
        };

        const socialLoginRequest: auth.SocialLoginRequest = {
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

        // Mock 설정
        authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
        authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
          mockClient,
        );
        userClient.findOneUser.mockReturnValue(of(mockUser as any));
        authToken.generateTokens.mockResolvedValue(mockTokens);
        authRepository.findAuthTokenInfoByClientId.mockResolvedValue(
          mockTokenInfo,
        );
        authRepository.updateAuthTokens.mockResolvedValue({
          ...mockTokenInfo,
          updatedAt: new Date(),
        });

        // When - 실행
        const result = await service.socialLogin(socialLoginRequest);

        // Then - 검증
        expect(result).toEqual({
          userId: "user-uuid",
          accessToken: "access-token",
          isNewUser: false,
        });

        // Port 호출 검증
        expect(authRepository.findProviderByProvider).toHaveBeenCalledTimes(1);
        expect(
          authRepository.findAuthClientByClientIdAndProviderId,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            providerId: "provider-uuid",
            clientId: "google-client-id",
          }),
        );
        expect(userClient.findOneUser).toHaveBeenCalledWith({
          id: "user-uuid",
        });
        expect(authToken.generateTokens).toHaveBeenCalledWith({
          userId: "user-uuid",
          email: "test@example.com",
        });
      });
    });

    describe("신규 사용자 등록", () => {
      it("신규 사용자가 소셜 로그인하면 사용자를 생성하고 토큰을 반환해야 함", async () => {
        // Given
        const mockProvider = {
          id: "provider-uuid",
          provider: AuthProvider.GOOGLE,
        };

        const mockNewUser = {
          id: "new-user-uuid",
          email: "newuser@example.com",
          displayName: "New User",
          locale: "KO",
        };

        const mockNewClient = {
          userId: "new-user-uuid",
          providerId: "provider-uuid",
          clientId: "google-new-client-id",
        };

        const mockTokenInfo = {
          id: "token-uuid",
          authClientId: "google-new-client-id",
          revoked: false,
          expiresAt: new Date(),
          createdAt: new Date(),
        };

        const mockTokens = {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
        };

        const socialLoginRequest: auth.SocialLoginRequest = {
          provider: AuthProvider.GOOGLE,
          code: "test-auth-code",
          socialUserProfile: {
            provider: AuthProvider.GOOGLE,
            clientId: "google-new-client-id",
            name: "New User",
            nickname: "NewNick",
            email: "newuser@example.com",
            profileImage: "https://example.com/new-profile.jpg",
            providerAccessToken: "provider-access-token",
            providerRefreshToken: "provider-refresh-token",
          },
        };

        // Mock 설정 - 기존 클라이언트 없음
        authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
        authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
          null,
        ); // 기존 사용자 없음
        userClient.findOneUserByEmail.mockReturnValue(of(null as any)); // 이메일로도 없음
        userClient.createUser.mockReturnValue(of(mockNewUser as any));
        authRepository.createAuthClient.mockResolvedValue(mockNewClient);
        authToken.generateTokens.mockResolvedValue(mockTokens);
        authRepository.createAuthToken.mockResolvedValue(mockTokenInfo);

        // When
        const result = await service.socialLogin(socialLoginRequest);

        // Then
        expect(result).toEqual({
          userId: "new-user-uuid",
          accessToken: "new-access-token",
          isNewUser: true,
        });

        // 사용자 생성 검증
        expect(userClient.createUser).toHaveBeenCalledWith({
          email: "newuser@example.com",
          locale: "KO",
          displayName: "New User",
        });

        // AuthClient 생성 검증
        expect(authRepository.createAuthClient).toHaveBeenCalledWith({
          userId: "new-user-uuid",
          providerId: "provider-uuid",
          clientId: "google-new-client-id",
          salt: null,
        });
      });
    });

    describe("에러 케이스", () => {
      it("Provider를 찾을 수 없으면 에러를 던져야 함", async () => {
        // Given
        authRepository.findProviderByProvider.mockResolvedValue(null);

        const socialLoginRequest: auth.SocialLoginRequest = {
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

        // When & Then
        await expect(service.socialLogin(socialLoginRequest)).rejects.toThrow(
          "Provider not found",
        );
      });

      it("socialUserProfile이 없으면 에러를 던져야 함", async () => {
        // Given
        const socialLoginRequest: auth.SocialLoginRequest = {
          provider: AuthProvider.GOOGLE,
          code: "test-auth-code",
          socialUserProfile: null as any,
        };

        const mockProvider = {
          id: "provider-uuid",
          provider: AuthProvider.GOOGLE,
        };

        authRepository.findProviderByProvider.mockResolvedValue(mockProvider);

        // When & Then
        await expect(service.socialLogin(socialLoginRequest)).rejects.toThrow(
          "Social user profile not found",
        );
      });
    });
  });
});
