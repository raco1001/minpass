import { AuthProvider } from "@auth/core/domain/constants/auth-providers";
import { auth } from "@app/contracts";
import { users } from "@app/contracts";
/**
 * 테스트용 Mock 데이터 생성 헬퍼
 */
export class TestDataFactory {
  /**
   * 테스트용 Provider DTO 생성
   */
  static createMockProvider(provider: AuthProvider = AuthProvider.GOOGLE) {
    return {
      id: `${provider.toLowerCase()}-uuid`,
      provider,
    };
  }

  /**
   * 테스트용 User 생성
   */
  static createMockUser(overrides?: Partial<users.User>) {
    return {
      id: "user-uuid",
      email: "test@example.com",
      displayName: "Test User",
      locale: "ko",
      ...overrides,
    };
  }

  /**
   * 테스트용 AuthClient 생성
   */
  static createMockAuthClient(overrides?: any) {
    return {
      id: "client-uuid",
      userId: "user-uuid",
      providerId: "provider-uuid",
      clientId: "test-client-id",
      ...overrides,
    };
  }

  /**
   * 테스트용 TokenInfo 생성
   */
  static createMockTokenInfo(overrides?: any) {
    return {
      id: "token-uuid",
      authClientId: "client-uuid",
      revoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      ...overrides,
    };
  }

  /**
   * 테스트용 Tokens 생성
   */
  static createMockTokens(overrides?: any) {
    return {
      accessToken: "test-access-token",
      refreshToken: "test-refresh-token",
      ...overrides,
    };
  }

  /**
   * 테스트용 SocialLoginRequest 생성
   */
  static createSocialLoginRequest(
    provider: AuthProvider = AuthProvider.GOOGLE,
    overrides?: Partial<auth.SocialLoginRequest>,
  ): auth.SocialLoginRequest {
    return {
      provider,
      socialUserProfile: {
        provider,
        clientId: "google-client-id",
        name: "Test User",
        nickname: "TestNick",
        email: "test@example.com",
        profileImage: "https://example.com/profile.jpg",
        providerAccessToken: "provider-access-token",
        providerRefreshToken: "provider-refresh-token",
      },
      ...overrides,
    };
  }
}

/**
 * Mock Port 생성 헬퍼
 */
export class MockPortFactory {
  /**
   * AuthRepositoryPort Mock 생성
   */
  static createAuthRepositoryPort() {
    return {
      findProviderByProvider: jest.fn(),
      findAuthClientByClientIdAndProviderId: jest.fn(),
      findAuthTokenInfoByClientId: jest.fn(),
      createAuthClient: jest.fn(),
      createAuthToken: jest.fn(),
      updateAuthClientTimestamp: jest.fn(),
      updateAuthTokens: jest.fn(),
    };
  }

  /**
   * AuthTokenPort Mock 생성
   */
  static createAuthTokenPort() {
    return {
      generateTokens: jest.fn(),
      verifyToken: jest.fn(),
    };
  }

  /**
   * UserClientPort Mock 생성
   */
  static createUserClientPort() {
    return {
      createUser: jest.fn(),
      findOneUser: jest.fn(),
      findOneUserByEmail: jest.fn(),
    };
  }
}
