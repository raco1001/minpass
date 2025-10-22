# Jest 테스트 작성 가이드 - Auth 마이크로서비스

## 목차

1. [테스트 전략 개요](#테스트-전략-개요)
2. [테스트 환경 구성](#테스트-환경-구성)
3. [테스트 작성 순서와 계획](#테스트-작성-순서와-계획)
4. [테스트 레벨별 작성법](#테스트-레벨별-작성법)
5. [테스트 헬퍼와 유틸리티](#테스트-헬퍼와-유틸리티)
6. [Best Practices](#best-practices)

---

## 테스트 전략 개요

### Auth 마이크로서비스 아키텍처

```bash
apps/auth/
├── src/
│   ├── core/                    # 비즈니스 로직 (도메인)
│   │   ├── domain/             # 엔티티, VO, 상수
│   │   └── ports/              # 인터페이스 정의
│   │       ├── in/            # Inbound Ports (서비스 인터페이스)
│   │       └── out/           # Outbound Ports (Repository, Client 등)
│   ├── services/               # 비즈니스 로직 구현 (Use Cases)
│   ├── infrastructure/         # 기술 구현 (Adapters)
│   │   └── repositories/      # DB 접근 구현
│   └── presentation/          # 프레젠테이션 레이어
│       └── web/
│           └── controllers/   # gRPC Controllers
└── test/
    ├── helpers/               # 테스트 유틸리티
    └── *.e2e-spec.ts         # E2E 테스트
```

### 테스트 피라미드 전략

```bash
        /\
       /E2E\           ← 적은 수의 E2E 테스트
      /------\
     /Integr.\        ← 중간 수준의 통합 테스트
    /----------\
   /   Unit     \     ← 많은 수의 단위 테스트
  /--------------\
```

**우선순위:**

1. **Unit Tests (70%)** - 비즈니스 로직 (Services)
2. **Integration Tests (20%)** - Controllers, Repositories
3. **E2E Tests (10%)** - 전체 플로우

---

## 테스트 환경 구성

### 필요한 패키지

```json
{
  "devDependencies": {
    "@nestjs/testing": "^11.0.1", // NestJS 테스트 유틸리티
    "jest": "^29.7.0", // Jest 테스트 러너
    "ts-jest": "^29.2.5", // TypeScript 지원
    "@types/jest": "^29.5.14", // Jest 타입 정의
    "supertest": "^7.0.0", // HTTP 테스트
    "@types/supertest": "^6.0.2"
  }
}
```

### Jest 설정 파일

#### 1. Unit/Integration 테스트 설정 (`jest.config.js`)

```javascript
module.exports = {
  displayName: "auth",
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "../",
  testMatch: ["<rootDir>/src/**/*.spec.ts"],
  moduleNameMapper: {
    "^@auth/(.*)$": "<rootDir>/src/$1",
    "^@app/contracts$": "<rootDir>/../../libs/contracts/src",
  },
  coverageDirectory: "<rootDir>/coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.dto.ts",
    "!src/**/*.interface.ts",
  ],
};
```

#### 2. E2E 테스트 설정 (`jest-e2e.config.js`)

```javascript
module.exports = {
  displayName: "auth-e2e",
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "./",
  testMatch: ["<rootDir>/**/*.e2e-spec.ts"],
  moduleNameMapper: {
    "^@auth/(.*)$": "<rootDir>/../src/$1",
    "^@app/contracts$": "<rootDir>/../../../libs/contracts/src",
  },
};
```

### NPM 스크립트

```json
{
  "scripts": {
    "test:auth": "jest --config apps/auth/test/jest.config.js",
    "test:auth:watch": "jest --config apps/auth/test/jest.config.js --watch",
    "test:auth:cov": "jest --config apps/auth/test/jest.config.js --coverage",
    "test:auth:e2e": "jest --config apps/auth/test/jest-e2e.config.js"
  }
}
```

---

## 테스트 작성 순서와 계획

### Phase 1: 준비 단계 (Planning)

#### 1.1 도메인 이해

- **비즈니스 요구사항 파악**
  - Auth 서비스의 핵심 기능: 소셜 로그인, 토큰 발급/갱신
  - 주요 유스케이스: `socialLogin`, `refreshToken`, `logout`
- **아키텍처 이해**
  - Hexagonal Architecture의 의존성 방향 확인
  - Ports & Adapters 패턴 이해
  - 의존성: `Presentation → Services → Ports → Infrastructure`

#### 1.2 테스트 대상 식별

```bash
// 1. Services (비즈니스 로직) - 최우선
services/
  ├── login.service.spec.ts          ✅ 최우선
  └── refresh-token.service.spec.ts  ⏳ TODO

// 2. Controllers (프레젠테이션) - 중간
presentation/web/controllers/
  └── auth.controller.spec.ts        ⏳ TODO

// 3. Infrastructure (기술 구현) - 선택적
infrastructure/repositories/
  └── mariadb.repository.spec.ts     ⏳ TODO

// 4. E2E (전체 플로우) - 마지막
test/
  └── app.e2e-spec.ts                ✅ 완료
```

#### 1.3 테스트 시나리오 도출

**예: LoginService.socialLogin**

| 시나리오   | 테스트 케이스              | 우선순위 |
| ---------- | -------------------------- | -------- |
| Happy Path | 기존 사용자 로그인 성공    | High     |
| Happy Path | 신규 사용자 등록 및 로그인 | High     |
| Edge Case  | Provider 없음              | Medium   |
| Edge Case  | socialUserProfile null     | Medium   |
| Edge Case  | 이미 가입된 이메일         | Low      |
| Error Case | DB 연결 실패               | Low      |
| Error Case | 토큰 생성 실패             | Low      |

### Phase 2: 테스트 헬퍼 준비

#### 2.1 Mock Factory 생성

```typescript
// test/helpers/test-helpers.ts

export class MockPortFactory {
  /**
   * AuthRepositoryPort Mock 생성
   * - 모든 메서드를 jest.fn()으로 초기화
   * - 재사용 가능하도록 팩토리 패턴 적용
   */
  static createAuthRepositoryPort() {
    return {
      findProviderByProvider: jest.fn(),
      findAuthClientByClientIdAndProviderId: jest.fn(),
      createAuthClient: jest.fn(),
      createAuthToken: jest.fn(),
      updateAuthTokens: jest.fn(),
    };
  }

  static createAuthTokenPort() {
    return {
      generateTokens: jest.fn(),
      verifyToken: jest.fn(),
    };
  }

  static createUserClientPort() {
    return {
      createUser: jest.fn(),
      findOneUser: jest.fn(),
      findOneUserByEmail: jest.fn(),
    };
  }
}
```

#### 2.2 Test Data Factory 생성

```typescript
export class TestDataFactory {
  /**
   * 재사용 가능한 테스트 데이터 생성
   * - 기본값 제공 + 커스터마이징 가능
   */
  static createMockUser(overrides?: Partial<User>) {
    return {
      id: "user-uuid",
      email: "test@example.com",
      displayName: "Test User",
      locale: "ko",
      ...overrides, // 필요시 덮어쓰기
    };
  }

  static createSocialLoginRequest(overrides?: Partial<SocialLoginRequest>) {
    return {
      provider: AuthProvider.GOOGLE,
      code: "test-code",
      socialUserProfile: {
        provider: AuthProvider.GOOGLE,
        clientId: "google-client-id",
        name: "Test User",
        email: "test@example.com",
        // ... 기타 필드
      },
      ...overrides,
    };
  }
}
```

### Phase 3: Unit 테스트 작성 (Services)

#### 3.1 테스트 구조 설계

```typescript
// services/login.service.spec.ts

describe("LoginService (Unit)", () => {
  let service: LoginService;
  let authRepository: jest.Mocked<AuthRepositoryPort>;
  let authToken: jest.Mocked<AuthTokenPort>;
  let userClient: jest.Mocked<UserClientPort>;

  // Setup: 테스트 모듈 생성
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LoginService,
        { provide: AuthRepositoryPort, useValue: mockAuthRepository },
        { provide: AuthTokenPort, useValue: mockAuthToken },
        { provide: UserClientPort, useValue: mockUserClient },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
    authRepository = module.get(AuthRepositoryPort);
    authToken = module.get(AuthTokenPort);
    userClient = module.get(UserClientPort);
  });

  // Cleanup: 각 테스트 후 Mock 초기화
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 기능별로 그룹화
  describe("socialLogin", () => {
    describe("기존 사용자 로그인", () => {
      it("존재하는 사용자가 로그인하면 토큰을 반환해야 함", async () => {
        // Given - When - Then 패턴
      });
    });

    describe("신규 사용자 등록", () => {
      it("신규 사용자가 소셜 로그인하면 사용자를 생성하고 토큰을 반환해야 함", async () => {
        // ...
      });
    });

    describe("에러 케이스", () => {
      it("Provider를 찾을 수 없으면 에러를 던져야 함", async () => {
        // ...
      });
    });
  });
});
```

#### 3.2 Given-When-Then 패턴

```typescript
it("존재하는 사용자가 로그인하면 토큰을 반환해야 함", async () => {
  // ===== Given: 테스트 데이터 준비 =====
  const mockProvider = { id: "provider-uuid", provider: AuthProvider.GOOGLE };
  const mockClient = { id: "client-uuid", userId: "user-uuid" };
  const mockUser = { id: "user-uuid", email: "test@example.com" };
  const mockTokens = { accessToken: "token", refreshToken: "refresh" };

  const request = TestDataFactory.createSocialLoginRequest();

  // Mock 동작 설정
  authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
  authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
    mockClient,
  );
  userClient.findOneUser.mockReturnValue(of(mockUser as any));
  authToken.generateTokens.mockResolvedValue(mockTokens);

  // ===== When: 테스트 실행 =====
  const result = await service.socialLogin(request);

  // ===== Then: 결과 검증 =====
  // 1. 반환값 검증
  expect(result).toEqual({
    userId: "user-uuid",
    accessToken: "token",
    isNewUser: false,
  });

  // 2. Mock 호출 검증
  expect(authRepository.findProviderByProvider).toHaveBeenCalledTimes(1);
  expect(authRepository.findProviderByProvider).toHaveBeenCalledWith(
    expect.objectContaining({ provider: AuthProvider.GOOGLE }),
  );
});
```

### Phase 4: Controller 테스트 작성

#### 4.1 Controller 테스트 특징

- **목적**: HTTP/gRPC 요청 → 서비스 호출 → 응답 변환 검증
- **의존성**: 실제 Service를 Mock으로 대체
- **검증 대상**:
  - 입력 데이터 변환
  - 서비스 메서드 호출
  - 응답 형식

```typescript
// presentation/web/controllers/auth.controller.spec.ts

describe("AuthController", () => {
  let controller: AuthController;
  let loginService: jest.Mocked<LoginServicePort>;

  beforeEach(async () => {
    const mockLoginService = {
      socialLogin: jest.fn(),
      refreshToken: jest.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: LoginServicePort, useValue: mockLoginService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    loginService = module.get(LoginServicePort);
  });

  describe("socialLogin", () => {
    it("유효한 요청이 들어오면 서비스를 호출하고 결과를 반환해야 함", async () => {
      // Given
      const request = TestDataFactory.createSocialLoginRequest();
      const expectedResult = {
        userId: "user-id",
        accessToken: "token",
        isNewUser: false,
      };

      loginService.socialLogin.mockResolvedValue(expectedResult);

      // When
      const result = await controller.socialLogin(request);

      // Then
      expect(result).toEqual(expectedResult);
      expect(loginService.socialLogin).toHaveBeenCalledWith(request);
    });
  });
});
```

### Phase 5: E2E 테스트 작성

#### 5.1 E2E 테스트 특징

- **목적**: 실제 환경과 유사한 전체 플로우 테스트
- **범위**: Controller → Service → Repository → DB
- **주의사항**:
  - 테스트 DB 사용
  - 테스트 간 독립성 보장
  - Setup/Teardown 필수

```typescript
// test/app.e2e-spec.ts

describe("Auth MS (E2E)", () => {
  let app: INestApplication;
  let authService: auth.AuthServiceClient;

  beforeAll(async () => {
    // 전체 앱 초기화
    const moduleFixture = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // gRPC 마이크로서비스 연결
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
    const client = app.get<ClientGrpc>("AUTH_CLIENT");
    authService = client.getService<auth.AuthServiceClient>(
      auth.AUTH_SERVICE_NAME,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe("SocialLogin", () => {
    it("신규 사용자 소셜 로그인이 성공해야 함", (done) => {
      const request = TestDataFactory.createSocialLoginRequest({
        socialUserProfile: {
          clientId: `e2e-test-${Date.now()}`, // 고유한 ID
          // ...
        },
      });

      authService.socialLogin(request).subscribe({
        next: (result) => {
          expect(result.userId).toBeDefined();
          expect(result.accessToken).toBeDefined();
          expect(result.isNewUser).toBe(true);
          done();
        },
        error: (err) => done(err),
      });
    });
  });
});
```

---

## 테스트 레벨별 작성법

### 1. Unit Test (단위 테스트)

#### 목적

- 개별 함수/메서드의 로직 검증
- 외부 의존성 완전 격리 (Mock 사용)

#### 대상

- Services (비즈니스 로직)
- Utils (유틸리티 함수)

#### 작성 원칙

```typescript
// ✅ Good: 단일 책임, 명확한 의도
it("Provider를 찾을 수 없으면 에러를 던져야 함", async () => {
  authRepository.findProviderByProvider.mockResolvedValue(null);

  await expect(service.socialLogin(request)).rejects.toThrow(
    "Provider not found",
  );
});

// ❌ Bad: 여러 기능 동시 테스트
it("로그인 전체 플로우가 동작해야 함", async () => {
  // Provider 찾기 + Client 생성 + 토큰 발급을 한 번에 테스트
  // → 어디서 실패했는지 파악 어려움
});
```

### 2. Integration Test (통합 테스트)

#### 목적

- 여러 컴포넌트 간 상호작용 검증
- 실제 구현체 사용 (일부 Mock)

#### 대상

- Controllers + Services
- Repositories + DB

#### 작성 예시

```typescript
describe("AuthController + LoginService (Integration)", () => {
  let controller: AuthController;
  let loginService: LoginService;
  let authRepository: jest.Mocked<AuthRepositoryPort>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        LoginService, // 실제 서비스 사용
        { provide: AuthRepositoryPort, useValue: mockAuthRepository }, // Mock
        { provide: AuthTokenPort, useValue: mockAuthToken },
        { provide: UserClientPort, useValue: mockUserClient },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    loginService = module.get<LoginService>(LoginService);
    authRepository = module.get(AuthRepositoryPort);
  });

  it("Controller → Service 통합이 정상 동작해야 함", async () => {
    // Given
    setupMocks();

    // When
    const result = await controller.socialLogin(request);

    // Then
    expect(result).toBeDefined();
    expect(authRepository.findProviderByProvider).toHaveBeenCalled();
  });
});
```

### 3. E2E Test (End-to-End 테스트)

#### 목적

- 사용자 시나리오 전체 검증
- 실제 환경과 최대한 유사하게

#### 대상

- 주요 비즈니스 플로우
- Critical Path

#### 작성 원칙

```typescript
// ✅ Good: 실제 사용자 시나리오
it("사용자가 구글 로그인 → 토큰 받기 → API 호출 플로우", async () => {
  // 1. 소셜 로그인
  const loginResult = await authService.socialLogin(request);

  // 2. 받은 토큰으로 인증 필요한 API 호출
  const user = await userService.getProfile({
    token: loginResult.accessToken,
  });

  expect(user.id).toBe(loginResult.userId);
});

// ❌ Bad: E2E에서 세부 로직 테스트
it("Provider를 찾을 수 없으면...", async () => {
  // 이건 Unit Test 영역
});
```

---

## 테스트 헬퍼와 유틸리티

### 1. Test Data Factory

#### 구조

```typescript
export class TestDataFactory {
  // 기본 엔티티 생성
  static createMockUser(overrides?: Partial<User>): User {
    return {
      id: faker.datatype.uuid(), // 또는 고정값
      email: "test@example.com",
      displayName: "Test User",
      locale: "ko",
      ...overrides,
    };
  }

  // 복합 객체 생성
  static createSocialLoginRequest(
    provider: AuthProvider = AuthProvider.GOOGLE,
    overrides?: Partial<SocialLoginRequest>,
  ): SocialLoginRequest {
    return {
      provider,
      code: "test-code",
      socialUserProfile: this.createSocialUserProfile(provider),
      ...overrides,
    };
  }

  // 프라이빗 헬퍼
  private static createSocialUserProfile(provider: AuthProvider) {
    return {
      provider,
      clientId: `${provider.toLowerCase()}-client-id`,
      name: "Test User",
      email: "test@example.com",
      // ...
    };
  }
}
```

#### 사용 패턴

```typescript
// 기본 데이터 사용
const user = TestDataFactory.createMockUser();

// 일부 필드만 커스터마이징
const adminUser = TestDataFactory.createMockUser({
  email: "admin@example.com",
  role: "ADMIN",
});

// 체이닝으로 여러 개 생성
const users = [
  TestDataFactory.createMockUser({ id: "user-1" }),
  TestDataFactory.createMockUser({ id: "user-2" }),
  TestDataFactory.createMockUser({ id: "user-3" }),
];
```

### 2. Mock Port Factory

#### 구조

```typescript
export class MockPortFactory {
  /**
   * 기본 Mock 생성
   */
  static createAuthRepositoryPort(): jest.Mocked<AuthRepositoryPort> {
    return {
      findProviderByProvider: jest.fn(),
      findAuthClientByClientIdAndProviderId: jest.fn(),
      createAuthClient: jest.fn(),
      createAuthToken: jest.fn(),
      updateAuthTokens: jest.fn(),
    } as jest.Mocked<AuthRepositoryPort>;
  }

  /**
   * 사전 설정된 Mock 생성
   */
  static createAuthRepositoryPortWithDefaults(): jest.Mocked<AuthRepositoryPort> {
    const mock = this.createAuthRepositoryPort();

    // 기본 동작 설정
    mock.findProviderByProvider.mockResolvedValue(
      TestDataFactory.createMockProvider(),
    );

    return mock;
  }
}
```

### 3. 공통 Setup 헬퍼

```typescript
// test/helpers/setup-helpers.ts

/**
 * NestJS 테스트 모듈 생성 헬퍼
 */
export async function createTestingModule(
  providers: Provider[],
): Promise<TestingModule> {
  return Test.createTestingModule({
    providers,
  }).compile();
}

/**
 * Service 테스트용 모듈 생성
 */
export async function createServiceTestModule<T>(
  ServiceClass: Type<T>,
  mockPorts: Record<string, any>,
): Promise<{ service: T; mocks: Record<string, jest.Mocked<any>> }> {
  const providers = [
    ServiceClass,
    ...Object.entries(mockPorts).map(([token, value]) => ({
      provide: token,
      useValue: value,
    })),
  ];

  const module = await createTestingModule(providers);
  const service = module.get<T>(ServiceClass);

  const mocks = Object.keys(mockPorts).reduce(
    (acc, key) => {
      acc[key] = module.get(key);
      return acc;
    },
    {} as Record<string, jest.Mocked<any>>,
  );

  return { service, mocks };
}

// 사용 예시
const { service, mocks } = await createServiceTestModule(LoginService, {
  AuthRepositoryPort: MockPortFactory.createAuthRepositoryPort(),
  AuthTokenPort: MockPortFactory.createAuthTokenPort(),
  UserClientPort: MockPortFactory.createUserClientPort(),
});
```

---

## Best Practices

### 1. 테스트 명명 규칙

#### describe 블록

```typescript
// ✅ Good: 명확한 계층 구조
describe("LoginService (Unit)", () => {
  describe("socialLogin", () => {
    describe("기존 사용자 로그인", () => {
      it("존재하는 사용자가 로그인하면 토큰을 반환해야 함", () => {});
    });

    describe("신규 사용자 등록", () => {
      it("신규 사용자가 소셜 로그인하면 사용자를 생성하고 토큰을 반환해야 함", () => {});
    });

    describe("에러 케이스", () => {
      it("Provider를 찾을 수 없으면 에러를 던져야 함", () => {});
    });
  });
});

// ❌ Bad: 평면적 구조
describe("LoginService", () => {
  it("test1", () => {});
  it("test2", () => {});
  it("test3", () => {});
});
```

#### it 블록 명명

```typescript
// ✅ Good: 동작과 예상 결과 명확히
it("Provider를 찾을 수 없으면 에러를 던져야 함", () => {});
it("토큰이 만료되었으면 UNAUTHORIZED 에러를 반환해야 함", () => {});

// ❌ Bad: 모호한 설명
it("should work", () => {});
it("test provider", () => {});
```

### 2. Given-When-Then 패턴

```typescript
it("존재하는 사용자가 로그인하면 토큰을 반환해야 함", async () => {
  // ===== Given: 테스트 전제 조건 =====
  // 1. 테스트 데이터 준비
  const mockProvider = TestDataFactory.createMockProvider();
  const mockClient = TestDataFactory.createMockAuthClient();
  const mockUser = TestDataFactory.createMockUser();
  const request = TestDataFactory.createSocialLoginRequest();

  // 2. Mock 동작 설정
  authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
  authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
    mockClient,
  );
  userClient.findOneUser.mockReturnValue(of(mockUser));

  // ===== When: 테스트 대상 실행 =====
  const result = await service.socialLogin(request);

  // ===== Then: 결과 검증 =====
  // 1. 반환값 검증
  expect(result).toMatchObject({
    userId: mockUser.id,
    accessToken: expect.any(String),
    isNewUser: false,
  });

  // 2. 상호작용 검증
  expect(authRepository.findProviderByProvider).toHaveBeenCalledWith(
    expect.objectContaining({ provider: AuthProvider.GOOGLE }),
  );
  expect(authRepository.findProviderByProvider).toHaveBeenCalledTimes(1);
});
```

### 3. Mock 관리

#### beforeEach vs 개별 테스트

```typescript
describe("LoginService", () => {
  let service: LoginService;
  let authRepository: jest.Mocked<AuthRepositoryPort>;

  beforeEach(() => {
    // 공통 setup만 여기서
    jest.clearAllMocks();
  });

  it("테스트 1", () => {
    // Mock 설정은 각 테스트에서
    authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
    // ...
  });
});

// ✅ Good: 명확한 의도
// ❌ Bad: beforeEach에 모든 Mock 설정
//         → 테스트 간 의존성 생기고 가독성 떨어짐
```

#### Mock 초기화

```typescript
afterEach(() => {
  jest.clearAllMocks(); // ✅ Mock 호출 기록 초기화
  // jest.resetAllMocks();  // Mock 구현도 초기화
  // jest.restoreAllMocks(); // 원본 함수 복원
});
```

### 4. Assertion (검증) Best Practices

#### 4.1 명확한 Matcher 사용

```typescript
// ✅ Good: 의미 있는 Matcher
expect(result.userId).toBeDefined();
expect(result.accessToken).toBeTruthy();
expect(result.isNewUser).toBe(false);
expect(users).toHaveLength(3);
expect(error.message).toContain("Provider not found");

// ❌ Bad: 모호한 검증
expect(result).toBeTruthy();
expect(result.userId).not.toBeNull();
```

#### 4.2 객체 검증

```typescript
// ✅ Good: 필요한 필드만 검증
expect(result).toMatchObject({
  userId: expect.any(String),
  accessToken: expect.any(String),
  isNewUser: false,
});

// ✅ Good: 부분 매칭
expect(authRepository.findProviderByProvider).toHaveBeenCalledWith(
  expect.objectContaining({
    provider: AuthProvider.GOOGLE,
  })
);

// ❌ Bad: 과도한 검증 (구현 세부사항)
expect(result).toEqual({
  userId: "exact-uuid-123",
  accessToken: "exact-token-456",
  isNewUser: false,
  createdAt: new Date("2024-01-01"),  // 불필요한 세부사항
  metadata: { ... },  // 테스트와 무관
});
```

#### 4.3 에러 검증

```typescript
// ✅ Good: 에러 메시지 검증
await expect(service.socialLogin(request)).rejects.toThrow(
  "Provider not found",
);

// ✅ Good: 에러 타입 검증
await expect(service.socialLogin(request)).rejects.toThrow(NotFoundException);

// ✅ Good: 에러 객체 세부 검증
try {
  await service.socialLogin(request);
  fail("Should have thrown an error");
} catch (error) {
  expect(error).toBeInstanceOf(NotFoundException);
  expect(error.message).toContain("Provider not found");
  expect(error.statusCode).toBe(404);
}
```

### 5. 비동기 테스트

#### 5.1 async/await (권장)

```typescript
// ✅ Good
it("비동기 작업이 성공해야 함", async () => {
  const result = await service.socialLogin(request);
  expect(result).toBeDefined();
});

// ❌ Bad: Promise를 return하지 않음
it("비동기 작업이 성공해야 함", () => {
  service.socialLogin(request); // ← 테스트가 완료를 기다리지 않음!
  expect(result).toBeDefined();
});
```

#### 5.2 Observable 테스트

```typescript
// ✅ Good: done 콜백 사용
it("Observable이 값을 방출해야 함", (done) => {
  authService.socialLogin(request).subscribe({
    next: (result) => {
      expect(result).toBeDefined();
      done();
    },
    error: (err) => done(err),
  });
});

// ✅ Good: firstValueFrom 변환
it("Observable이 값을 방출해야 함", async () => {
  const result = await firstValueFrom(authService.socialLogin(request));
  expect(result).toBeDefined();
});
```

### 6. Test Coverage 관리

#### 목표

- **Unit Tests**: 80% 이상
- **Integration Tests**: 주요 플로우 커버
- **E2E Tests**: Critical Path 커버

#### Coverage 확인

```bash
# 전체 커버리지
npm run test:auth:cov

# HTML 리포트 확인
open coverage/lcov-report/index.html
```

#### 커버리지 설정

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.spec.ts", // 테스트 파일 제외
    "!src/**/*.dto.ts", // DTO 제외
    "!src/**/*.interface.ts", // 인터페이스 제외
    "!src/**/index.ts", // Barrel 파일 제외
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### 7. 테스트 독립성 보장

```typescript
// ✅ Good: 각 테스트가 독립적
describe("LoginService", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Mock 초기화
  });

  it("테스트 1", async () => {
    const request = TestDataFactory.createSocialLoginRequest();
    // 고유한 테스트 데이터 사용
  });

  it("테스트 2", async () => {
    const request = TestDataFactory.createSocialLoginRequest({
      socialUserProfile: { clientId: "unique-id-2" },
    });
  });
});

// ❌ Bad: 테스트 간 의존성
describe("LoginService", () => {
  let sharedUser; // ← 공유 상태

  it("테스트 1", async () => {
    sharedUser = await service.createUser(); // ← 부작용
  });

  it("테스트 2", async () => {
    // 테스트 1에 의존 ← 순서가 바뀌면 실패
    expect(sharedUser).toBeDefined();
  });
});
```

### 8. 테스트 실행 전략

#### 개발 중

```bash
# Watch 모드로 변경된 파일만 테스트
npm run test:auth:watch

# 특정 파일만 테스트
npm run test:auth -- login.service.spec.ts

# 특정 describe 블록만 테스트
npm run test:auth -- --testNamePattern="기존 사용자 로그인"
```

#### CI/CD

```bash
# 전체 테스트 + Coverage
npm run test:auth:cov

# E2E 테스트
npm run test:auth:e2e
```

---

## 코드 변경 시 테스트 수정 가이드

### 1. Controller 메서드 추가 시

#### 시나리오: AuthController에 refreshToken 메서드 추가

**Step 1: 실제 코드 변경**

```typescript
// auth.controller.ts
export class AuthController {
  @GrpcMethod("AuthService", "RefreshToken")
  refreshToken(
    data: auth.RefreshTokenRequest,
  ): Promise<auth.IRefreshTokenResult> {
    return this.loginService.refreshToken(data);
  }
}
```

**Step 2: 테스트 코드 수정**

```typescript
// auth.controller.spec.ts

describe("AuthController (Unit)", () => {
  // 1. Mock에 새 메서드 추가
  const mockLoginService = {
    socialLogin: jest.fn(),
    refreshToken: jest.fn(), // ✅ 추가
  };

  // 2. 새 메서드에 대한 테스트 추가
  describe("refreshToken", () => {
    it("유효한 Refresh Token으로 새 Access Token을 발급받아야 함", async () => {
      // Given
      const request: auth.RefreshTokenRequest = {
        refreshToken: "valid-refresh-token",
      };

      const expectedResult: auth.IRefreshTokenResult = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      };

      loginService.refreshToken.mockResolvedValue(expectedResult);

      // When
      const result = await controller.refreshToken(request);

      // Then
      expect(result).toEqual(expectedResult);
      expect(loginService.refreshToken).toHaveBeenCalledWith(request);
    });

    it("만료된 Refresh Token은 에러를 발생시켜야 함", async () => {
      // Given
      const request: auth.RefreshTokenRequest = {
        refreshToken: "expired-refresh-token",
      };

      loginService.refreshToken.mockRejectedValue(
        new Error("Refresh token expired"),
      );

      // When & Then
      await expect(controller.refreshToken(request)).rejects.toThrow(
        "Refresh token expired",
      );
    });
  });
});
```

**체크리스트:**

- [ ] Mock 객체에 새 메서드 추가
- [ ] 새 메서드에 대한 describe 블록 생성
- [ ] Happy Path 테스트 작성
- [ ] Error Case 테스트 작성
- [ ] Mock 호출 검증 추가

---

### 2. Service 메서드 로직 변경 시

#### 시나리오: LoginService.socialLogin에서 사용자 역할(role) 추가

**Step 1: 실제 코드 변경**

```typescript
// login.service.ts
async socialLogin(dto: auth.SocialLoginRequest): Promise<auth.ILoginResult> {
  // ... 기존 로직
  const user = await firstValueFrom(this.userClient.findOneUser({ id: userId }));

  // ✅ 새로운 로직: 사용자 역할 확인
  const role = await this.roleRepository.findUserRole(user.id);

  return {
    userId: user.id,
    accessToken: tokens.accessToken,
    isNewUser: false,
    role: role.name, // ✅ 추가된 필드
  };
}
```

**Step 2: 테스트 코드 수정**

```typescript
// login.service.spec.ts

describe("LoginService (Unit)", () => {
  let roleRepository: jest.Mocked<RoleRepositoryPort>;

  // 1. Mock Port 추가
  const mockRoleRepository = {
    findUserRole: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LoginService,
        { provide: AuthRepositoryPort, useValue: mockAuthRepository },
        { provide: AuthTokenPort, useValue: mockAuthToken },
        { provide: UserClientPort, useValue: mockUserClient },
        { provide: RoleRepositoryPort, useValue: mockRoleRepository }, // ✅ 추가
      ],
    }).compile();

    // ...
    roleRepository = module.get(RoleRepositoryPort);
  });

  describe("socialLogin", () => {
    it("존재하는 사용자가 로그인하면 역할과 함께 토큰을 반환해야 함", async () => {
      // Given
      const mockRole = { id: "role-id", name: "USER" };

      // Mock 설정
      authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
      authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
        mockClient,
      );
      userClient.findOneUser.mockReturnValue(of(mockUser));
      roleRepository.findUserRole.mockResolvedValue(mockRole); // ✅ 추가
      authToken.generateTokens.mockResolvedValue(mockTokens);

      // When
      const result = await service.socialLogin(request);

      // Then
      expect(result).toMatchObject({
        userId: "user-uuid",
        accessToken: "token",
        isNewUser: false,
        role: "USER", // ✅ 추가
      });

      // ✅ 새로운 Mock 호출 검증
      expect(roleRepository.findUserRole).toHaveBeenCalledWith("user-uuid");
      expect(roleRepository.findUserRole).toHaveBeenCalledTimes(1);
    });
  });
});
```

**체크리스트:**

- [ ] 새로운 의존성(Port) Mock 추가
- [ ] beforeEach에서 새 Mock 주입
- [ ] 기존 테스트에 새 Mock 동작 설정
- [ ] 반환값 검증에 새 필드 추가
- [ ] 새 Mock 호출 검증 추가

---

### 3. Port(인터페이스) 변경 시

#### 시나리오: AuthRepositoryPort에 메서드 시그니처 변경

**Step 1: Port 변경**

```typescript
// auth.repository.port.ts (Before)
export interface AuthRepositoryPort {
  findProviderByProvider(dto: FindProviderDto): Promise<Provider | null>;
}

// auth.repository.port.ts (After)
export interface AuthRepositoryPort {
  findProviderByProvider(
    provider: AuthProvider, // ✅ DTO → 단순 파라미터로 변경
  ): Promise<Provider | null>;
}
```

**Step 2: 실제 구현체 변경**

```typescript
// mariadb.repository.ts
async findProviderByProvider(provider: AuthProvider): Promise<Provider | null> {
  // DTO 대신 provider 직접 사용
  return this.db.query.providers.findFirst({
    where: eq(schema.providers.provider, provider),
  });
}
```

**Step 3: Service 코드 변경**

```typescript
// login.service.ts
async socialLogin(dto: auth.SocialLoginRequest): Promise<auth.ILoginResult> {
  // Before
  const provider = await this.authRepository.findProviderByProvider(
    new FindProviderByProviderDomainRequestDto(dto.provider as AuthProvider),
  );

  // After
  const provider = await this.authRepository.findProviderByProvider(
    dto.provider as AuthProvider, // ✅ DTO 생성 제거
  );
}
```

**Step 4: 테스트 코드 수정**

```typescript
// login.service.spec.ts

it("존재하는 사용자가 로그인하면 토큰을 반환해야 함", async () => {
  // Given
  const mockProvider = { id: "provider-uuid", provider: AuthProvider.GOOGLE };

  // Before
  authRepository.findProviderByProvider.mockResolvedValue(mockProvider);

  // After (변경 없음 - Mock 반환값은 동일)
  authRepository.findProviderByProvider.mockResolvedValue(mockProvider);

  // When
  const result = await service.socialLogin(request);

  // Then
  // Before
  expect(authRepository.findProviderByProvider).toHaveBeenCalledWith(
    expect.objectContaining({ provider: AuthProvider.GOOGLE }),
  );

  // After - 인자 검증 변경 ✅
  expect(authRepository.findProviderByProvider).toHaveBeenCalledWith(
    AuthProvider.GOOGLE, // DTO 대신 직접 값 전달
  );
});
```

**체크리스트:**

- [ ] Port 인터페이스 변경
- [ ] 실제 구현체(Repository) 변경
- [ ] Service 코드에서 호출 방식 변경
- [ ] 테스트에서 Mock 호출 검증 변경 (toHaveBeenCalledWith)
- [ ] Mock 반환값은 대부분 변경 불필요

---

### 4. 새로운 Edge Case 발견 시

#### 시나리오: 동시에 같은 이메일로 회원가입 시도 (Race Condition)

**Step 1: 테스트 추가 (TDD)**

```typescript
// login.service.spec.ts

describe("에러 케이스", () => {
  it("동시에 같은 이메일로 가입 시도 시 중복 에러를 던져야 함", async () => {
    // Given
    const request = TestDataFactory.createSocialLoginRequest({
      socialUserProfile: {
        email: "duplicate@example.com",
        clientId: "new-client-id",
      },
    });

    authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
    authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
      null,
    ); // 신규
    userClient.findOneUserByEmail.mockReturnValue(of(null)); // 이메일 없음
    userClient.createUser.mockReturnValue(
      throwError(() => new Error("Duplicate email")), // ✅ 중복 에러
    );

    // When & Then
    await expect(service.socialLogin(request)).rejects.toThrow(
      "Duplicate email",
    );
  });
});
```

**Step 2: 실제 코드 수정 (에러 처리 추가)**

```typescript
// login.service.ts
async socialLogin(dto: auth.SocialLoginRequest): Promise<auth.ILoginResult> {
  try {
    const newUser = await firstValueFrom(this.userClient.createUser({ ... }));
  } catch (error) {
    // ✅ 중복 이메일 에러 처리
    if (error.message.includes("Duplicate")) {
      throw new ConflictException("Email already exists");
    }
    throw error;
  }
}
```

**Step 3: 테스트 실행 및 검증**

```bash
npm run test:auth -- login.service.spec.ts
```

**체크리스트:**

- [ ] 새로운 Edge Case 테스트 추가 (Red)
- [ ] 실제 코드 수정 (Green)
- [ ] 테스트 통과 확인
- [ ] 관련 테스트들도 여전히 통과하는지 확인 (Regression)

---

### 5. 외부 의존성 변경 시 (예: gRPC → REST API)

#### 시나리오: UserClient가 gRPC → REST API로 변경

**Step 1: Port는 유지 (인터페이스 동일)**

```typescript
// user-client.port.ts (변경 없음)
export interface UserClientPort {
  findOneUser(dto: FindOneUserDto): Observable<User>;
  createUser(dto: CreateUserDto): Observable<User>;
}
```

**Step 2: 구현체만 변경**

```typescript
// Before: user-grpc-client.adapter.ts
export class UserGrpcClient implements UserClientPort {
  findOneUser(dto: FindOneUserDto): Observable<User> {
    return this.client.getService("UserService").findOne(dto);
  }
}

// After: user-rest-client.adapter.ts
export class UserRestClient implements UserClientPort {
  findOneUser(dto: FindOneUserDto): Observable<User> {
    return this.httpClient
      .get(`/users/${dto.id}`)
      .pipe(map((response) => response.data));
  }
}
```

**Step 3: 테스트 코드는 변경 불필요! 🎉**

```typescript
// login.service.spec.ts (변경 없음!)

const mockUserClient = {
  createUser: jest.fn(),
  findOneUser: jest.fn(), // Mock은 그대로
  findOneUserByEmail: jest.fn(),
};

// Port 기반으로 테스트하므로 구현체 변경에 영향 없음 ✅
userClient.findOneUser.mockReturnValue(of(mockUser));
```

**핵심 원칙:**

- ✅ **Port(인터페이스) 기반 테스트는 구현체 변경에 영향받지 않음**
- ✅ **Hexagonal Architecture의 장점**
- ⚠️ 단, Adapter(구현체) 자체의 Integration Test는 업데이트 필요

---

### 6. 테스트 실패 시 디버깅 전략

#### 문제: 테스트가 실패했을 때

**Step 1: 에러 메시지 확인**

```bash
npm run test:auth -- login.service.spec.ts

# 출력:
# FAIL  apps/auth/src/services/login.service.spec.ts
#   ● LoginService › socialLogin › 존재하는 사용자가 로그인하면 토큰을 반환해야 함
#
#     expect(jest.fn()).toHaveBeenCalledWith(...expected)
#
#     Expected: {"provider": "GOOGLE"}
#     Received: {"provider": "KAKAO"}
```

**Step 2: 원인 파악**

```typescript
// 1. Mock 설정 확인
console.log("Mock calls:", authRepository.findProviderByProvider.mock.calls);

// 2. 실제 호출된 인자 확인
expect(authRepository.findProviderByProvider).toHaveBeenCalledWith(
  expect.anything(), // 일단 통과시키고 실제 값 확인
);
```

**Step 3: 문제 수정**

```typescript
// 잘못된 테스트 데이터 수정
const request = TestDataFactory.createSocialLoginRequest({
  provider: AuthProvider.GOOGLE, // ✅ KAKAO → GOOGLE
});
```

**디버깅 체크리스트:**

- [ ] Mock 설정이 올바른가?
- [ ] 테스트 데이터가 올바른가?
- [ ] Mock 호출 순서가 올바른가?
- [ ] beforeEach/afterEach가 올바르게 동작하는가?
- [ ] 비동기 처리가 올바른가? (async/await, done)

---

### 7. 테스트 커버리지 향상 전략

#### 현재 커버리지 확인

```bash
npm run test:auth:cov

# 출력:
# File                | % Stmts | % Branch | % Funcs | % Lines |
# --------------------|---------|----------|---------|---------|
# login.service.ts    |   85.71 |    66.67 |     100 |   85.71 |
# auth.controller.ts  |     100 |      100 |     100 |     100 |
```

#### 커버되지 않은 코드 찾기

```bash
# HTML 리포트 열기
open coverage/lcov-report/index.html

# 빨간색으로 표시된 라인 = 커버되지 않은 코드
```

#### 누락된 테스트 케이스 추가

```typescript
// login.service.ts의 커버되지 않은 라인
if (!updatedTokenInfo) {
  throw new Error("Failed to update auth token info"); // ← 이 라인이 빨간색
}

// 테스트 추가
it("토큰 업데이트 실패 시 에러를 던져야 함", async () => {
  // Given
  authRepository.findProviderByProvider.mockResolvedValue(mockProvider);
  authRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
    mockClient,
  );
  userClient.findOneUser.mockReturnValue(of(mockUser));
  authToken.generateTokens.mockResolvedValue(mockTokens);
  authRepository.updateAuthTokens.mockResolvedValue(null); // ✅ null 반환

  // When & Then
  await expect(service.socialLogin(request)).rejects.toThrow(
    "Failed to update auth token info",
  );
});
```

---

## LoginService 테스트 개선 사례

### 개선 전후 비교

#### Before: 중복 코드와 하드코딩 (4개 테스트)

```typescript
// ❌ 문제점: 매 테스트마다 반복적인 데이터 생성
it("존재하는 사용자가 로그인하면 토큰을 반환해야 함", async () => {
  const mockProvider = { id: "provider-uuid", provider: AuthProvider.GOOGLE };
  const mockClient = { id: "client-uuid", userId: "user-uuid" };
  const mockUser = { id: "user-uuid", email: "test@example.com", ... };
  const mockTokens = { accessToken: "access-token", ... };
  const socialLoginRequest = { provider: AuthProvider.GOOGLE, ... };
  // ... 약 40줄의 반복적인 코드
});
```

#### After: Test Data Factory 활용 (14개 테스트)

```typescript
// ✅ 개선: Factory로 간결하고 명확한 코드
it("존재하는 사용자가 로그인하면 토큰을 반환해야 함", async () => {
  const mockProvider = TestDataFactory.createMockProvider(AuthProvider.GOOGLE);
  const mockClient = TestDataFactory.createMockAuthClient({
    providerId: mockProvider.id,
  });
  const mockUser = TestDataFactory.createMockUser({ id: mockClient.userId });
  const mockTokens = TestDataFactory.createMockTokens();
  const request = TestDataFactory.createSocialLoginRequest(AuthProvider.GOOGLE);
  // ... 테스트 의도에 집중
});
```

### 개선 결과

| 항목        | Before | After | 개선율        |
| ----------- | ------ | ----- | ------------- |
| 테스트 수   | 4개    | 14개  | +250%         |
| 에러 케이스 | 2개    | 8개   | +300%         |
| Edge Cases  | 0개    | 2개   | NEW           |
| 코드 중복도 | 높음   | 낮음  | Factory 패턴  |
| 유지보수성  | 낮음   | 높음  | 일관된 데이터 |

### 추가된 테스트 케이스

#### 다양한 Provider 지원

```typescript
✓ KAKAO Provider로 기존 사용자가 로그인하면 성공해야 함
✓ GITHUB Provider로 신규 사용자가 가입하면 성공해야 함
```

#### 에러 케이스 완전 커버

```typescript
✓ Provider를 찾을 수 없으면 에러를 던져야 함
✓ socialUserProfile이 없으면 에러를 던져야 함
✓ 기존 사용자 조회 실패 시 에러를 던져야 함
✓ 토큰 업데이트 실패 시 에러를 던져야 함
✓ 신규 사용자 생성 실패 시 에러를 던져야 함
✓ AuthClient 생성 실패 시 에러를 던져야 함
✓ 신규 사용자의 AuthToken 생성 실패 시 에러를 던져야 함
✓ 생성된 AuthClient 조회 실패 시 에러를 던져야 함
```

#### Edge Cases

```typescript
✓ 이메일이 없는 소셜 프로필도 처리할 수 있어야 함
✓ 동일한 Provider로 여러 계정을 가진 사용자 처리
```

### 핵심 개선 기법

#### 1. Mock Port Factory로 보일러플레이트 제거

```typescript
// Before
const mockAuthRepository = {
  findProviderByProvider: jest.fn(),
  findAuthClientByClientIdAndProviderId: jest.fn(),
  // ... 7개 메서드
};

// After
const mockAuthRepository = MockPortFactory.createAuthRepositoryPort();
```

#### 2. 관계형 데이터 생성

```typescript
// 데이터 간 관계를 명확히
const mockProvider = TestDataFactory.createMockProvider(AuthProvider.GOOGLE);
const mockClient = TestDataFactory.createMockAuthClient({
  providerId: mockProvider.id, // ✅ 관계 유지
});
const mockUser = TestDataFactory.createMockUser({
  id: mockClient.userId, // ✅ 관계 유지
});
```

#### 3. Observable 에러 테스트

```typescript
import { throwError } from "rxjs";

it("신규 사용자 생성 실패 시 에러를 던져야 함", async () => {
  userClient.createUser.mockReturnValue(
    throwError(() => new Error("Database error")),
  );

  await expect(service.socialLogin(request)).rejects.toThrow("Database error");
});
```

#### 4. 순차적 Mock 반환값

```typescript
// 같은 메서드가 여러 번 호출될 때
authRepository.findAuthClientByClientIdAndProviderId
  .mockResolvedValueOnce(null) // 첫 번째: 없음
  .mockResolvedValueOnce(mockNewClient); // 두 번째: 생성 후 조회
```

---

## 다음 단계

### 현재 상태 (Auth 마이크로서비스)

- ✅ LoginService Unit Test 완료
- ✅ E2E Test 기본 구조 완료
- ✅ Test Helpers (Factory) 완료
- ✅ AuthController Test 완성
- ✅ **LoginService 테스트 개선 완료** ← NEW!
  - ✅ Test Data Factory 적용
  - ✅ 14개 테스트 케이스 (4개 → 14개)
  - ✅ 에러 케이스 8개 추가
  - ✅ Edge Case 2개 추가
- ⏳ Repository Test 없음
- ⏳ RefreshToken Service Test 없음

### 테스트 작성 우선순위

1. ✅ ~~LoginService 개선~~ (완료)
2. ✅ ~~AuthController 테스트 완성~~ (완료)
3. **RefreshTokenService 테스트 작성** ← NEXT
   - Unit Test 작성
   - 토큰 갱신 로직 검증
4. **E2E 테스트 확장**
   - Refresh Token 플로우
   - 에러 시나리오
5. **Integration 테스트 추가**
   - Repository 통합 테스트
   - DB 연동 검증

---

## Jest 경로 별칭 문제 해결

### 문제 상황

Jest에서 경로 별칭(@app/integrations)을 사용할 때 발생하는 모듈 해석 오류:

```bash
Could not locate module @app/integrations/mariadb/constants/mariadb.constants
mapped as: libs/$1/src
```

### 원인

- **TypeScript**: `tsconfig.json`의 `paths` 사용
- **Jest**: 자체 모듈 해석 → `moduleNameMapper` 필요

Jest는 TypeScript 설정을 자동으로 읽지 않으므로 별도 설정이 필요합니다.

### 해결 방법

#### Before (❌ 잘못된 설정)

```javascript
// jest.config.js
moduleNameMapper: {
  "^@app/(.*)$": "<rootDir>/../../libs/$1/src",  // ❌ 문제
}
```

**문제점:**

```
@app/integrations/mariadb/constants/mariadb.constants
↓
libs/integrations/mariadb/constants/mariadb.constants/src  ❌ (/src가 끝에!)
```

#### After (✅ 올바른 설정)

```javascript
// jest.config.js
moduleNameMapper: {
  // 1. 구체적 패턴 먼저 (우선순위 높음)
  "^@app/integrations/(.*)$": "<rootDir>/../../libs/integrations/src/$1",
  "^@app/contracts/(.*)$": "<rootDir>/../../libs/contracts/src/$1",
  "^@app/config/(.*)$": "<rootDir>/../../libs/config/src/$1",
  "^@app/logging/(.*)$": "<rootDir>/../../libs/logging/src/$1",

  // 2. 라이브러리 루트 import
  "^@app/integrations$": "<rootDir>/../../libs/integrations/src",
  "^@app/contracts$": "<rootDir>/../../libs/contracts/src",

  // 3. 앱 내부 경로
  "^@auth/(.*)$": "<rootDir>/src/$1",
},
```

**올바른 변환:**

```
@app/integrations/mariadb/constants/mariadb.constants
↓
libs/integrations/src/mariadb/constants/mariadb.constants  ✅
```

### 핵심 원칙

1. **tsconfig.json과 jest.config.js를 일치시킨다**

   ```json
   // tsconfig.json
   "@app/integrations/*": ["libs/integrations/src/*"]

   // jest.config.js
   "^@app/integrations/(.*)$": "<rootDir>/../../libs/integrations/src/$1"
   ```

2. **구체적인 패턴을 먼저 매핑한다**

   ```javascript
   // ✅ 올바른 순서
   "^@app/integrations/(.*)$": "...",  // 구체적 (먼저)
   "^@app/(.*)$": "...",              // 일반적 (나중)

   // ❌ 잘못된 순서
   "^@app/(.*)$": "...",              // 일반적이 먼저 매칭되어 나머지 도달 불가!
   "^@app/integrations/(.*)$": "...",
   ```

3. **실제 파일 구조를 정확히 반영한다**
   ```
   libs/integrations/src/mariadb/constants/mariadb.constants.ts  ✅
   ```

### 검증 방법

```bash
# 1. 테스트 실행
npm run test:auth

# 2. 특정 파일 테스트
npm run test:auth -- mariadb.repository.spec.ts

# 3. 경로 매핑 디버깅
npm run test:auth -- --verbose
```

### 추가 학습 자료

상세한 경로 별칭 설정 가이드는 [`docs/jest-path-alias.md`](./jest-path-alias.md) 참고

---

## 참고 자료

### Jest 공식 문서

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [moduleNameMapper](https://jestjs.io/docs/configuration#modulenamemapper-objectstring-string--arraystring)

### NestJS 테스팅

- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [@nestjs/testing API](https://docs.nestjs.com/fundamentals/testing#unit-testing)
- [Monorepo Mode](https://docs.nestjs.com/cli/monorepo)

### TypeScript

- [Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)

### Best Practices

- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Jest Best Practices](https://jestjs.io/docs/best-practices)

---

**작성일**: 2024-10-18  
**대상 서비스**: Auth 마이크로서비스  
**아키텍처**: Hexagonal Architecture (Ports & Adapters)  
**테스트 프레임워크**: Jest + @nestjs/testing  
**최종 테스트 결과**: ✅ 22 passed / 3 suites passed
