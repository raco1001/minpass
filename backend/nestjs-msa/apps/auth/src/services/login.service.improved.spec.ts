import { Test, TestingModule } from "@nestjs/testing";
import { LoginService } from "./login.service";
import { AuthRepositoryPort } from "@auth/core/ports/out/auth.repository.port";
import { AuthTokenPort } from "@auth/core/ports/out/auth.token.port";
import { UserClientPort } from "@auth/core/ports/out/user-client.port";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";
import { of } from "rxjs";
import {
  TestDataFactory,
  MockPortFactory,
} from "../../test/helpers/test-helpers";

describe("LoginService (Unit - Improved)", () => {
  let service: LoginService;
  let authRepository: jest.Mocked<AuthRepositoryPort>;
  let authToken: jest.Mocked<AuthTokenPort>;
  let userClient: jest.Mocked<UserClientPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        {
          provide: AuthRepositoryPort,
          useValue: MockPortFactory.createAuthRepositoryPort(),
        },
        {
          provide: AuthTokenPort,
          useValue: MockPortFactory.createAuthTokenPort(),
        },
        {
          provide: UserClientPort,
          useValue: MockPortFactory.createUserClientPort(),
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

  describe("socialLogin - 기존 사용자", () => {
    it("should login existing user successfully", async () => {
      // Given - Test Data Factory 사용
      const mockProvider = TestDataFactory.createMockProvider(
        AuthProvider.GOOGLE,
      );
      const mockClient = TestDataFactory.createMockAuthClient();
      const mockUser = TestDataFactory.createMockUser();
      const mockTokenInfo = TestDataFactory.createMockTokenInfo();
      const mockTokens = TestDataFactory.createMockTokens();
      const request = TestDataFactory.createSocialLoginRequest();

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

      // When
      const result = await service.socialLogin(request);

      // Then
      expect(result).toMatchObject({
        userId: mockUser.id,
        accessToken: mockTokens.accessToken,
        isNewUser: false,
      });

      expect(authRepository.findProviderByProvider).toHaveBeenCalledTimes(1);
      expect(userClient.findOneUser).toHaveBeenCalledWith({
        id: mockClient.userId,
      });
      expect(authToken.generateTokens).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
      });
    });
  });

  describe("socialLogin - 신규 사용자", () => {
    it("should create new user and login successfully", async () => {
      // Given
      const mockProvider = TestDataFactory.createMockProvider(
        AuthProvider.GOOGLE,
      );
      const mockNewUser = TestDataFactory.createMockUser({
        id: "new-user-uuid",
      });
      const mockNewClient = TestDataFactory.createMockAuthClient({
        userId: "new-user-uuid",
      });
      const mockTokenInfo = TestDataFactory.createMockTokenInfo();
      const mockTokens = TestDataFactory.createMockTokens();
      const request = TestDataFactory.createSocialLoginRequest();

      // Mock 설정 - 신규 사용자 시나리오
      authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
      authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
        null,
      );
      userClient.findOneUserByEmail.mockReturnValue(of(null as any));
      userClient.createUser.mockReturnValue(of(mockNewUser as any));
      authRepository.createAuthClient.mockResolvedValue(mockNewClient);
      authToken.generateTokens.mockResolvedValue(mockTokens);
      authRepository.createAuthToken.mockResolvedValue(mockTokenInfo);

      // When
      const result = await service.socialLogin(request);

      // Then
      expect(result).toMatchObject({
        userId: mockNewUser.id,
        accessToken: mockTokens.accessToken,
        isNewUser: true,
      });

      expect(userClient.createUser).toHaveBeenCalled();
      expect(authRepository.createAuthClient).toHaveBeenCalled();
      expect(authRepository.createAuthToken).toHaveBeenCalled();
    });
  });
});
