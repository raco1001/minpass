# 🔐 JWT Guard 및 userId 추출 구현 가이드

## 📋 목차

1. [전략 개요](#전략-개요)
2. [파일 구조](#파일-구조)
3. [구현된 컴포넌트](#구현된-컴포넌트)
4. [사용 방법](#사용-방법)
5. [마이그레이션 체크리스트](#마이그레이션-체크리스트)

---

## 전략 개요

### 선택된 전략: "Multi-Layer Validation"

#### Guard의 책임 (HTTP 계층)

✅ JWT 서명 검증
✅ 토큰 만료 시간 확인
✅ userId 추출 및 기본 형식 검증
✅ Request 객체에 userId 첨부

#### 서비스의 책임 (비즈니스 로직 계층)

✅ gRPC를 통한 사용자 존재 여부 확인
✅ 사용자 권한/역할 검증
✅ 비즈니스 로직 검증

### 왜 이 전략인가?

```
장점:
✅ Guard가 가볍고 빠름 (모든 요청에 빠른 응답)
✅ 마이크로서비스 원칙 준수 (관심사 분리)
✅ 캐싱이 용이 (서비스에서 사용자 정보 캐싱 가능)
✅ 확장성 (새로운 검증은 각 서비스에서 독립적으로 추가)
✅ 테스트 용이 (Guard와 서비스 로직 분리)

단점 (해결 방법):
⚠️ gRPC 호출 증가 → Redis 캐싱으로 해결
```

---

## 파일 구조

```
apps/apis/src/
├── infrastructure/
│   └── auth/
│       ├── auth.module.ts                          # 인증 모듈
│       ├── extract-user-id.guard.ts                # JWT 검증 Guard
│       ├── decorators/
│       │   └── extract-user-id.decorator.ts        # @Auth() Decorator
│       ├── types/
│       │   └── authenticated-request.ts            # 타입 정의
│       └── README.md                               # 상세 문서
├── presentation/
│   └── http/
│       └── controllers/
│           ├── users/
│           │   └── users.client.controller.ts      # userId 사용 예시
│           └── handlers/
│               └── tokens/
│                   ├── token.guard.ts              # 전략 문서
│                   └── IMPLEMENTATION_GUIDE.md     # 이 파일
└── services/
    └── users.client.service.ts                     # gRPC 호출
```

---

## 구현된 컴포넌트

### 1. ExtractUserIdGuard

**위치:** `apps/apis/src/infrastructure/auth/extract-user-id.guard.ts`

```typescript
@Injectable()
export class ExtractUserIdGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1️⃣ Authorization 헤더에서 토큰 추출
    // 2️⃣ JWT 서명 검증
    // 3️⃣ userId 추출
    // 4️⃣ req.user에 첨부

    return true;
  }
}
```

**기능:**

- Authorization 헤더에서 Bearer 토큰 추출
- JWT 서명 검증 (JWT_SECRET 사용)
- 토큰 만료 시간 확인
- userId 추출 및 검증
- Request 객체에 사용자 정보 첨부

**지원 형식:**

- `Authorization: Bearer <token>`
- 선택적: Cookie의 `accessToken`

---

### 2. @Auth() Decorator

**위치:** `apps/apis/src/infrastructure/auth/decorators/extract-user-id.decorator.ts`

```typescript
export function Auth() {
  return applyDecorators(UseGuards(ExtractUserIdGuard));
}
```

**사용법:**

```typescript
@Get('me')
@Auth()
async getProfile(@Req() req: AuthenticatedRequest) {
  const { userId } = req.user;
  return this.usersService.getUserProfile(userId);
}
```

---

### 3. AuthenticatedRequest 타입

**위치:** `apps/apis/src/infrastructure/auth/types/authenticated-request.ts`

```typescript
export interface AuthenticatedRequest extends Express.Request {
  user: {
    userId: string;
    email?: string;
    type?: "access" | "refresh";
  };
}
```

---

### 4. AuthModule

**위치:** `apps/apis/src/infrastructure/auth/auth.module.ts`

JWT 검증 관련 모든 기능을 제공하는 NestJS 모듈

---

## 사용 방법

### Step 1: Controller에 @Auth() Decorator 적용

```typescript
import { Controller, Get, Req } from "@nestjs/common";
import { Auth } from "@apis/infrastructure/auth/decorators/extract-user-id.decorator";
import { AuthenticatedRequest } from "@apis/infrastructure/auth/types/authenticated-request";

@Controller("users")
export class UsersClientController {
  constructor(
    @Inject(UsersClientServicePort)
    private readonly usersService: UsersClientServicePort,
  ) {}

  @Get("me")
  @Auth() // 👈 이것만 추가하면 됨
  findMeUser(@Req() req: AuthenticatedRequest): Observable<users.User> {
    const { userId } = req.user; // Guard에서 설정됨
    return this.usersService.findOneUser({ id: userId });
  }
}
```

### Step 2: Service에서 사용자 정보 확인

```typescript
@Injectable()
export class UsersClientService implements UsersClientServicePort {
  constructor(
    @Inject(UsersQueryPort)
    private readonly usersQuery: UsersQueryPort,
  ) {}

  async getUserProfile(userId: string): Promise<User> {
    // gRPC로 users 서비스에 요청
    const user = await firstValueFrom(
      this.usersQuery.findOneUser({ id: userId }),
    );

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    return user;
  }
}
```

### Step 3: 요청 처리

```bash
# Request (클라이언트에서)
curl -H "Authorization: Bearer <jwt_token>" http://localhost:3000/users/me

# 처리 흐름
1. @Auth() Decorator 적용
2. ExtractUserIdGuard 실행
   ├─ JWT 검증
   ├─ userId 추출
   └─ req.user = { userId, email, type }
3. Controller 메서드 실행
   └─ req.user.userId 사용 가능
4. Service 호출
   ├─ gRPC로 users 서비스에 요청
   ├─ 사용자 존재 여부 확인
   └─ 사용자 정보 반환
5. Response 반환
```

---

## 마이그레이션 체크리스트

### Phase 1: 검증 (현재 상태)

- ✅ Guard 구현 완료
- ✅ Decorator 구현 완료
- ✅ AuthModule 등록 완료
- ✅ 타입 정의 완료

### Phase 2: 적용 (다음 단계)

- [ ] UsersController에 @Auth() 적용
- [ ] 필요한 모든 엔드포인트에 @Auth() 적용
- [ ] 기존 getUser() 메서드 제거 또는 대체

### Phase 3: 테스트

- [ ] JWT 검증 테스트
- [ ] userId 추출 테스트
- [ ] 무효한 토큰 처리 테스트
- [ ] 만료된 토큰 처리 테스트
- [ ] 서비스 호출 테스트

### Phase 4: 배포

- [ ] 모든 테스트 통과
- [ ] 환경 변수 확인 (JWT_SECRET)
- [ ] 로깅 추가
- [ ] 모니터링 설정

---

## 구체적인 예시

### 예시 1: 사용자 프로필 조회

```typescript
// Before
@Get('me')
async findMeUser(@Req() req: any): Observable<users.User> {
  // req.user가 없을 수 있음
  const userId = this.usersService.getUser().id; // ❌ 잘못됨
  return this.usersService.findOneUser({ id: userId });
}

// After
@Get('me')
@Auth()
async findMeUser(@Req() req: AuthenticatedRequest): Observable<users.User> {
  const { userId } = req.user; // ✅ Guard에서 안전하게 설정됨
  return this.usersService.findOneUser({ id: userId });
}
```

### 예시 2: 사용자 정보 수정

```typescript
@Patch(':id')
@Auth()
async updateUser(
  @Param('id') id: string,
  @Body() request: Omit<users.UpdateUserRequest, 'id'>,
  @Req() req: AuthenticatedRequest,
): Observable<users.User> {
  const { userId } = req.user;

  // 권한 확인 (자신의 정보만 수정 가능)
  if (userId !== id) {
    throw new ForbiddenException('Cannot update other users');
  }

  return this.usersService.updateUser({ id, ...request });
}
```

### 예시 3: 모든 사용자 조회 (관리자 권한 필요)

```typescript
@Get()
@Auth()
async findAllUsers(@Req() req: AuthenticatedRequest): Observable<users.UserList> {
  const { userId } = req.user;

  // 서비스에서 사용자 권한 확인
  const user = await firstValueFrom(
    this.usersService.findOneUser({ id: userId })
  );

  // 관리자 권한 확인 (예시)
  if (user.role !== 'admin') {
    throw new ForbiddenException('Only admins can view all users');
  }

  return this.usersService.findAllUsers();
}
```

---

## 트러블슈팅

### Q: "No token provided" 에러

**원인:** Authorization 헤더가 없거나 잘못된 형식

```bash
# ❌ 잘못된 형식
curl http://localhost:3000/users/me
curl -H "Authorization: <token>" http://localhost:3000/users/me

# ✅ 올바른 형식
curl -H "Authorization: Bearer <token>" http://localhost:3000/users/me
```

### Q: "Invalid or expired token" 에러

**원인:**

1. JWT_SECRET 설정이 잘못됨
2. 토큰이 만료됨
3. 토큰이 손상됨

**해결:**

```bash
# 1. 환경 변수 확인
echo $JWT_SECRET

# 2. 토큰 만료 시간 확인
# 토큰 페이로드 확인 (jwt.io에서)

# 3. 새 토큰 생성
```

### Q: "Invalid token payload" 에러

**원인:** 토큰에 userId가 없음

**해결:**

- 토큰 생성 로직 확인 (apps/auth/src/infrastructure/tokens/tokens.util.ts)
- 페이로드에 userId 포함 여부 확인

### Q: 사용자 조회 후에도 권한이 확인되지 않음

**원인:** 권한 검증이 Guard에서 이루어지지 않음 (의도된 설계)

**해결:** Service에서 권한 검증 추가

```typescript
async updateUser(userId: string, id: string, request: UpdateUserRequest) {
  // 권한 확인
  if (userId !== id) {
    throw new ForbiddenException('Cannot update other users');
  }

  // 비즈니스 로직
  return this.usersService.updateUser({ id, ...request });
}
```

---

## 성능 최적화

### 1. Redis 캐싱 (권장)

```typescript
@Injectable()
export class UsersClientService implements UsersClientServicePort {
  constructor(
    @Inject(UsersQueryPort)
    private readonly usersQuery: UsersQueryPort,
    private readonly cache: CacheService,
  ) {}

  async getUserProfile(userId: string): Promise<User> {
    // 캐시 확인
    const cached = await this.cache.get(`user:${userId}`);
    if (cached) {
      return cached;
    }

    // gRPC 호출
    const user = await firstValueFrom(
      this.usersQuery.findOneUser({ id: userId }),
    );

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // 캐시 저장 (1시간)
    await this.cache.set(`user:${userId}`, user, 3600);
    return user;
  }
}
```

### 2. 배치 조회

```typescript
async getUsersProfile(userIds: string[]): Promise<User[]> {
  // 여러 사용자를 한 번에 조회
  return firstValueFrom(
    this.usersQuery.findByIds({ ids: userIds })
  );
}
```

---

## 참고 자료

- JWT 토큰 구조: `apps/auth/src/infrastructure/tokens/tokens.util.ts`
- 토큰 생성 시간: `apps/auth/src/infrastructure/tokens/tokens.ts`
- 환경 변수: `.env` 파일의 `JWT_SECRET`, `JWT_EXPIRATION`
- 마이크로서비스 통신: `apps/apis/src/infrastructure/grpc/`

---

## 다음 단계

1. ✅ Guard 구현 및 등록 (완료)
2. 📝 Controller에 @Auth() 적용
3. 🧪 통합 테스트 작성
4. 🚀 배포
