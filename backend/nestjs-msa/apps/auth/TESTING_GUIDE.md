# Auth MS Test Guide

Hexagonal Architecture Based Test Strategies & Best Practices

## 📊 Test Strategy Summary

### Test Pyramid

```bash
        /\
       /E2E\          ← 10% (Entire Flow)
      /------\
     /Integration\    ← 20% (Inter-layer Integration)
    /------------\
   /  Unit Tests  \   ← 70% (Business Logics)
  /----------------\
```

## 🎯 Test Strategies per Layers

### 1. Domain Layer Tests (Unit)

**Objectives**: Validate pure business logic, entities, and DTOs  
**Characteristics**: No external dependencies; fastest and simplest

```typescript
// DTO test
describe('FindProviderByProviderDomainRequestDto', () => {
  it('should create DTO correctly', () => {
    const dto = new FindProviderByProviderDomainRequestDto(AuthProvider.GOOGLE);
    expect(dto.provider).toBe(AuthProvider.GOOGLE);
  });
});

// Entity test
describe('AuthClientEntity', () => {
  it('should validate business rules', () => {
    const entity = new AuthClientEntity(...);
    expect(entity.isValid()).toBe(true);
  });
});
```

**Location**: `src/core/domain/**/*.spec.ts`

---

### 2. Application Layer Tests (Unit)

**Objectives**: Verify service business logic (ports mocked)  
**Core principles**: **Complete isolation via ports**

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
    // Given - Test Data Preparation
    const mockProvider = TestDataFactory.createMockProvider();
    const mockClient = TestDataFactory.createMockAuthClient();

    mockAuthRepository.findProviderByProvider.mockResolvedValue(mockProvider);
    mockAuthRepository.findAuthClientByClientIdAndProviderId.mockResolvedValue(
      mockClient,
    );

    // When - Running
    const result = await service.socialLogin(request);

    // Then - Verification
    expect(result.isNewUser).toBe(false);
    expect(mockAuthRepository.findProviderByProvider).toHaveBeenCalled();
  });
});
```

**Core principles**:

- ✅ Replace ports with mocks for complete isolation
- ✅ Fast tests without external dependencies
- ✅ Focus solely on business logic
- ✅ Use TestDataFactory to eliminate duplication

**Location**: `src/services/**/*.spec.ts`

---

### 3. Adapter Layer Tests (Integration)

**Objectives**: Validate integration with external systems (repositories, clients)  
**Characteristics**: Use a real database or Testcontainers

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
            // Test DB configuration
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
    // Clean up test data
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

**Core principles**:

- ✅ Test against a real database
- ✅ Clean state after each test
- ✅ Use transactions or Testcontainers
- ❌ Do not use mocks (verify real integration)

**Location**: `src/infrastructure/**/*.spec.ts`

---

### 4. E2E Tests

**Objectives**: Full system integration tests  
**Characteristics**: Configuration closely mirrors production

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

**Location**: `test/**/*.e2e-spec.ts`

---

## 🛠️ Test utilities

### TestDataFactory

Create consistent mock data:

```typescript
// Create provider
const provider = TestDataFactory.createMockProvider(AuthProvider.GOOGLE);

// Create user (defaults + override)
const user = TestDataFactory.createMockUser({ email: "custom@example.com" });

// Create SocialLoginRequest
const request = TestDataFactory.createSocialLoginRequest();
```

### MockPortFactory

Create port mocks easily:

```typescript
const mockRepository = MockPortFactory.createAuthRepositoryPort();
const mockTokenService = MockPortFactory.createAuthTokenPort();
const mockUserClient = MockPortFactory.createUserClientPort();
```

---

## 📝 Test authoring checklist

### ✅ Application layer (service) tests

- [ ] Replace all ports with mocks
- [ ] Happy path tests
- [ ] Error case tests
- [ ] Edge case tests
- [ ] Verify port calls (`toHaveBeenCalledWith`)
- [ ] Validate return values
- [ ] Use TestDataFactory

### ✅ Adapter layer (repository) tests

- [ ] Configure real DB connection
- [ ] Clean up after tests
- [ ] Verify CRUD operations
- [ ] Verify transaction behavior
- [ ] Validate unique constraints
- [ ] Validate foreign keys

### ✅ E2E tests

- [ ] Load the entire module
- [ ] Real gRPC communication
- [ ] Verify the end-to-end flow
- [ ] Verify error handling

---

## 🚀 Test commands

```bash
# Run all unit tests (auth microservice)
pnpm test:auth

# Watch mode
pnpm test:auth:watch

# Generate coverage report
pnpm test:auth:cov

# Run E2E tests
pnpm test:auth:e2e

# Run a specific test file
pnpm test:auth -- login.service.spec.ts
```

---

## 📊 Coverage targets

| Layer             | Target coverage |
| ----------------- | --------------- |
| Application Layer | 90%+            |
| Domain Layer      | 95%+            |
| Adapter Layer     | 80%+            |
| Overall           | 85%+            |

---

## 💡 Best practices

### 1. Use the AAA pattern

```typescript
it("should do something", () => {
  // Given (Arrange) - prepare test data
  const input = TestDataFactory.createMockUser();

  // When (Act) - act
  const result = service.doSomething(input);

  // Then (Assert) - assert
  expect(result).toBe(expected);
});
```

### 2. Use meaningful test names

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

### 3. One test per case

❌ Bad:

```typescript
it("should handle login and logout", () => {
  // login test
  // logout test — should be split
});
```

✅ Good:

```typescript
it('should handle login successfully', () => { ... });
it('should handle logout successfully', () => { ... });
```

### 4. Define mocks explicitly

```typescript
// ✅ Explicit mocks
mockRepository.findUser.mockResolvedValue(expectedUser);
mockRepository.findUser.mockRejectedValue(new Error("Not found"));

// ❌ Ambiguous mocks
mockRepository.findUser.mockReturnValue(Promise.resolve(null));
```

### 5. Test isolation

```typescript
afterEach(() => {
  jest.clearAllMocks(); // reset mock state
});

afterEach(async () => {
  await cleanDatabase(); // clean DB state
});
```

---

## 🔍 Debugging tips

### Jest debug mode

```bash
# Debug with VS Code
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug a specific test
npm test -- --testNamePattern="should login existing user"
```

### Inspect mock calls

```typescript
console.log(mockRepository.findUser.mock.calls);
console.log(mockRepository.findUser.mock.results);
```

---

## 📚 References

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Hexagonal Architecture Testing](https://alistair.cockburn.us/hexagonal-architecture/)
- [Test Double Patterns](https://martinfowler.com/bliki/TestDouble.html)
