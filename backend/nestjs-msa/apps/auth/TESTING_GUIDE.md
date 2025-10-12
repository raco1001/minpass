# Auth MS 테스트 가이드

Hexagonal Architecture 기반 테스트 전략 및 베스트 프랙티스

## 📊 테스트 전략 개요

### 테스트 피라미드

```
        /\
       /E2E\          ← 10% (전체 플로우)
      /------\
     /Integration\    ← 20% (레이어 간 통합)
    /------------\
   /  Unit Tests  \   ← 70% (비즈니스 로직)
  /----------------\
```

## 🎯 레이어별 테스트 전략

### 1. Domain Layer Tests (Unit)

**목적**: 순수 비즈니스 로직, Entity, DTO 검증  
**특징**: 외부 의존성 없음, 가장 빠르고 간단

```typescript
// DTO 테스트
describe('FindProviderByProviderDomainRequestDto', () => {
  it('should create DTO correctly', () => {
    const dto = new FindProviderByProviderDomainRequestDto(AuthProvider.GOOGLE);
    expect(dto.provider).toBe(AuthProvider.GOOGLE);
  });
});

// Entity 테스트
describe('AuthClientEntity', () => {
  it('should validate business rules', () => {
    const entity = new AuthClientEntity(...);
    expect(entity.isValid()).toBe(true);
  });
});
```

**위치**: `src/core/domain/**/*.spec.ts`

---

### 2. Application Layer Tests (Unit)

**목적**: Service 비즈니스 로직 검증 (Port를 Mock으로 대체)  
**핵심**: **Port를 통한 완전한 격리**

```typescript
describe("LoginService", () => {
  let service: LoginService;
  let mockAuthRepository: jest.Mocked<AuthRepositoryPort>;
  let mockAuthToken: jest.Mocked<AuthTokenPort>;
  let mockUserClient: jest.Mocked<UserClientPort>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
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
    mockAuthRepository = module.get(AuthRepositoryPort);
    // ...
  });

  it("should handle existing user login", async () => {
    // Given - Test Data 준비
    const mockProvider = TestDataFactory.createMockProvider();
    const mockClient = TestDataFactory.createMockAuthClient();

    mockAuthRepository.findProviderByProvider.mockResolvedValue(mockProvider);
    mockAuthRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
      mockClient,
    );

    // When - 실행
    const result = await service.socialLogin(request);

    // Then - 검증
    expect(result.isNewUser).toBe(false);
    expect(mockAuthRepository.findProviderByProvider).toHaveBeenCalled();
  });
});
```

**핵심 원칙**:

- ✅ Port를 Mock으로 대체하여 완전히 격리
- ✅ 외부 의존성 없이 빠른 테스트
- ✅ 비즈니스 로직에만 집중
- ✅ TestDataFactory 사용으로 중복 제거

**위치**: `src/services/**/*.spec.ts`

---

### 3. Adapter Layer Tests (Integration)

**목적**: Repository, Client 등 외부 시스템과의 통합 검증  
**특징**: 실제 DB 또는 TestContainer 사용

```typescript
describe('MariadbRepository (Integration)', () => {
  let repository: MariadbRepository;
  let db: DrizzleDb;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MariaDbModule.registerAsync(
          'auth',
          () => ({
            // Test DB 설정
            database: 'minpass_test',
            // ...
          }),
          [],
          [],
        ),
      ],
      providers: [MariadbRepository],
    }).compile();

    repository = module.get<MariadbRepository>(MariadbRepository);
    db = module.get<DrizzleDb>(DRIZZLE_DB('auth'));
  });

  afterEach(async () => {
    // 테스트 데이터 정리
    await db.delete(authTokens);
    await db.delete(authClients);
  });

  it('should create auth client successfully', async () => {
    // Given
    const provider = await repository.findProviderByProvider(...);

    // When
    const result = await repository.createAuthClient({
      userId: 'test-user-uuid',
      providerId: provider!.id,
      clientId: 'test-client-id',
      salt: 'test-salt',
    });

    // Then
    expect(result).toBeDefined();
    expect(result?.userId).toBe('test-user-uuid');
  });
});
```

**핵심 원칙**:

- ✅ 실제 DB와 통합하여 테스트
- ✅ 각 테스트 후 데이터 정리 (clean state)
- ✅ Transaction 또는 TestContainer 활용
- ❌ Mock 사용하지 않음 (실제 통합 검증)

**위치**: `src/infrastructure/**/*.spec.ts`

---

### 4. E2E Tests

**목적**: 전체 시스템 통합 테스트  
**특징**: 실제 환경과 유사한 설정

```typescript
describe('Auth MS (E2E)', () => {
  let app: INestApplication;
  let authService: auth.AuthServiceClient;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = module.createNestApplication();
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: auth.protobufPackage,
        protoPath: join(__dirname, '../proto/auth.proto'),
        url: '127.0.0.1:50051',
      },
    });

    await app.startAllMicroservices();
    await app.init();
  });

  it('should handle complete social login flow', (done) => {
    const request: auth.SocialLoginRequest = {
      provider: 'GOOGLE',
      socialUserProfile: { ... },
    };

    authService.socialLogin(request).subscribe({
      next: (result) => {
        expect(result.userId).toBeDefined();
        expect(result.accessToken).toBeDefined();
        done();
      },
    });
  });
});
```

**위치**: `test/**/*.e2e-spec.ts`

---

## 🛠️ 테스트 유틸리티 사용법

### TestDataFactory

Mock 데이터를 일관되게 생성:

```typescript
// Provider 생성
const provider = TestDataFactory.createMockProvider(AuthProvider.GOOGLE);

// User 생성 (기본값 + override)
const user = TestDataFactory.createMockUser({ email: "custom@example.com" });

// SocialLoginRequest 생성
const request = TestDataFactory.createSocialLoginRequest();
```

### MockPortFactory

Port Mock을 쉽게 생성:

```typescript
const mockRepository = MockPortFactory.createAuthRepositoryPort();
const mockTokenService = MockPortFactory.createAuthTokenPort();
const mockUserClient = MockPortFactory.createUserClientPort();
```

---

## 📝 테스트 작성 체크리스트

### ✅ Application Layer (Service) 테스트

- [ ] 모든 Port를 Mock으로 대체
- [ ] Happy Path 테스트
- [ ] Error Case 테스트
- [ ] Edge Case 테스트
- [ ] Port 호출 검증 (`toHaveBeenCalledWith`)
- [ ] 반환값 검증
- [ ] TestDataFactory 사용

### ✅ Adapter Layer (Repository) 테스트

- [ ] 실제 DB 연결 설정
- [ ] 테스트 후 데이터 정리
- [ ] CRUD 작동 확인
- [ ] 트랜잭션 동작 확인
- [ ] Unique Constraint 검증
- [ ] Foreign Key 검증

### ✅ E2E 테스트

- [ ] 전체 Module 로드
- [ ] 실제 gRPC 통신
- [ ] 전체 플로우 검증
- [ ] 에러 처리 검증

---

## 🚀 테스트 실행 명령어

```bash
# 모든 Unit 테스트 실행
npm test auth

# Watch 모드로 테스트
npm run test:watch auth

# Coverage 리포트 생성
npm run test:cov auth

# E2E 테스트 실행
npm run test:e2e auth

# 특정 파일만 테스트
npm test -- login.service.spec.ts
```

---

## 📊 Coverage 목표

| 구분              | 목표 Coverage |
| ----------------- | ------------- |
| Application Layer | 90%+          |
| Domain Layer      | 95%+          |
| Adapter Layer     | 80%+          |
| Overall           | 85%+          |

---

## 💡 베스트 프랙티스

### 1. AAA 패턴 사용

```typescript
it("should do something", () => {
  // Given (Arrange) - 테스트 데이터 준비
  const input = TestDataFactory.createMockUser();

  // When (Act) - 실행
  const result = service.doSomething(input);

  // Then (Assert) - 검증
  expect(result).toBe(expected);
});
```

### 2. 의미 있는 테스트 이름

❌ Bad:

```typescript
it('test1', () => { ... });
it('should work', () => { ... });
```

✅ Good:

```typescript
it('should return existing user when client exists', () => { ... });
it('should create new user when client does not exist', () => { ... });
it('should throw error when provider is not found', () => { ... });
```

### 3. 하나의 테스트는 하나의 케이스만

❌ Bad:

```typescript
it("should handle login and logout", () => {
  // login 테스트
  // logout 테스트 - 분리해야 함!
});
```

✅ Good:

```typescript
it('should handle login successfully', () => { ... });
it('should handle logout successfully', () => { ... });
```

### 4. Mock 설정 명확히

```typescript
// ✅ 명확한 Mock 설정
mockRepository.findUser.mockResolvedValue(expectedUser);
mockRepository.findUser.mockRejectedValue(new Error("Not found"));

// ❌ 불명확한 Mock 설정
mockRepository.findUser.mockReturnValue(Promise.resolve(null));
```

### 5. 테스트 격리

```typescript
afterEach(() => {
  jest.clearAllMocks(); // Mock 상태 초기화
});

afterEach(async () => {
  await cleanDatabase(); // DB 데이터 정리
});
```

---

## 🔍 디버깅 팁

### Jest 디버그 모드

```bash
# VSCode에서 디버깅
node --inspect-brk node_modules/.bin/jest --runInBand

# 특정 테스트만 디버깅
npm test -- --testNamePattern="should login existing user"
```

### Mock 호출 확인

```typescript
console.log(mockRepository.findUser.mock.calls);
console.log(mockRepository.findUser.mock.results);
```

---

## 📚 참고 자료

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Hexagonal Architecture Testing](https://alistair.cockburn.us/hexagonal-architecture/)
- [Test Double Patterns](https://martinfowler.com/bliki/TestDouble.html)
