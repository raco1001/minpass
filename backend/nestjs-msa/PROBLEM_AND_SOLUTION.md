# 🔧 발생한 문제와 해결책

## 📌 개요

Guard 구현 과정에서 발생한 **2가지 문제**를 상세히 분석하고 해결했습니다.

- **문제 1**: Guard 의존성 해결 실패
- **문제 2**: UsersGrpcClientAdapter 타입 오류

---

## 🚨 문제 1: Guard 의존성 해결 실패

### 증상

```
ERROR [ExceptionHandler] UnknownDependenciesException [Error]:
Nest can't resolve dependencies of the ExtractUserIdGuard (?, ConfigService).
Please make sure that the argument JwtService at index [0] is available in the HttpModule context.
```

### 원인 분석

```
의존성 체인:
UserController
  └─ @Auth() Decorator
      └─ ExtractUserIdGuard
          ├─ JwtService ← ❌ 찾을 수 없음
          └─ ConfigService ← ✅ 찾음
```

**왜 JwtService를 찾을 수 없었나?**

```
❌ 잘못된 구조:
InfrastructureModule
  └─ AuthModule
      ├─ imports: [JwtModule]
      ├─ providers: [ExtractUserIdGuard]
      └─ exports: [ExtractUserIdGuard, JwtModule]

HttpModule (Guard가 필요함)
  ├─ imports: [ServiceModule, AuthProviderModule]
  └─ ❌ AuthModule을 import하지 않음!
      → ExtractUserIdGuard 사용 불가
      → JwtService 찾을 수 없음
```

### 해결책

**HttpModule에 AuthModule을 import 추가:**

```typescript
@Module({
  imports: [
    ServiceModule,
    AuthProviderModule.register(),
    AuthModule, // ✅ 이 줄 추가!
  ],
  controllers: [UsersClientController, AuthClientController],
})
export class HttpModule {}
```

### 왜 이것이 해결책인가?

```
✅ 올바른 의존성 체인:
HttpModule
  ├─ imports: [AuthModule] ← Guard 제공
  │
  ├─ AuthModule
  │   ├─ imports: [JwtModule]
  │   ├─ providers: [ExtractUserIdGuard]
  │   └─ exports: [JwtModule]
  │
  └─ controllers: [UsersClientController]
      └─ @Auth() Decorator
          └─ ExtractUserIdGuard
              ├─ JwtService ✅ 찾음
              └─ ConfigService ✅ 찾음
```

---

## 🚨 문제 2: UsersGrpcClientAdapter 타입 오류

### 증상

```typescript
ERROR in ./apps/apis/src/infrastructure/grpc/clients/users/users.grpc.client.adapter.ts:9:14
TS2720: Class 'UsersGrpcClientAdapter' incorrectly implements class 'UsersQueryPort'.
Did you mean to extend 'UsersQueryPort' and inherit its members as a subclass?
```

### 원인 분석

**Port 정의:**

```typescript
// ✅ Abstract class로 정의됨
export abstract class UsersQueryPort implements Partial<UsersServiceClient> {
  abstract findMeUser(userId: string): Observable<User>; // ← 주목!
  abstract findAllUsers(): Observable<UserList>;
  abstract findOneUser(request: FindOneUserRequest): Observable<User>;
}
```

**Adapter 구현 (잘못됨):**

```typescript
// ❌ 잘못된 방식: implements 사용
export class UsersGrpcClientAdapter
  implements UsersQueryPort, UsersCommandPort {
  // ❌ 이것이 문제
  // ...
}
```

**문제:**

1. `UsersQueryPort`는 **abstract class** (클래스)
2. `implements`는 **interface** (인터페이스)와 함께 사용
3. Abstract class를 상속받을 때는 `extends` 사용
4. TypeScript는 abstract 메서드 구현을 강제로 확인

### 해결책

**Abstract class를 상속하도록 수정:**

```typescript
// ✅ 올바른 방식: extends 사용
@Injectable() // ← 상속
// ← 인터페이스 구현
export class UsersGrpcClientAdapter
  extends UsersQueryPort
  implements UsersCommandPort
{
  constructor(
    @Inject(USERS_SERVICE_CLIENT)
    private readonly client: users.UsersServiceClient,
  ) {
    super(); // ← Abstract class 초기화
  }

  // 모든 abstract 메서드 구현...
}
```

### 왜 이것이 해결책인가?

```
TypeScript 상속 규칙:

interface MyInterface {
  method1(): void;
}

abstract class MyAbstractClass {
  abstract method2(): void;
}

// ✅ 올바른 사용
class MyClass
  extends MyAbstractClass     // ← abstract 클래스 상속
  implements MyInterface      // ← 인터페이스 구현
{
  method2(): void { /* ... */ }
  method1(): void { /* ... */ }
}
```

---

## 📊 문제 비교 및 영향도

| 문제         | 심각도  | 원인           | 해결 난이도   |
| ------------ | ------- | -------------- | ------------- |
| Guard 의존성 | 🔴 높음 | 모듈 설정 누락 | 🟢 쉬움 (1줄) |
| Adapter 타입 | 🟡 중간 | 타입 사용 오류 | 🟢 쉬움 (2줄) |

---

## ✅ 수정 전후 비교

### 문제 1: Guard 의존성

```typescript
// ❌ Before
@Module({
  imports: [ServiceModule, AuthProviderModule.register()],
  exports: [],
  providers: [],
  controllers: [UsersClientController, AuthClientController],
})
export class HttpModule {}

// ✅ After
@Module({
  imports: [ServiceModule, AuthProviderModule.register(), AuthModule],
  exports: [],
  providers: [],
  controllers: [UsersClientController, AuthClientController],
})
export class HttpModule {}
```

**변경 사항:**

- `AuthModule` import 추가 (1줄)
- 결과: Guard가 필요한 JwtService를 찾을 수 있음

---

### 문제 2: Adapter 타입

```typescript
// ❌ Before
@Injectable() // ❌ implements 사용
export class UsersGrpcClientAdapter
  implements UsersQueryPort, UsersCommandPort
{
  constructor(
    @Inject(USERS_SERVICE_CLIENT)
    private readonly client: users.UsersServiceClient,
  ) {}
}

// ✅ After
@Injectable() // ✅ extends 사용
export class UsersGrpcClientAdapter
  extends UsersQueryPort
  implements UsersCommandPort
{
  constructor(
    @Inject(USERS_SERVICE_CLIENT)
    private readonly client: users.UsersServiceClient,
  ) {
    super(); // ✅ Abstract 클래스 초기화
  }
}
```

**변경 사항:**

- `implements`를 `extends`로 변경 (1줄)
- `super()` 호출 추가 (1줄)
- 결과: TypeScript 타입 체크 통과

---

## 🎯 Guard의 독립성 보장

### 문제 1, 2 해결 후 Guard 상태

```
✅ Guard 의존성 (최소화됨)
  ├─ JwtService (JWT 검증용) ✅
  └─ ConfigService (환경변수 조회용) ✅
  ❌ UsersService (의존하지 않음)
  ❌ 비즈니스 로직 (의존하지 않음)

✅ Guard는 완전히 독립적
  ├─ HTTP 계층만 담당
  ├─ JWT 검증만 수행
  ├─ userId 추출만 수행
  └─ Service 호출 없음

✅ 즉시 사용 가능
  @Get('me')
  @Auth()  // ← Guard만으로 작동
  async getMe(@Req() req: AuthenticatedRequest) {
    return req.user.userId;  // ✅ Guard가 설정함
  }
```

---

## 🚀 현재 상태

### ✅ 해결 완료

| 항목         | 상태    | 파일                           |
| ------------ | ------- | ------------------------------ |
| Guard 의존성 | ✅ 수정 | `http.module.ts`               |
| Adapter 타입 | ✅ 수정 | `users.grpc.client.adapter.ts` |
| Guard 독립성 | ✅ 검증 | `GUARD_INDEPENDENCE_CHECK.md`  |
| Linter 검증  | ✅ 통과 | 모든 파일                      |

### 📝 다음 단계 (Guard와 무관)

| 단계 | 작업            | 상태     |
| ---- | --------------- | -------- |
| 1    | Guard 기본 기능 | ✅ 완료  |
| 2    | Service 통합    | 📝 할 일 |
| 3    | 캐싱 최적화     | 📝 할 일 |
| 4    | E2E 테스트      | 📝 할 일 |

---

## 📚 관련 문서

| 문서                                                                                  | 용도                   |
| ------------------------------------------------------------------------------------- | ---------------------- |
| `GUARD_INDEPENDENCE_CHECK.md`                                                         | Guard 독립성 상세 검증 |
| `apps/apis/src/infrastructure/auth/README.md`                                         | Guard 전략 설명        |
| `apps/apis/src/presentation/http/controllers/handlers/tokens/IMPLEMENTATION_GUIDE.md` | 구현 가이드            |
| `GUARD_STRATEGY_SUMMARY.md`                                                           | 종합 가이드            |

---

## 🎓 배운 점

### 1. NestJS 모듈 의존성

```
- Module A에서 Provider를 정의하려면
- 그 Provider를 사용하는 Module B는
- Module A를 import해야 함

HttpModule
  ├─ imports: [AuthModule] ← 필수!
  └─ controllers: [UsersController]
      └─ @Auth() ← AuthModule의 ExtractUserIdGuard 사용
```

### 2. TypeScript 타입 구조

```
interface:     구조만 정의 → implements 사용
abstract class: 구조 + 기본 로직 정의 → extends 사용
class:         완전한 구현 → extends만 사용

abstract class ← extends로 상속 ✅
interface     ← implements로 구현 ✅
```

### 3. Guard 설계 원칙

```
✅ Guard는 가벼워야 함 (의존성 최소)
✅ Guard는 단일 책임 (JWT 검증만)
✅ Guard는 독립적 (Service 호출 안 함)
❌ Guard는 비즈니스 로직을 포함하면 안 됨
```

---

## 🎉 결론

### 현재 상황

Guard는 **완벽하게 독립적**이며 **지금 바로 사용 가능**합니다.

```typescript
// 어디서나 이렇게 사용 가능
@Get('any-endpoint')
@Auth()  // ✅ Guard가 독립적으로 작동
async anyMethod(@Req() req: AuthenticatedRequest) {
  return req.user.userId;  // ✅ userId 자동 설정
}
```

### 다음 계획

Guard 기본 기능은 완료되었으므로, 다음 단계에서:

1. Service 통합 (Guard + Service 조합)
2. 성능 최적화 (Redis 캐싱)
3. 고급 기능 (권한 검증, 역할 기반 제어)

---

**모든 문제가 해결되었습니다! 🎊**


