# 🔐 JWT 검증 및 userId 추출 전략

## 요약

마이크로서비스 아키텍처에서 **Multi-Layer Validation** 전략을 사용합니다.

- **Guard (HTTP 계층)**: 가벼운 검증 (JWT 검증, userId 추출)
- **Service (비즈니스 계층)**: 깊은 검증 (gRPC 호출, 권한 확인)

---

## 🎯 왜 이 전략을 선택했나?

### 당신의 고민 분석

#### 💭 고민 1: "Guard에서 사용자 조회까지 처리하는게 좋을까?"

| 측면                    | Guard에서 처리 | Service에서 처리 |
| ----------------------- | -------------- | ---------------- |
| Guard 무게              | 무거움         | 가벼움           |
| 모든 요청마다 gRPC 호출 | ❌ 예          | ✅ 선택적        |
| 캐싱                    | 복잡함         | 용이함           |
| 마이크로서비스 원칙     | ❌ 위반        | ✅ 준수          |
| 테스트                  | 어려움         | 쉬움             |
| **권장**                | ❌             | ✅               |

#### 💭 고민 2: "Guard는 형식만 검증하고 Service에서 검증하는게 나을까?"

✅ **정확히 이 방식을 구현했습니다!**

```
Guard의 책임:
✅ JWT 서명 검증
✅ 토큰 만료 시간 확인
✅ userId 형식 검증
✅ req.user에 userId 설정

Service의 책임:
✅ gRPC로 사용자 조회
✅ 사용자 존재 여부 확인
✅ 권한/역할 검증
✅ 비즈니스 로직 검증
```

#### 💭 고민 3: "마이크로서비스 호출이 증가하는데 성능은?"

**해결 방법:**

1. **Redis 캐싱** (가장 효과적)
   - 사용자 정보를 1시간 캐싱
   - 첫 요청만 gRPC 호출, 이후는 캐시에서 조회

2. **배치 조회**
   - 여러 사용자 정보를 한 번에 조회

3. **Service 간 통신 최적화**
   - gRPC 커넥션 풀링
   - 압축 설정

---

## 📊 비교: 3가지 전략

### 전략 A: Guard에서 모든 검증 (❌ 비추천)

```typescript
@Injectable()
export class FullValidationGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = extractToken(request);
    const decoded = this.jwtService.verify(token);

    // ❌ Guard에서 gRPC 호출
    const user = await firstValueFrom(
      this.usersClient.findOneUser({ id: decoded.userId }),
    );

    if (!user) throw new NotFoundException();
    request.user = user;
    return true;
  }
}
```

**문제점:**

- Guard가 비대해짐
- 모든 요청마다 gRPC 호출 (성능 저하)
- 캐싱 구현이 복잡
- Guard가 비즈니스 로직에 의존
- 테스트 어려움

---

### 전략 B: Guard에서만 토큰 검증 (✅ 추천)

```typescript
@Injectable()
export class ExtractUserIdGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = extractToken(request);
    const decoded = this.jwtService.verify(token);

    // ✅ Guard는 토큰 검증만
    request.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    return true;
  }
}
```

**장점:**

- Guard가 가볍고 빠름
- 마이크로서비스 원칙 준수
- 각 서비스가 자신의 비즈니스 로직 검증
- 캐싱 용이
- 테스트 쉬움

**단점:**

- gRPC 호출이 필요한 경우 Service에서 처리 (하지만 캐싱으로 해결 가능)

---

### 전략 C: Guard에서 검증, 비동기 캐싱 (⚠️ 복잡함)

```typescript
@Injectable()
export class AsyncCachingGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = extractToken(request);
    const decoded = this.jwtService.verify(token);

    request.user = { userId: decoded.userId };

    // 비동기로 사용자 정보를 백그라운드에서 캐싱
    this.preloadUserToCache(decoded.userId);

    return true;
  }

  private async preloadUserToCache(userId: string) {
    try {
      const user = await firstValueFrom(
        this.usersClient.findOneUser({ id: userId }),
      );
      await this.cache.set(`user:${userId}`, user, 3600);
    } catch (error) {
      this.logger.warn(`Failed to preload user: ${userId}`);
    }
  }
}
```

**문제점:**

- 복잡한 로직
- Race condition 가능성
- 에러 처리 어려움

---

## 🏗️ 구현된 구조

### 파일 조직

```
apps/apis/src/infrastructure/auth/
├── auth.module.ts                    # 모듈 정의
├── extract-user-id.guard.ts          # JWT 검증 Guard
├── decorators/
│   └── extract-user-id.decorator.ts  # @Auth() Decorator
├── types/
│   └── authenticated-request.ts       # 타입 정의
└── README.md                          # 이 파일
```

### 흐름도

```
┌─────────────┐
│   Client    │
│  Request    │
└──────┬──────┘
       │
       │ Authorization: Bearer <token>
       ↓
┌──────────────────────────────────┐
│  @Auth() Decorator Applied       │ ← users.client.controller.ts
└────────────┬─────────────────────┘
             │
             ↓
┌──────────────────────────────────┐
│  ExtractUserIdGuard              │ ← extract-user-id.guard.ts
│  1. JWT 검증                      │
│  2. userId 추출                  │
│  3. req.user 설정                 │
└────────────┬─────────────────────┘
             │
             ├─ ✅ 토큰 유효
             │
             ↓
┌──────────────────────────────────┐
│  Controller Method               │
│  const { userId } = req.user     │
└────────────┬─────────────────────┘
             │
             ↓
┌──────────────────────────────────┐
│  Service                         │ ← users.client.service.ts
│  1. gRPC 호출 (캐싱 적용)         │
│  2. 사용자 존재 여부 확인          │
│  3. 권한 검증                    │
│  4. 비즈니스 로직                 │
└────────────┬─────────────────────┘
             │
             ↓
┌──────────────────────────────────┐
│  Response                        │
└──────────────────────────────────┘
```

---

## 🔧 구현 세부사항

### 1. ExtractUserIdGuard

**책임:**

- Authorization 헤더 파싱
- JWT 서명 검증
- userId 추출
- Request에 사용자 정보 첨부

**지원하는 토큰 형식:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**토큰 구조:**

```json
{
  "userId": "user-uuid-123",
  "email": "user@example.com",
  "type": "access",
  "iat": 1700000000,
  "exp": 1700003600
}
```

### 2. @Auth() Decorator

**사용법:**

```typescript
@Get('me')
@Auth()
async getProfile(@Req() req: AuthenticatedRequest) {
  const { userId } = req.user;
  return this.usersService.findOneUser({ id: userId });
}
```

### 3. AuthenticatedRequest 타입

```typescript
interface AuthenticatedRequest extends Express.Request {
  user: {
    userId: string;
    email?: string;
    type?: "access" | "refresh";
  };
}
```

---

## 🚀 실제 사용 예시

### 예시 1: 프로필 조회

```typescript
@Get('me')
@Auth()
async getProfile(@Req() req: AuthenticatedRequest): Observable<User> {
  // Guard에서 req.user.userId 자동 설정
  const { userId } = req.user;

  // Service는 gRPC로 사용자 조회
  return this.usersService.findOneUser({ id: userId });
}
```

### 예시 2: 자신의 정보 수정 (권한 확인)

```typescript
@Patch('me')
@Auth()
async updateProfile(
  @Req() req: AuthenticatedRequest,
  @Body() dto: UpdateUserDto,
): Observable<User> {
  const { userId } = req.user;

  // Service에서 권한 확인
  return this.usersService.updateUser({ id: userId, ...dto });
}
```

### 예시 3: 다른 사용자 정보 수정 (권한 거부)

```typescript
@Patch(':id')
@Auth()
async updateOtherUser(
  @Param('id') id: string,
  @Req() req: AuthenticatedRequest,
  @Body() dto: UpdateUserDto,
): Observable<User> {
  const { userId } = req.user;

  // 권한 확인
  if (userId !== id) {
    throw new ForbiddenException('Cannot update other users');
  }

  return this.usersService.updateUser({ id, ...dto });
}
```

---

## ⚡ 성능 최적화

### 1️⃣ Redis 캐싱 (권장)

Service에서 사용자 정보를 캐싱:

```typescript
@Injectable()
export class UsersClientService {
  async findOneUser(request: FindOneUserRequest): Observable<User> {
    // 캐시 확인
    const cached = await this.cache.get(`user:${request.id}`);
    if (cached) {
      this.logger.debug(`Cache hit for user: ${request.id}`);
      return cached;
    }

    // gRPC 호출
    const user = await firstValueFrom(this.usersQuery.findOneUser(request));

    if (!user) {
      throw new NotFoundException(`User ${request.id} not found`);
    }

    // 캐시 저장 (1시간)
    await this.cache.set(`user:${request.id}`, user, 3600);

    return user;
  }
}
```

**영향:**

- 첫 요청: gRPC 호출 (~10ms)
- 이후 요청: 캐시 조회 (~1ms)
- **성능: 10배 향상**

### 2️⃣ Connection Pooling

gRPC 클라이언트 설정 (이미 구현됨):

```typescript
channelOptions: {
  "grpc.keepalive_time_ms": 20_000,
  "grpc.keepalive_timeout_ms": 5_000,
  "grpc.max_receive_message_length": 20 * 1024 * 1024,
}
```

### 3️⃣ 배치 조회

여러 사용자를 한 번에 조회:

```typescript
// Proto 정의 필요 (선택적)
async findByIds(request: FindUsersByIdsRequest): Observable<UserList> {
  return this.usersQuery.findByIds(request);
}
```

---

## 🧪 테스트

### 테스트 1: Guard 검증

```typescript
describe("ExtractUserIdGuard", () => {
  it("should extract userId from valid token", async () => {
    const validToken = generateValidToken({ userId: "user-123" });
    const context = createMockContext({
      headers: { authorization: `Bearer ${validToken}` },
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(context.getRequest().user.userId).toBe("user-123");
  });

  it("should throw for invalid token", async () => {
    const context = createMockContext({
      headers: { authorization: "Bearer invalid-token" },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
```

### 테스트 2: Controller 통합 테스트

```typescript
describe("UsersController with @Auth()", () => {
  it("should call service with userId from guard", async () => {
    const validToken = generateValidToken({ userId: "user-123" });

    const result = await request(app.getHttpServer())
      .get("/users/me")
      .set("Authorization", `Bearer ${validToken}`);

    expect(result.status).toBe(200);
    expect(result.body.id).toBe("user-123");
  });

  it("should return 401 for missing token", async () => {
    const result = await request(app.getHttpServer()).get("/users/me");

    expect(result.status).toBe(401);
  });
});
```

---

## 🔍 디버깅

### 토큰 디코딩 (jwt.io 활용)

```bash
# 토큰 구조 확인
curl -H "Authorization: Bearer <token>" http://localhost:3000/users/me

# jwt.io에서 디코딩:
# 1. https://jwt.io 접속
# 2. 토큰 붙여넣기
# 3. Payload 확인
```

### 환경 변수 확인

```bash
# 1. JWT_SECRET 확인
echo $JWT_SECRET

# 2. 토큰 만료 시간 확인
echo $JWT_EXPIRATION

# 3. Guard 디버그 로그
# 로그에서 "User extracted from token" 메시지 확인
```

### 토큰 생성 확인

```typescript
// 토큰 생성 위치
// apps/auth/src/infrastructure/tokens/tokens.util.ts

const payload = {
  userId: user.userId, // 이 필드가 필수
  email: user.email,
  type: isAccessToken ? "access" : "refresh",
};
```

---

## 📚 참고 자료

### 관련 파일

- 토큰 생성: `apps/auth/src/infrastructure/tokens/tokens.util.ts`
- gRPC 클라이언트: `apps/apis/src/infrastructure/grpc/`
- Users 서비스: `apps/users/src/`

### 환경 변수

```bash
JWT_SECRET=your-secret-key
JWT_EXPIRATION=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRATION=7d
```

### 마이크로서비스 통신

- **프로토콜**: gRPC
- **직렬화**: Protobuf
- **보안**: mTLS (인증서 기반)

---

## ❓ FAQ

### Q: Guard에서 에러가 발생하면 어떻게 되나요?

A: NestJS가 자동으로 401 Unauthorized 응답을 반환합니다.

```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "error": "Unauthorized"
}
```

### Q: 토큰이 없으면 어떻게 되나요?

A: Guard에서 `UnauthorizedException`을 던집니다.

```json
{
  "statusCode": 401,
  "message": "No token provided",
  "error": "Unauthorized"
}
```

### Q: 권한 검증은 어디서 하나요?

A: Service에서 처리합니다. Guard는 userId만 추출합니다.

```typescript
// Service에서 권한 확인
if (userId !== targetUserId) {
  throw new ForbiddenException("Cannot update other users");
}
```

### Q: 토큰 갱신은 어떻게 하나요?

A: 별도의 엔드포인트에서 처리합니다 (이 문서 범위 밖).

```typescript
@Post('refresh')
async refreshToken(@Body() dto: RefreshTokenDto) {
  // Refresh token으로 새로운 access token 발급
  return this.authService.refreshToken(dto.refreshToken);
}
```

---

## 🎓 결론

### 핵심 원칙

1. **Guard는 가볍게** - JWT 검증만
2. **Service는 깊게** - 비즈니스 로직 검증
3. **캐싱은 필수** - gRPC 호출 최소화
4. **에러 처리는 명확하게** - 401 vs 403 vs 404

### 다음 단계

1. ✅ Guard 구현 (완료)
2. 📝 Controller에 @Auth() 적용
3. 🧪 통합 테스트 작성
4. 🚀 배포

---

**작성일:** 2024년
**최종 수정:** 2024년
