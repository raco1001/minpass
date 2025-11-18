# Auth Service 테스트 코드 수정 요약

## 🎯 변경 사항

### 1. **LoginService 테스트 (`login.service.spec.ts`)**

#### 추가된 모킹
```typescript
// ✅ upsertAuthTokens 모킹 추가
authRepository.upsertAuthTokens.mockResolvedValue(mockTokenInfo);
```

#### 수정된 테스트 케이스

**Existing User Login:**
- ✅ `should return tokens for existing user` - upsertAuthTokens 모킹 추가
- ✅ `SocialLogin should be successful for existing user with KAKAO provider` - upsertAuthTokens 모킹 추가

**Error Cases:**
- ✅ `should throw an error if token upsert fails` - 에러 메시지 변경
  - 이전: "Failed to upsert auth tokens"
  - 이후: "Failed to update auth tokens"
- ✅ upsertAuthTokens mock 반환값을 `null`로 설정

**Edge Cases:**
- ✅ `should handle user with multiple accounts from the same provider` - upsertAuthTokens 모킹 추가
- ✅ `should handle social profile with no email` - createAuthToken 모킹 추가

### 2. **Repository 테스트 (`mariadb.repository.spec.ts`)**

#### 새로운 테스트 추가: `upsertAuthTokens`

**Test 1: INSERT 동작**
```typescript
it("should create a new auth token when it doesn't exist (INSERT)", async () => {
  // authClientId가 없을 때 새 토큰 생성
  const result = await repository.upsertAuthTokens(upsertRequest);
  
  expect(result).toBeDefined();
  expect(result?.authClientId).toBe(authClient.id);
  expect(result?.revoked).toBe(false);
});
```

**Test 2: UPDATE 동작 (중요)**
```typescript
it("should update an existing auth token (UPDATE on duplicate)", async () => {
  // 첫 번째 upsert - INSERT
  const firstResult = await repository.upsertAuthTokens(firstUpsertRequest);
  
  // 두 번째 upsert - UPDATE (동일한 authClientId)
  const secondResult = await repository.upsertAuthTokens(secondUpsertRequest);
  
  // 같은 authClientId에서는 기존 토큰이 업데이트됨
  expect(secondResult?.authClientId).toBe(authClient.id);
  expect(secondResult?.revoked).toBe(false);
});
```

**Test 3: FK 제약 조건 처리**
```typescript
it("should return null if upsert result cannot be found", async () => {
  // 존재하지 않는 authClientId로 upsert 시도
  const result = await repository.upsertAuthTokens({
    authClientId: "00000000-0000-7000-0000-000000000000",
    // ...
  });
  
  expect(result).toBeNull();
});
```

### 3. **Test Helper 수정 (`test-helpers.ts`)**

```typescript
// ✅ MockPortFactory에 upsertAuthTokens 추가
static createAuthRepositoryPort() {
  return {
    findProviderByProvider: jest.fn(),
    findAuthClientByClientIdAndProviderId: jest.fn(),
    findAuthTokenInfoByClientId: jest.fn(),
    createAuthClient: jest.fn(),
    createAuthToken: jest.fn(),
    updateAuthClientTimestamp: jest.fn(),
    updateAuthTokens: jest.fn(),
    upsertAuthTokens: jest.fn(), // ✅ 새로 추가
  };
}
```

## 🔄 Upsert 로직 개선

### 이전 방식 (문제점)
```typescript
// ❌ PRIMARY KEY 기반 upsert
await db.insert(authTokens)
  .values({ 
    id: uuidv7(), // 매번 새로운 ID
    authClientId: authTokenInfo.authClientId,
  })
  .onDuplicateKeyUpdate({ ... });
```

### 개선된 방식 (authClientId 기반) ✅
```typescript
// Step 1: authClientId로 기존 토큰 조회
const existingToken = await db
  .select({ id: authTokens.id })
  .from(authTokens)
  .where(eq(authTokens.authClientId, authTokenInfo.authClientId))
  .then((tokens) => tokens[0] ?? null);

if (existingToken) {
  // Step 2-1: 기존 토큰이 있으면 UPDATE
  await db.update(authTokens)
    .set({ /* updated fields */ })
    .where(eq(authTokens.id, existingToken.id));
} else {
  // Step 2-2: 없으면 INSERT
  await db.insert(authTokens)
    .values({ id: uuidv7(), authClientId, /* ... */ });
}

// Step 3: 결과 조회
const result = await db.select(...)
  .where(eq(authTokens.authClientId, authTokenInfo.authClientId));
```

## ✅ 테스트 범위

| 계층 | 테스트 유형 | 커버리지 |
|------|-----------|---------|
| **Service** | Unit | ✅ 8개 기존 테스트 + 모킹 개선 |
| **Repository** | Integration | ✅ 3개 새 테스트 (INSERT/UPDATE/FK) |
| **Helpers** | Foundation | ✅ MockPortFactory 확장 |

## 🚀 실행 방법

### 모든 테스트 실행
```bash
npm test -- apps/auth
```

### 특정 테스트 실행
```bash
# LoginService 테스트
npm test -- apps/auth/src/services/login.service.spec.ts

# Repository 테스트
npm test -- apps/auth/src/infrastructure/repositories/persistence/mariadb/mariadb.repository.spec.ts
```

### Watch 모드
```bash
npm test -- apps/auth --watch
```

## 📊 테스트 결과 기대값

```
✓ LoginService (Unit) - 8 tests
  ✓ existing user login (2 tests)
  ✓ new user registration (2 tests)
  ✓ error cases (3 tests)
  ✓ edge cases (1 test)

✓ MariadbRepository (Integration) - 6 tests
  ✓ findProviderByProvider (2 tests)
  ✓ createAuthClient (1 test)
  ✓ findAuthClientByClientIdAndProviderId (1 test)
  ✓ upsertAuthTokens (3 tests) ← NEW

TOTAL: 14 tests ✓
```

## 🔍 검증 포인트

### LoginService
- ✅ 기존 사용자 로그인 시 upsertAuthTokens 호출 검증
- ✅ 새 사용자 등록 시 createAuthToken 호출 검증
- ✅ 토큰 upsert 실패 시 예외 처리
- ✅ 다양한 OAuth provider 지원 (Google, Kakao, GitHub)

### Repository
- ✅ authClientId 기준 INSERT (새 토큰)
- ✅ authClientId 기준 UPDATE (기존 토큰)
- ✅ FK 제약 조건 처리 (존재하지 않는 authClientId)

## 📝 주요 개선 사항

1. **명확한 의도**: authClientId를 명시적으로 기준으로 upsert
2. **단일 책임**: 조회 → 판단 → 실행 로직 분리
3. **테스트 가능성**: 각 단계를 명확히 테스트 가능
4. **일관성**: 모든 테스트에서 동일한 패턴 사용

