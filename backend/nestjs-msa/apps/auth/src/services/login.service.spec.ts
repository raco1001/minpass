import { Test, TestingModule } from "@nestjs/testing";
import { LoginService } from "./login.service";
import { AuthRepositoryPort } from "@auth/core/ports/out/auth.repository.port";
import { AuthTokenPort } from "@auth/core/ports/out/auth.token.port";
import { UserClientPort } from "@auth/core/ports/out/user-client.port";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";
import { of, throwError } from "rxjs";
import { auth } from "@app/contracts";
import {
  TestDataFactory,
  MockPortFactory,
} from "../../test/helpers/test-helpers";
import { UpsertAuthTokensInfoDomainResponseDto } from "@auth/core/domain/dtos/auth-command.dtos";

describe("LoginService (Unit)", () => {
  let service: LoginService;
  let authRepository: jest.Mocked<AuthRepositoryPort>;
  let authToken: jest.Mocked<AuthTokenPort>;
  let userClient: jest.Mocked<UserClientPort>;

  // Mock Port 생성 - Factory 사용
  const mockAuthRepository = MockPortFactory.createAuthRepositoryPort();
  const mockAuthToken = MockPortFactory.createAuthTokenPort();
  const mockUserClient = MockPortFactory.createUserClientPort();

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
    describe("existing user login", () => {
      it("should return tokens for existing user", async () => {
        // Given - use TestDataFactory
        const mockProvider = TestDataFactory.createMockProvider(
          AuthProvider.GOOGLE,
        );
        const mockClient = TestDataFactory.createMockAuthClient({
          providerId: mockProvider.id,
        });
        const mockUser = TestDataFactory.createMockUser({
          id: mockClient.userId,
        });
        const mockTokens = TestDataFactory.createMockTokens();
        const mockTokenInfo = TestDataFactory.createMockTokenInfo({
          authClientId: mockClient.id,
        });

        const request = TestDataFactory.createSocialLoginRequest(
          AuthProvider.GOOGLE,
        );

        // Mock setup
        authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
        authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
          mockClient,
        );
        userClient.findOneUser.mockReturnValue(of(mockUser as any));
        authToken.generateTokens.mockResolvedValue(mockTokens);
        authRepository.upsertAuthTokens.mockResolvedValue(mockTokenInfo); // ✅ 추가

        // When
        const result = await service.socialLogin(request);

        // Then
        expect(result).toEqual({
          userId: mockUser.id,
          accessToken: mockTokens.accessToken,
          isNewUser: false,
        });

        // Verify port calls
        expect(authRepository.findProviderByProvider).toHaveBeenCalledTimes(1);
        expect(
          authRepository.findAuthClientByClientIdAndProviderId,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            providerId: mockProvider.id,
            clientId: request.socialUserProfile?.clientId,
          }),
        );
        expect(userClient.findOneUser).toHaveBeenCalledWith({
          id: mockClient.userId,
        });
        expect(authToken.generateTokens).toHaveBeenCalledWith({
          userId: mockUser.id,
          email: mockUser.email,
        });
        // ✅ upsertAuthTokens 검증 추가
        expect(authRepository.upsertAuthTokens).toHaveBeenCalledWith(
          expect.objectContaining({
            authClientId: mockClient.id,
          }),
        );
      });

      it("SocialLogin should be successful for existing user with KAKAO provider", async () => {
        // Given
        const mockProvider = TestDataFactory.createMockProvider(
          AuthProvider.KAKAO,
        );
        const mockClient = TestDataFactory.createMockAuthClient({
          providerId: mockProvider.id,
          clientId: "kakao-client-id",
        });
        const mockUser = TestDataFactory.createMockUser({
          id: mockClient.userId,
          email: "kakao@example.com",
        });
        const mockTokens = TestDataFactory.createMockTokens();
        const mockTokenInfo = TestDataFactory.createMockTokenInfo();

        const request = TestDataFactory.createSocialLoginRequest(
          AuthProvider.KAKAO,
          {
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
          },
        );

        // Mock setup
        authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
        authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
          mockClient,
        );
        userClient.findOneUser.mockReturnValue(of(mockUser as any));
        authToken.generateTokens.mockResolvedValue(mockTokens);
        authRepository.upsertAuthTokens.mockResolvedValue(mockTokenInfo); // ✅ 추가

        // When - act
        const result = await service.socialLogin(request);

        // Then - assert
        expect(result).toMatchObject({
          userId: mockUser.id,
          accessToken: mockTokens.accessToken,
          isNewUser: false,
        });
      });
    });

    describe("new user registration", () => {
      it("should create a new user and return tokens for new user", async () => {
        // Given
        const mockProvider = TestDataFactory.createMockProvider(
          AuthProvider.GOOGLE,
        );
        const mockNewUser = TestDataFactory.createMockUser({
          id: "new-user-uuid",
          email: "newuser@example.com",
          displayName: "New User",
        });
        const mockNewClient = TestDataFactory.createMockAuthClient({
          userId: mockNewUser.id,
          providerId: mockProvider.id,
          clientId: "google-new-client-id",
        });
        const mockTokens = TestDataFactory.createMockTokens({
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
        });
        const mockTokenInfo = TestDataFactory.createMockTokenInfo({
          authClientId: mockNewClient.id,
        });

        const request = TestDataFactory.createSocialLoginRequest(
          AuthProvider.GOOGLE,
          {
            socialUserProfile: {
              provider: AuthProvider.GOOGLE,
              clientId: "google-new-client-id",
              name: "New User",
              nickname: "NewUser",
              email: "newuser@example.com",
              profileImage: "https://example.com/new-profile.jpg",
              providerAccessToken: "new-provider-access-token",
              providerRefreshToken: "new-provider-refresh-token",
            },
          },
        );

        // Mock setup - new user scenario
        authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
        authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
          null,
        ); // no existing client
        userClient.findOneUserByEmail.mockReturnValue(of(null as any)); // no email
        userClient.createUser.mockReturnValue(of(mockNewUser as any));
        authRepository.createAuthClient.mockResolvedValue(mockNewClient);
        authRepository.findAuthClientByClientIdAndProviderId
          .mockResolvedValueOnce(null) // first call: no
          .mockResolvedValueOnce(mockNewClient); // second call: create and find
        authToken.generateTokens.mockResolvedValue(mockTokens);
        authRepository.createAuthToken.mockResolvedValue(mockTokenInfo);

        // When - act
        const result = await service.socialLogin(request);

        // Then - assert
        expect(result).toMatchObject({
          userId: mockNewUser.id,
          accessToken: mockTokens.accessToken,
          isNewUser: true,
        });

        // Verify user creation
        expect(userClient.createUser).toHaveBeenCalledWith({
          email: mockNewUser.email,
          locale: mockNewUser.locale,
          displayName: mockNewUser.displayName,
        });

        // Verify AuthClient creation
        expect(authRepository.createAuthClient).toHaveBeenCalledWith({
          userId: mockNewUser.id,
          providerId: mockProvider.id,
          clientId: "google-new-client-id",
          salt: null,
        });

        expect(authToken.generateTokens).toHaveBeenCalledWith({
          userId: mockNewUser.id,
          email: mockNewUser.email,
        });
      });

      it("SocialLogin should be successful for new user with GITHUB provider", async () => {
        // Given
        const mockProvider = TestDataFactory.createMockProvider(
          AuthProvider.GITHUB,
        );
        const mockNewUser = TestDataFactory.createMockUser({
          id: "github-user-uuid",
          email: "github@example.com",
          displayName: "GitHub User",
        });
        const mockNewClient = TestDataFactory.createMockAuthClient({
          userId: mockNewUser.id,
          providerId: mockProvider.id,
          clientId: "github-client-id",
        });
        const mockTokens = TestDataFactory.createMockTokens();
        const mockTokenInfo = TestDataFactory.createMockTokenInfo();

        const request = TestDataFactory.createSocialLoginRequest(
          AuthProvider.GITHUB,
          {
            socialUserProfile: {
              provider: AuthProvider.GITHUB,
              clientId: "github-client-id",
              name: "GitHub User",
              nickname: "githubuser",
              email: "github@example.com",
              profileImage: "https://github.com/profile.jpg",
              providerAccessToken: "github-access-token",
              providerRefreshToken: "github-refresh-token",
            },
          },
        );

        // Mock setup
        authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
        authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
          null,
        );
        userClient.findOneUserByEmail.mockReturnValue(of(null as any));
        userClient.createUser.mockReturnValue(of(mockNewUser as any));
        authRepository.createAuthClient.mockResolvedValue(mockNewClient);
        authRepository.findAuthClientByClientIdAndProviderId
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(mockNewClient);
        authToken.generateTokens.mockResolvedValue(mockTokens);
        authRepository.createAuthToken.mockResolvedValue(mockTokenInfo);

        // When - act
        const result = await service.socialLogin(request);

        // Then
        expect(result).toMatchObject({
          userId: mockNewUser.id,
          isNewUser: true,
        });
      });
    });

    describe("error cases", () => {
      it("should throw an error if provider is not found", async () => {
        // Given
        authRepository.findProviderByProvider.mockResolvedValue(null);

        const request = TestDataFactory.createSocialLoginRequest(
          AuthProvider.GOOGLE,
        );

        // When & Then - act and assert
        await expect(service.socialLogin(request)).rejects.toThrow(
          "OAuth provider 'google' not found or not configured",
        );

        expect(authRepository.findProviderByProvider).toHaveBeenCalledTimes(1);
      });

      it("should throw an error if socialUserProfile is not found", async () => {
        // Given
        const mockProvider = TestDataFactory.createMockProvider();

        const request: auth.SocialLoginRequest = {
          provider: AuthProvider.GOOGLE,
          socialUserProfile: null as any,
        };

        authRepository.findProviderByProvider.mockResolvedValue(mockProvider);

        // When & Then - act and assert
        await expect(service.socialLogin(request)).rejects.toThrow(
          "Social user profile is required",
        );
      });

      it("should throw an error if existing user is not found", async () => {
        // Given
        const mockProvider = TestDataFactory.createMockProvider();
        const mockClient = TestDataFactory.createMockAuthClient();
        const request = TestDataFactory.createSocialLoginRequest();

        authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
        authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
          mockClient,
        );
        userClient.findOneUser.mockReturnValue(of(null as any)); // no user

        // When & Then - act and assert
        await expect(service.socialLogin(request)).rejects.toThrow(
          `User with ID '${mockClient.userId}' not found`,
        );
      });

      it("should throw an error if token upsert fails", async () => {
        // Given
        const mockProvider = TestDataFactory.createMockProvider();
        const mockClient = TestDataFactory.createMockAuthClient();
        const mockUser = TestDataFactory.createMockUser({
          id: mockClient.userId,
        });
        const mockTokens = TestDataFactory.createMockTokens();
        const request = TestDataFactory.createSocialLoginRequest();

        authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
        authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
          mockClient,
        );
        userClient.findOneUser.mockReturnValue(of(mockUser as any));
        authToken.generateTokens.mockResolvedValue(mockTokens);
        authRepository.upsertAuthTokens.mockResolvedValue(null); // ✅ upsert 실패

        // When & Then
        await expect(service.socialLogin(request)).rejects.toThrow(
          "Failed to update auth tokens", // ✅ 메시지 수정
        );
      });

      it("should throw an error if new user creation fails", async () => {
        // Given
        const mockProvider = TestDataFactory.createMockProvider();
        const request = TestDataFactory.createSocialLoginRequest();

        authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
        authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
          null,
        );
        userClient.findOneUserByEmail.mockReturnValue(of(null as any));
        userClient.createUser.mockReturnValue(
          throwError(() => new Error("Database error")),
        );

        // When & Then - act and assert
        await expect(service.socialLogin(request)).rejects.toThrow(
          "Database error",
        );
      });

      it("should throw an error if AuthClient creation fails", async () => {
        // Given
        const mockProvider = TestDataFactory.createMockProvider();
        const mockNewUser = TestDataFactory.createMockUser();
        const request = TestDataFactory.createSocialLoginRequest();

        authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
        authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
          null,
        );
        userClient.findOneUserByEmail.mockReturnValue(of(null as any));
        userClient.createUser.mockReturnValue(of(mockNewUser as any));
        authRepository.createAuthClient.mockResolvedValue(null); // 실패

        // When & Then
        await expect(service.socialLogin(request)).rejects.toThrow(
          "Failed to create auth client",
        );
      });

      it("should throw an error if new user's AuthToken creation fails", async () => {
        // Given
        const mockProvider = TestDataFactory.createMockProvider();
        const mockNewUser = TestDataFactory.createMockUser();
        const mockNewClient = TestDataFactory.createMockAuthClient();
        const mockTokens = TestDataFactory.createMockTokens();
        const request = TestDataFactory.createSocialLoginRequest();

        authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
        authRepository.findAuthClientByClientIdAndProviderId
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(mockNewClient);
        userClient.findOneUserByEmail.mockReturnValue(of(null as any));
        userClient.createUser.mockReturnValue(of(mockNewUser as any));
        authRepository.createAuthClient.mockResolvedValue(mockNewClient);
        authToken.generateTokens.mockResolvedValue(mockTokens);
        authRepository.createAuthToken.mockResolvedValue(null); // fail

        // When & Then
        await expect(service.socialLogin(request)).rejects.toThrow(
          "Failed to save auth tokens",
        );
      });

      it("should throw an error if created AuthClient lookup fails", async () => {
        // Given
        const mockProvider = TestDataFactory.createMockProvider();
        const mockNewUser = TestDataFactory.createMockUser();
        const request = TestDataFactory.createSocialLoginRequest();

        authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
        authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
          null,
        ); // always return null
        userClient.findOneUserByEmail.mockReturnValue(of(null as any));
        userClient.createUser.mockReturnValue(of(mockNewUser as any));
        authRepository.createAuthClient.mockResolvedValue({} as any);

        // When & Then - act and assert
        await expect(service.socialLogin(request)).rejects.toThrow(
          "Failed to retrieve created auth client",
        );
      });
    });

    describe("Edge Cases", () => {
      it("should handle social profile with no email", async () => {
        // Given
        const mockProvider = TestDataFactory.createMockProvider();
        const mockNewUser = TestDataFactory.createMockUser({
          email: "no-email@placeholder.com",
        });
        const mockNewClient = TestDataFactory.createMockAuthClient();
        const mockTokens = TestDataFactory.createMockTokens();
        const mockTokenInfo = TestDataFactory.createMockTokenInfo();

        const request = TestDataFactory.createSocialLoginRequest(
          AuthProvider.GOOGLE,
          {
            socialUserProfile: {
              provider: AuthProvider.GOOGLE,
              clientId: "no-email-client",
              name: "No Email User",
              nickname: "noemail",
              email: "no-email@placeholder.com",
              profileImage: "",
              providerAccessToken: "token",
              providerRefreshToken: "refresh",
            },
          },
        );

        authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
        authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
          null,
        );
        userClient.findOneUserByEmail.mockReturnValue(of(null as any));
        userClient.createUser.mockReturnValue(of(mockNewUser as any));
        authRepository.createAuthClient.mockResolvedValue(mockNewClient);
        authRepository.findAuthClientByClientIdAndProviderId
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(mockNewClient);
        authToken.generateTokens.mockResolvedValue(mockTokens);
        authRepository.createAuthToken.mockResolvedValue(mockTokenInfo); // ✅ 추가

        // When - act
        const result = await service.socialLogin(request);

        // Then - assert
        expect(result).toBeDefined();
        expect(result.isNewUser).toBe(true);
      });

      it("should handle user with multiple accounts from the same provider", async () => {
        // Given - same provider with different clientId
        const mockProvider = TestDataFactory.createMockProvider();
        const mockClient = TestDataFactory.createMockAuthClient({
          clientId: "second-google-account",
        });
        const mockUser = TestDataFactory.createMockUser();
        const mockTokens = TestDataFactory.createMockTokens();
        const mockTokenInfo = TestDataFactory.createMockTokenInfo();

        const request = TestDataFactory.createSocialLoginRequest(
          AuthProvider.GOOGLE,
          {
            socialUserProfile: {
              provider: AuthProvider.GOOGLE,
              clientId: "second-google-account",
              name: "Test User",
              nickname: "test",
              email: "test@example.com",
              profileImage: "",
              providerAccessToken: "token",
              providerRefreshToken: "refresh",
            },
          },
        );

        authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
        authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
          mockClient,
        );
        userClient.findOneUser.mockReturnValue(of(mockUser as any));
        authToken.generateTokens.mockResolvedValue(mockTokens);
        authRepository.upsertAuthTokens.mockResolvedValue(mockTokenInfo); // ✅ 추가

        // When
        const result = await service.socialLogin(request);

        // Then
        expect(result.isNewUser).toBe(false);
        expect(
          authRepository.findAuthClientByClientIdAndProviderId,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            clientId: "second-google-account",
          }),
        );
      });
    });
  });
});
